import jwt from "jsonwebtoken";
import section from "../models/section.js";
import student from "../models/student.js";
import coordinatorAssignment from "../models/coordinatorAssignment.js";
import { enrolmentRequest } from "../models/index.js";
import { isErpCoordinator, checkErpCoordinatorScope } from "../services/coordinatorAssignmentService.js";
import AppError from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Role hierarchy (higher number = higher privilege)
const roleHierarchy = {
  "admin": 100,
  "deanAcademics": 90,
  "departmentDean": 85,
  "hod": 80,
  "assistantHod": 70,
  "erpCoordinator": 60, // Assigned role, not base role
  "faculty": 50,
  "mentor": 50,
  "office": 40,
  "certificateSection": 40,
  "placementCell": 40,
  "student": 10
};

/**
 * Get role hierarchy level (higher = more privileged)
 * @param {String} role - User role
 * @returns {Number} Hierarchy level (0 if role not found)
 */
const getRoleLevel = (role) => {
  return roleHierarchy[role] || 0;
};

/**
 * Check if userRole can modify data created/modified by targetRole
 * Lower roles cannot modify data from higher roles
 * @param {String} userRole - Current user's role
 * @param {String} targetRole - Role of the data creator/modifier
 * @returns {Boolean} - true if allowed, false if forbidden
 */
const canModifyRoleData = (userRole, targetRole) => {
  const userLevel = getRoleLevel(userRole);
  const targetLevel = getRoleLevel(targetRole);

  // Admin can modify anything
  if (userRole === "admin") return true;

  // Can only modify data from roles at same or lower level
  return userLevel >= targetLevel;
};

const auth = asyncHandler(async (req, res, next) => {

  const token = req.cookies.token;

  if (!token)
    throw AppError.unauthorized("No auth token, access denied.");

  const verified = jwt.verify(token, process.env.JWT_SECRET);
  if (!verified)
    throw AppError.unauthorized("Token verification failed, authorization denied.");

  req.user = verified;
  next();
});

const roleAuth = (roles) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    if (!roles.includes(userRole)) {
      throw AppError.forbidden();
    }

    next();
  };
}

// Admin bypass: Admin already passed canManageErp(), so bypass scope check
const erpCoordinatorCheck = async (req, res, next) => {
  try {
    // Admin bypass - explicit check at start
    if (req.user?.role === "admin") {
      return next();
    }

    const userId = req.user.id;

    // Resolve sectionId/studentId from body, params, or query
    const sectionId = req.body?.sectionId || req.params?.sectionId || req.query?.sectionId;
    const studentId = req.body?.studentId || req.params?.studentId || req.query?.studentId;

    let departmentId, batchId;

    if (sectionId) {
      // Section has program, not department - must get via section.program.department
      const sectionDoc = await section.findById(sectionId)
        .populate("batch")
        .populate({
          path: "program",
          populate: { path: "department" }
        });
      if (!sectionDoc) return res.status(404).json({ error: "Section not found" });
      departmentId = sectionDoc.program?.department?._id || sectionDoc.program?.department;
      batchId = sectionDoc.batch?._id || sectionDoc.batch;
    } else if (studentId) {
      const studentDoc = await student.findById(studentId).populate("department batch");
      if (!studentDoc) return res.status(404).json({ error: "Student not found" });
      departmentId = studentDoc.department?._id || studentDoc.department;
      batchId = studentDoc.batch?._id || studentDoc.batch;
    } else {
      return res.status(400).json({ error: "sectionId or studentId required for scope validation" });
    }

    if (!departmentId || !batchId) {
      return res.status(400).json({ error: "Could not resolve department or batch from scope" });
    }

    const isAllowed = await checkErpCoordinatorScope(userId, departmentId, batchId);
    if (!isAllowed) {
      return res.status(403).json({ error: "Access denied: ERP Coordinator only" });
    }

    next();
  } catch (err) {
    console.error("RBAC check error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// Capability-based middleware - named by capability, not people
// Admin-only for write operations: Batch, Academic Session, Semester, Degree, Regulation, Workflow (pages 4,5,6,7,9,10)
// For GET requests, also allows ERP Coordinators who need to read policy data for course allocation dashboard
const canManagePolicy = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userRole = req.user.role;

  // Admin always has access
  if (userRole === "admin") {
    return next();
  }

  // For GET requests (read operations), allow ERP Coordinators, Students, and Academic Leadership
  // ERP Coordinators need to read degrees, semesters, academic sessions for course allocation dashboard
  // Students need to read their semester information for enrollment
  // Academic Leadership (hod, departmentDean, deanAcademics) need to read batches, degrees, etc. for coordinator assignment page
  if (req.method === "GET") {
    // Allow students to read policy-managed resources (semester, academic session, etc.)
    if (userRole === "student") {
      return next();
    }

    // Allow Academic Leadership (hod, departmentDean, deanAcademics) for coordinator assignment page
    const academicLeadershipRoles = ["hod", "departmentDean", "deanAcademics"];
    if (academicLeadershipRoles.includes(userRole)) {
      return next();
    }

    // Allow ERP Coordinators
    const isCoordinator = await isErpCoordinator(req.user.id);
    if (isCoordinator) {
      return next();
    }
  }

  // For write operations (POST, PUT, DELETE), only admin
  return res.status(403).json({ message: "Forbidden: Admin access required" });
};

// Admin or ERP Coordinator: Student, Faculty, Department, Program, Section, Courses (pages 1,2,3,8,12,13,14,15)
// Also allows Academic Leadership (hod, departmentDean, deanAcademics) who can manage coordinators - they need access to departments/faculty for coordinator assignment page
// Admin bypasses coordinator check
const canManageErp = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userRole = req.user.role;

  // Admin bypasses coordinator check
  if (userRole === "admin") {
    return next();
  }

  // Academic Leadership (hod, departmentDean, deanAcademics) can access ERP data for coordinator assignment page
  const academicLeadershipRoles = ["hod", "departmentDean", "deanAcademics"];
  if (academicLeadershipRoles.includes(userRole)) {
    return next();
  }

  // Check if user is ERP Coordinator
  const isCoordinator = await isErpCoordinator(req.user.id);
  if (!isCoordinator) {
    return res.status(403).json({ message: "Forbidden: Admin, Academic Leadership, or ERP Coordinator access required" });
  }

  next();
};

// Admin or Academic Leadership (hod, departmentDean, deanAcademics) or ERP Coordinator:
// Coordinator Assignment (page 11)
const canManageCoordinators = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userRole = req.user.role;
  const userId = req.user.id;

  // Direct role-based access
  const allowedRoles = ["admin", "hod", "departmentDean", "deanAcademics"];
  if (allowedRoles.includes(userRole)) {
    return next();
  }

  // Faculty with active ERP coordinator assignment
  try {
    const isCoordinator = await isErpCoordinator(userId);
    if (isCoordinator) {
      return next();
    }
  } catch (err) {
    console.error("canManageCoordinators ERP check failed:", err);
  }

  return res.status(403).json({
    message:
      "Forbidden: Admin, Academic Leadership, or ERP Coordinator access required",
  });
};

export {
  auth,
  roleAuth,
  erpCoordinatorCheck,
  canManagePolicy,
  canManageErp,
  canManageCoordinators,
  getRoleLevel,
  canModifyRoleData
};
