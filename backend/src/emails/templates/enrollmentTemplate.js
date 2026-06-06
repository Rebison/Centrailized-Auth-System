export const getEnrollmentTemplate = ({
  type, // 'submitted' | 'approved' | 'finalApproved' | 'rejected' | 'reminder'
  recipientName = "Student",
  enrollmentId = "ENR123456",
  approverName = "Faculty",
  rejectionReason = "Not specified",
  submissionDate = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
  courses = [], // [{ courseName, courseCode, credits, facultyName }]
  portalLink = "https://srishty.bharathuniv.ac.in/academics"
}) => {
  let subject = '';
  let statusColor = '#f39c12'; // default pending color
  let bodyIntro = '';

  // ✅ Course table generator
  const coursesTable = courses.length > 0 ? `
      <table style="width:100%; border-collapse:collapse; margin:15px 0;">
        <thead>
          <tr style="background:#f4f4f4; text-align:left;">
            <th style="padding:10px; border:1px solid #ddd;">Course Code</th>
            <th style="padding:10px; border:1px solid #ddd;">Course Name</th>
            <th style="padding:10px; border:1px solid #ddd;">Credits</th>
            <th style="padding:10px; border:1px solid #ddd;">Faculty</th>
          </tr>
        </thead>
        <tbody>
          ${courses.map(c => `
            <tr>
              <td style="padding:10px; border:1px solid #ddd;">${c.courseCode}</td>
              <td style="padding:10px; border:1px solid #ddd;">${c.courseName}</td>
              <td style="padding:10px; border:1px solid #ddd; text-align:center;">${c.credits}</td>
              <td style="padding:10px; border:1px solid #ddd;">${c.facultyName}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : '';

  // ✅ Switch for different email types
  switch (type) {
    case 'submitted':
      subject = `Enrollment Request Submitted`;
      statusColor = '#f39c12';
      bodyIntro = `
              <p style="font-size:16px; color:#333; margin-bottom:10px;">Your enrollment request has been successfully submitted.</p>
              <p><strong>Enrollment ID:</strong> ${enrollmentId}</p>
              <p><strong>Submitted On:</strong> ${submissionDate}</p>
              <p>Status: <span style="color:${statusColor}; font-weight:bold;">Pending Review</span></p>
            `;
      break;

    case 'approved':
      subject = `Enrollment Request Approved`;
      statusColor = '#27ae60';
      bodyIntro = `
              <p style="font-size:16px; color:#333; margin-bottom:10px;">Good news! Your enrollment request has been approved.</p>
              <p><strong>Enrollment ID:</strong> ${enrollmentId}</p>
              <p><strong>Approved By:</strong> ${approverName}</p>
              <p>Status: <span style="color:${statusColor}; font-weight:bold;">Approved</span></p>
            `;
      break;

    case 'finalApproved':
      subject = `Your Enrollment Request Has Been Fully Approved`;
      statusColor = '#27ae60';
      bodyIntro = `
              <p style="font-size:14px; color:#555;">Congratulations! Your enrollment request has been fully <strong>approved by all authorities</strong>.</p>
              <p><strong>Enrollment ID:</strong> ${enrollmentId}</p>
              <p><strong>Submitted On:</strong> ${submissionDate}</p>
            `;
      break;

    case 'rejected':
      subject = `Enrollment Request Rejected`;
      statusColor = '#e74c3c';
      bodyIntro = `
              <p style="font-size:16px; color:#333; margin-bottom:10px;">Unfortunately, your enrollment request was rejected.</p>
              <p><strong>Enrollment ID:</strong> ${enrollmentId}</p>
              <p><strong>Rejected By:</strong> ${approverName}</p>
              <p><strong>Reason:</strong> ${rejectionReason}</p>
              <p>Status: <span style="color:${statusColor}; font-weight:bold;">Rejected</span></p>
            `;
      break;

    case 'reminder':
      subject = `Reminder: Pending Enrollment Review`;
      statusColor = '#f39c12';
      bodyIntro = `
              <p style="font-size:16px; color:#333; margin-bottom:10px;">This is a reminder regarding your pending enrollment request.</p>
              <p><strong>Enrollment ID:</strong> ${enrollmentId}</p>
              <p><strong>Submitted On:</strong> ${submissionDate}</p>
              <p>Status: <span style="color:${statusColor}; font-weight:bold;">Pending Review</span></p>
            `;
      break;

    default:
      subject = `Enrollment Update`;
      bodyIntro = `<p>There is an update regarding your enrollment. Please check the ERP portal for details.</p>`;
  }

  // ✅ CTA Button
  const ctaButton = `
      <div style="text-align:center; margin:20px 0;">
        <a href="${portalLink}" style="background:${statusColor}; color:#fff; padding:12px 24px; text-decoration:none; font-size:16px; border-radius:6px; display:inline-block;">
          View Enrollment Status
        </a>
      </div>
    `;

  // ✅ Final Email Body
  const bodyContent = `
        ${bodyIntro}
        ${type === 'submitted' || type === 'finalApproved' ? coursesTable : ''}
        ${ctaButton}
    `;

  return { subject, bodyContent };
};
