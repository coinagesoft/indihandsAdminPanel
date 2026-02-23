export const runtime = "nodejs";
import nodemailer from "nodemailer";
import { db } from "../../../../db";
import { sendProposalNotificationEmail } from "../../../../../lib/mailer";

export async function POST(req, { params }) {
  const connection = await db.getConnection();

  try {
    const { rfqid: proposalId } =await params;
    const { email } = await req.json();

    const [[proposal]] = await connection.query(
      `SELECT p.proposal_number, p.proposal_date, p.grand_total, p.rfq_id,
              r.client_name, r.client_email,
              c.company_name
       FROM proposals p
       LEFT JOIN rfqs r ON r.id = p.rfq_id
       LEFT JOIN companies c ON c.id = p.company_id
       WHERE p.id = ?`,
      [proposalId]
    );

    if (!proposal) {
      return Response.json({ message: "Proposal not found" }, { status: 404 });
    }

    /* ✅ recipient */
    const recipient = email || proposal.client_email;
    if (!recipient) {
      console.error("NO RECIPIENT EMAIL");
      return Response.json({ message: "Client email missing" }, { status: 400 });
    }

    /* ===== PDF FETCH ===== */
 /* ===== PDF FETCH ===== */
const pdfUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/proposals/pdf/${proposalId}`;
let pdfBuffer = null;

try {
  const pdfRes = await fetch(pdfUrl);

  if (pdfRes.ok) {
    pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());
    console.log("PDF attached");
  } else {
    console.warn("PDF fetch failed:", pdfUrl);
  }

} catch (pdfErr) {
  console.error("PDF ERROR:", pdfErr);
}

    /* ===== MAIL ===== */
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    console.log("SENDING MAIL TO:", recipient);

  

    /* notification */
    if (proposal.client_email) {
      await sendProposalNotificationEmail(
        proposal.client_email,
        proposal.client_name || "Valued Customer",
        proposal.proposal_number,
        proposal.proposal_date,
        proposal.grand_total,
        proposal.company_name || "",
        pdfBuffer
      );
    }

    await connection.query(
      `UPDATE proposals SET status = 'Sent' WHERE id = ?`,
      [proposalId]
    );

  return Response.json({
  message: "Proposal email sent",
  pdfAttached: !!pdfBuffer,
});

  } catch (e) {
    console.error("EMAIL API ERROR:", e);
    return Response.json({ message: "Email error" }, { status: 500 });
  } finally {
    connection.release();
  }
}
