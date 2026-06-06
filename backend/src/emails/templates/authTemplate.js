/**
 * Authentication-related email templates
 * Includes OTP and Password Change notifications
 */

// OTP Template
export const getOtpTemplate = ({ recipientName = 'User', otp }) => {
  const subject = "Your One-Time Password (OTP)";
  const bodyContent = `
    <p>We received a request to reset the password for your account associated with this email address.</p>

    <p>To proceed, please use the One-Time Password (OTP) provided below:</p>

    <p style='text-align: center; font-size: 24px; font-weight: bold;'>
      <span style='letter-spacing: 14px'>${otp}</span>
    </p>

    <p>This OTP is valid for 10 minutes. For your security, do not share this code with anyone.</p>

    <p>If you did not request a password reset, please ignore this email or contact our support team immediately.</p>
  `;

  return { subject, bodyContent };
};

// Password Change Template
export const getPasswordChangeDetailsTemplate = ({ recipientName = 'User', ipAddress, device, timestamp }) => {
  const subject = "Your Password Has Been Changed";
  const bodyContent = `
    <p>Your account password was successfully changed on <strong>${timestamp}</strong>.</p>
    <p>Details of the activity:</p>
    <ul>
      <li><strong>IP Address:</strong> ${ipAddress}</li>
      <li><strong>Device:</strong> ${device.device.model || 'N/A'}</li>
      <li><strong>OS:</strong> ${device.os.name} ${device.os.version}</li>
      <li><strong>Browser:</strong> ${device.browser.name} ${device.browser.version}</li>
    </ul>
    <p>If you did not perform this change, please contact our support team immediately.</p>
  `;

  return { subject, bodyContent };
}
