/**
 * Email template generator for student permission notifications.
 * Supports: submitted, approved, rejected, reminder
 */

// Role formatter helper
const formatRole = (rawRole = '') => {
  const map = {
    mentor: 'Mentor',
    assistantHod: 'Assistant HoD',
    hod: 'Head of Department',
    departmentDean: 'Dean',
    deanAcademics: 'Dean Academics',
    office: 'Office Staff',
  };
  return map[rawRole] || rawRole.charAt(0).toUpperCase() + rawRole.slice(1);
};

export const getPermissionTemplate = ({ type, recipientName = "User", requestType = "Permission", approverName = "Faculty", rejectionReason = "Not specified", studentName = "Student", submissionDate = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }), role = 'faculty' }) => {
  const readableRole = formatRole(role);
  let subject = '';
  let bodyContent = '';

  switch (type) {
    case 'submitted':
      subject = `Your ${requestType} Request Has Been Submitted`;
      bodyContent = `
        We have received your <strong>${requestType}</strong> request.<br><br>
        <strong>Submitted On:</strong> ${submissionDate}<br><strong>Status:</strong> Pending<br><br>
        <p>You will be notified once it is reviewed.</p>
      `;
      break;
    case 'approved':
      subject = `Your ${requestType} Request Has Been Approved`;
      bodyContent = `
        <p>Your <strong>${requestType}</strong> request has been <strong>approved</strong> by ${readableRole} - ${approverName}.</p>
        <p><strong>Approved On:</strong> ${submissionDate}</p>
      `;
      break;
    case 'rejected':
      subject = `Your ${requestType} Request Has Been Rejected`;
      bodyContent = `
        <p>Your <strong>${requestType}</strong> request was rejected by ${readableRole} - ${approverName}.</p>
        <p><strong>Reason:</strong> ${rejectionReason}</p>
      `;
      break;
    case 'reminder':
      subject = `Pending ${requestType} Request Needs Your Review`;
      bodyContent = `
        You have a pending <strong>${requestType}</strong> request awaiting your action.<br><br>
        <strong>Student Name:</strong> ${studentName}<br>
        <strong>Submitted On:</strong> ${submissionDate}
      `;
      break;
    default:
      subject = 'BIHER ERP Notification';
      bodyContent = `<p>There has been an update regarding your ${requestType} request.</p>`;
  }

  return { subject, bodyContent };
};
