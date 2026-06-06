import { emailConfig } from "../config/emailConfig.js";

export const generateEmailBody = (bodyContent, recipientName = "User") => {
  const { companyName, supportEmail, address } = emailConfig;
  const currentYear = new Date().getFullYear();

  const footerHTML = `
    <tr>
      <td style="padding:12px; font-size:12px; color:#888;text-align:center;">
        <p>© ${currentYear} ${companyName}</p>
        <p style="margin:4px 0;">
            For queries, contact: 
            <a href="mailto:${supportEmail}" style="color:#1a73e8;">${supportEmail}</a>
        </p>
        <p style="margin:4px 0;">
            ${address}
        </p>
      </td>
    </tr>
  `;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${companyName} Notification</title>
    </head>
    <body style="margin:0; padding:0; font-family:Arial,sans-serif;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width: 600px; margin: 20px auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); overflow: hidden;">
        <tr>
          <td style="padding:0 16px; font-size:16px; color:#333;">
            Hello ${recipientName},
          </td>
        </tr>
        <tr>
          <td style="padding:16px; font-size:14px; color:#555;">
            ${bodyContent}
          </td>
        </tr>
        <tr>
          <td style="padding:0 12px;">
            <hr style="border:none; border-top:1px solid #ddd; margin:20px 0;">
          </td>
        </tr>
        ${footerHTML}
      </table>
    </body>
    </html>
  `;

  const text = `Hello, ${recipientName}!\n\n${bodyContent
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .trim()}`;

  return { html, text };
};
