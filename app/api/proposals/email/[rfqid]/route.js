export const runtime = "nodejs";
import nodemailer from "nodemailer";
import { db } from "../../../../db";
import { sendProposalNotificationEmail } from "../../../../../lib/mailer";

export async function POST(req, { params }) {
  const connection = await db.getConnection();

  try {
    const { rfqid } = await params;
    const { email, clientName } = await req.json();

    // Get proposal details from database
    const [[proposal]] = await connection.query(
      `SELECT p.proposal_number, p.proposal_date, p.grand_total, p.rfq_id,
              r.client_name, r.client_email,
              c.company_name
       FROM proposals p
       LEFT JOIN rfqs r ON r.id = p.rfq_id
       LEFT JOIN companies c ON c.id = p.company_id
       WHERE p.id = ?`,
      [rfqid]
    );

    if (!proposal) {
      return Response.json({ message: "Proposal not found" }, { status: 404 });
    }

    const pdfUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/proposals/pdf/${rfqid}`;
    const pdfRes = await fetch(pdfUrl);

    if (!pdfRes.ok) {
      return Response.json({ message: "PDF generation failed" }, { status: 500 });
    }

    const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

    // Send email with PDF attachment
    await transporter.sendMail({
      from: `"Indihands" <${process.env.MAIL_USER}>`,
      to: email,
      subject: `Proposal ${proposal.proposal_number}`,
      text: "Please find attached proposal PDF.",
      attachments: [
        {
          filename: `Proposal-${proposal.proposal_number}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    // Send notification email to client
// Send notification email to RFQ client
try {
  const clientEmailForNotification = proposal.client_email;
  const clientNameForNotification =
    proposal.client_name || "Valued Customer";
  const companyNameForNotification = proposal.company_name || "";

  if (clientEmailForNotification) {
    await sendProposalNotificationEmail(
      clientEmailForNotification,
      clientNameForNotification,
      proposal.proposal_number,
      proposal.proposal_date,
      proposal.grand_total,
      companyNameForNotification
    );

    console.log(
      `Proposal notification sent to ${clientEmailForNotification}`
    );
  } else {
    console.warn(
      "No RFQ client email found for proposal",
      proposal.proposal_number
    );
  }
} catch (notifyErr) {
  console.error("Failed to send proposal notification:", notifyErr);
}

// Update proposal status to "Sent"
await connection.query(
  `UPDATE proposals SET status = 'Sent' WHERE id = ?`,
  [rfqid]
);

console.log(`Proposal ${rfqid} status updated to Sent`);

    return Response.json({ message: "Proposal email sent" });

  } catch (e) {
    console.error(e);
    return Response.json({ message: "Email error" }, { status: 500 });
  } finally {
    connection.release();
  }
}
