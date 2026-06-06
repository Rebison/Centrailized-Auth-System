import { transporter } from "./config/emailTransporter.js";
import { generateEmailBody } from "./templates/baseTemplate.js";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

/**
 * Generic email sender
 * @param {string} to - Recipient email
 * @param {function} templateFn - Template function returning { subject, bodyContent }
 * @param {object} data - Dynamic data for template
 */
export const sendCustomEmail = async (to, templateFn, data) => {
  const { subject, bodyContent } = templateFn(data);
  const { html, text } = generateEmailBody(bodyContent, data.recipientName || "User");

  const mailOptions = {
    from: `"SRISHTY" <${process.env.EMAIL_ID}>`,
    to,
    subject,
    text,
    html
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${to}`);
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    throw error;
  }
};
