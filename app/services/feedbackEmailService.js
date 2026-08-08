import { db } from "../db.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/**
 * Sends the feedback-request email for an invoice.
 *
 * IMPORTANT: this now takes a single options object instead of 7
 * positional args. That was the root cause of the B2B bug — a caller
 * dropping/reordering one positional arg silently shifted every
 * arg after it (feedbackUrl ended up undefined, invoiceNumber ended
 * up holding the URL). With named keys, a missing/misnamed field is
 * just `undefined` under its own correct name, and the explicit
 * checks below throw immediately instead of sending a broken email.
 */
export async function sendFeedbackEmail({
  invoiceFor,
  rfqId,
  companyId,
  branchId,
  customerId,
  invoiceNumber,
  feedbackUrl,
}) {
  try {
    console.log("======================================");
    console.log("SEND FEEDBACK EMAIL");
    console.log("Invoice :", invoiceNumber);
    console.log("Type    :", invoiceFor);
    console.log("======================================");

    // Fail loud instead of silently emailing broken content.
    if (!invoiceNumber) {
      throw new Error("sendFeedbackEmail: invoiceNumber is required.");
    }
    if (!feedbackUrl) {
      throw new Error("sendFeedbackEmail: feedbackUrl is required.");
    }
    if (invoiceFor === "B2B" && !rfqId) {
      throw new Error("sendFeedbackEmail: rfqId is required for B2B invoices.");
    }
    if (invoiceFor !== "B2B" && !customerId) {
      throw new Error("sendFeedbackEmail: customerId is required for B2C invoices.");
    }

    let email = "";
    let clientName = "";

    if (invoiceFor === "B2B") {
      const [[rfq]] = await db.query(
        `
        SELECT
          client_name,
          client_email
        FROM rfqs
        WHERE id = ?
        `,
        [rfqId]
      );

      console.log("RFQ:", rfq);

      if (!rfq) throw new Error("RFQ not found.");

      email = rfq.client_email;
      clientName = rfq.client_name;
    } else {
      const [[customer]] = await db.query(
        `
        SELECT
          username,
          email
        FROM customers
        WHERE id = ?
        `,
        [customerId]
      );

      console.log("Customer:", customer);

      if (!customer) throw new Error("Customer not found.");

      email = customer.email;
      clientName = customer.username;
    }

    if (!email) {
      throw new Error("Recipient email not found.");
    }

    console.log("Recipient :", email);
    console.log("Feedback URL :", feedbackUrl);

    const htmlContent = `
      <div style="max-width:650px;margin:auto;font-family:Arial,sans-serif;border:1px solid #eee;border-radius:8px;overflow:hidden">

        <div style="background:#faf6ef;padding:18px 24px;border-bottom:1px solid #eee">
          <h2 style="margin:0;color:#c47a2c">
            IndiHands
          </h2>
        </div>

        <div style="padding:30px">

          <h2 style="margin-top:0;color:#c47a2c;">
            We'd Love Your Feedback
          </h2>

          <p>
            Dear <strong>${clientName}</strong>,
          </p>

          <p>
            Thank you for choosing IndiHands.
          </p>

          <p>
            Your invoice
            <strong>${invoiceNumber}</strong>
            has been completed.
          </p>

          <p>
            Please take a minute to share your experience.
          </p>

          <div style="text-align:center;margin:35px 0">

            <a
              href="${feedbackUrl}"
              style="
                background:#F39F46;
                color:#fff;
                text-decoration:none;
                padding:14px 34px;
                border-radius:6px;
                display:inline-block;
                font-size:16px;
                font-weight:bold;
              "
            >
              Give Feedback
            </a>

          </div>

          <p style="color:#666">
            Your feedback helps us improve our products and services.
          </p>

          <p>
            Regards,<br/>
            <strong>IndiHands Team</strong>
          </p>

        </div>

      </div>
    `;

    console.log("Sending email...");

    const info = await transporter.sendMail({
      from: `"IndiHands" <${process.env.MAIL_USER}>`,
      to: email,
      subject: `Share your feedback - ${invoiceNumber}`,
      html: htmlContent,
    });

    console.log("Email sent successfully.");
    console.log("Message Id:", info.messageId);

    return true;
  } catch (error) {
    console.error("sendFeedbackEmail Error:");
    console.error(error);

    throw error;
  }
}