import nodemailer from "nodemailer";

export async function sendResetPasswordEmail(to, resetLink) {
  const transporter = nodemailer.createTransport({
    service: "gmail", // simple way
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS, // Gmail App Password
    },
  });

  await transporter.sendMail({
    from: `"Indihands Admin" <${process.env.MAIL_USER}>`,
    to,
    subject: "Reset Your Password",
    html: `
      <h3>Password Reset Request</h3>
      <p>Click below to set your new password:</p>
      <a href="${resetLink}" target="_blank">${resetLink}</a>
      <p><b>This link will expire in 15 minutes.</b></p>
    `,
  });
}

export async function sendRFQStatusEmail(to, clientName, rfqNumber, status) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  let subject = "";
  let statusMessage = "";
  let statusColor = "";

  switch (status) {
    case "Under Review":
      subject = `RFQ #${rfqNumber} - Under Review`;
      statusMessage = "Your RFQ is now under review. We will update you once the review is complete.";
      statusColor = "#f59e0b"; // Warning yellow
      break;
    case "Accepted":
      subject = `RFQ #${rfqNumber} - Accepted`;
      statusMessage = "Great news! Your RFQ has been accepted. We will proceed with the next steps.";
      statusColor = "#10b981"; // Success green
      break;
    case "Rejected":
      subject = `RFQ #${rfqNumber} - Rejected`;
      statusMessage = "We regret to inform you that your RFQ has been rejected. Please contact us for more details.";
      statusColor = "#ef4444"; // Danger red
      break;
    default:
      subject = `RFQ #${rfqNumber} - Status Update`;
      statusMessage = `Your RFQ status has been updated to: ${status}`;
      statusColor = "#6b7280";
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h2 style="color: #333; margin-bottom: 20px;">RFQ Status Update</h2>
        
        <p style="color: #555; font-size: 16px;">Dear ${clientName || 'Valued Customer'},</p>
        
        <p style="color: #555; font-size: 16px;">${statusMessage}</p>
        
        <div style="background-color: ${statusColor}; color: white; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;">
          <strong style="font-size: 18px;">Status: ${status}</strong>
        </div>
        
        <p style="color: #777; font-size: 14px;">
          If you have any questions, please don't hesitate to contact us.
        </p>
        
        <p style="color: #777; font-size: 14px; margin-top: 30px;">
          Best regards,<br>
          Indihands Team
        </p>
      </div>
      
      <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Indihands Admin" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html: htmlContent,
  });
}
