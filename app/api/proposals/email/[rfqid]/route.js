export const runtime = "nodejs";
import nodemailer from "nodemailer";

export async function POST(req, { params }) {
  try {
    const { rfqid } =await params;
    const { email } = await req.json();

    const pdfUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/proposals/pdf/${rfqid}`;
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

    await transporter.sendMail({
      from: `"Indihands" <${process.env.MAIL_USER}>`,
      to: email,
      subject: `Proposal ${rfqid}`,
      text: "Please find attached proposal PDF.",
      attachments: [
        {
          filename: `Proposal-${rfqid}.pdf`,
          content: pdfBuffer,
        },
      ],
    });
console.log("RFQID:", rfqid);
console.log("PARAMS:", params);

    return Response.json({ message: "Proposal email sent" });

  } catch (e) {
    console.error(e);
    return Response.json({ message: "Email error" }, { status: 500 });
  }
}
