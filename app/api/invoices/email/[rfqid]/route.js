export const runtime = "nodejs";
import nodemailer from "nodemailer";

export async function POST(req, { params }) {
  try {
    const { rfqid } = await params;
    const { email } = await req.json();

    if (!rfqid) {
      return Response.json({ message: "Missing rfqid" }, { status: 400 });
    }

    if (!email) {
      return Response.json({ message: "Missing email" }, { status: 400 });
    }

    /* ================= FETCH INVOICE PDF ================= */
    const pdfUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/invoices/pdf/${rfqid}`;

    const pdfRes = await fetch(pdfUrl);

    if (!pdfRes.ok) {
      return Response.json({ message: "Invoice PDF generation failed" }, { status: 500 });
    }

    const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());

    /* ================= MAIL CONFIG ================= */
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    /* ================= SEND EMAIL ================= */
    await transporter.sendMail({
      from: `"Indihands" <${process.env.MAIL_USER}>`,
      to: email,
      subject: `Invoice ${rfqid}`,
      text: "Please find attached invoice PDF.",
      attachments: [
        {
          filename: `Invoice-${rfqid}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    return Response.json({ message: "Invoice email sent" });

  } catch (e) {
    console.error(e);
    return Response.json({ message: "Email error" }, { status: 500 });
  }
}
