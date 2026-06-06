// utils/sanitize.js

const SENSITIVE_FIELDS = [
  "password",
  "confirmPassword",
  "token",
  "accessToken",
  "refreshToken",
  "authorization",
  "cookie",
  "secret",
  "apiKey"
];

// 🔹 Deep mask function
export const sanitize = (obj) => {
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }

  const sanitized = {};

  for (const key in obj) {
    if (SENSITIVE_FIELDS.includes(key.toLowerCase())) {
      sanitized[key] = "***MASKED***";
    } else if (typeof obj[key] === "object") {
      sanitized[key] = sanitize(obj[key]);
    } else {
      sanitized[key] = obj[key];
    }
  }

  return sanitized;
};