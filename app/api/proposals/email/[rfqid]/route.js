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
              r.client_name, r.client_email
       FROM proposals p
       LEFT JOIN rfqs r ON r.id = p.rfq_id
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
      service: "gmail",
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
    try {
      const clientEmailForNotification = clientName ? email : (proposal.client_email || email);
      const clientNameForNotification = clientName || proposal.client_name || "Valued Customer";
      
      await sendProposalNotificationEmail(
        clientEmailForNotification,
        clientNameForNotification,
        proposal.proposal_number,
        proposal.proposal_date,
        proposal.grand_total
      );
      
      console.log(`Proposal notification sent to ${clientEmailForNotification} for proposal ${proposal.proposal_number}`);
    } catch (notifyErr) {
      console.error("Failed to send proposal notification:", notifyErr);
      // Don't fail the request if notification email fails
    }

    return Response.json({ message: "Proposal email sent" });

  } catch (e) {
    console.error(e);
    return Response.json({ message: "Email error" }, { status: 500 });
  } finally {
    connection.release();
  }
}
