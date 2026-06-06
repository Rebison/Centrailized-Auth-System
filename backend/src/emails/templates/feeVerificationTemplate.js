export const getFeeVerificationTemplate = ({
    type, // 'submitted' | 'approved' | 'rejected' | 'finalApproved'
    recipientName = "Student",
    verificationId = "FEE123456",
    approverName = "Faculty",
    rejectionReason = "Not specified",
    submissionDate = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
    portalLink = "https://srishty.bharathuniv.ac.in/academics"
}) => {
    let subject = '';
    let statusColor = '#f39c12'; // default pending
    let bodyIntro = '';

    switch (type) {
        case 'submitted':
            subject = `Fee Verification Submitted`;
            statusColor = '#f39c12';
            bodyIntro = `
                <p style="font-size:16px; color:#333;">Your fee verification request has been successfully submitted.</p>
                <p><strong>Verification ID:</strong> ${verificationId}</p>
                <p><strong>Submitted On:</strong> ${submissionDate}</p>
                <p>Status: <span style="color:${statusColor}; font-weight:bold;">Pending Review</span></p>
            `;
            break;

        case 'approved':
            subject = `Fee Verification Approved`;
            statusColor = '#27ae60';
            bodyIntro = `
                <p style="font-size:16px; color:#333;">Your fee verification request has been approved by ${approverName}.</p>
                <p><strong>Verification ID:</strong> ${verificationId}</p>
                <p><strong>Approved On:</strong> ${submissionDate}</p>
                <p>Status: <span style="color:${statusColor}; font-weight:bold;">Approved</span></p>
            `;
            break;

        case 'finalApproved':
            subject = `Fee Verification Fully Approved`;
            statusColor = '#27ae60';
            bodyIntro = `
                <p style="font-size:16px; color:#333;">Congratulations! Your fee verification has been approved by all authorities.</p>
                <p><strong>Verification ID:</strong> ${verificationId}</p>
                <p><strong>Final Approval Date:</strong> ${submissionDate}</p>
                <p>Status: <span style="color:${statusColor}; font-weight:bold;">Final Approved</span></p>
            `;
            break;

        case 'rejected':
            subject = `Fee Verification Rejected`;
            statusColor = '#e74c3c';
            bodyIntro = `
                <p style="font-size:16px; color:#333;">Unfortunately, your fee verification was rejected.</p>
                <p><strong>Verification ID:</strong> ${verificationId}</p>
                <p><strong>Rejected By:</strong> ${approverName}</p>
                <p><strong>Reason:</strong> ${rejectionReason}</p>
                <p>Status: <span style="color:${statusColor}; font-weight:bold;">Rejected</span></p>
            `;
            break;

        default:
            subject = `Fee Verification Update`;
            bodyIntro = `<p>There is an update regarding your fee verification. Please check the ERP portal for details.</p>`;
    }

    // ✅ CTA Button
    const ctaButton = `
        <div style="text-align:center; margin:20px 0;">
            <a href="${portalLink}" style="background:${statusColor}; color:#fff; padding:12px 24px; text-decoration:none; font-size:16px; border-radius:6px; display:inline-block;">
                View Fee Verification Status
            </a>
        </div>
    `;

    const bodyContent = `
        ${bodyIntro}
        ${ctaButton}
    `;

    return { subject, bodyContent };
};
