import cron from "node-cron";
import { db } from "../app/db.js";
import crypto from "crypto";
import { sendFeedbackEmail } from "../app/services/feedbackEmailService.js";

export function startFeedbackCron() {
  // VERSION MARKER — if you don't see this exact line in your server
  // logs on restart, the process is running a different copy of this
  // file (stale build output, wrong path, or a process that didn't
  // actually restart). Find and fix that before touching the logic
  // below.
  console.log("✅ Feedback Cron Started — VERSION: 2026-08-08-fix1");

  // For testing: runs every minute
  cron.schedule("* * * * *", async () => {
    try {
      console.log("==================================");
      console.log("Running Feedback Email Cron...");
      console.log(new Date().toLocaleString());
      console.log("==================================");

      const [invoices] = await db.query(`
        SELECT
          id,
          proposal_id,
          rfq_id,
          buyer_company_id,
          buyer_branch_id,
          customer_id,
          invoice_for,
          invoice_number,
          invoice_date
        FROM invoices
        WHERE
          status = 'Issued'
          AND feedback_email_sent = 0
          AND issued_at IS NOT NULL
          AND issued_at <= DATE_SUB(NOW(), INTERVAL 3 DAY)
      `);

      for (const invoice of invoices) {
        try {
          console.log(`Processing Invoice: ${invoice.invoice_number}`);

          const [[existing]] = await db.query(
            `
            SELECT
              id,
              feedback_token,
              email_sent_at
            FROM feedbacks
            WHERE invoice_id = ?
              AND feedback_source = 'Invoice'
            LIMIT 1
            `,
            [invoice.id]
          );

          if (existing) {
            if (existing.email_sent_at) {
              console.log(`Already emailed: ${invoice.invoice_number}`);
              continue;
            }

            console.log(`Retrying email: ${invoice.invoice_number}`);

            const feedbackUrl = `${process.env.NEXT_PUBLIC_Feedback_APP_URL}/feedback?token=${existing.feedback_token}`;

            await sendFeedbackEmail({
              invoiceFor: invoice.invoice_for,
              rfqId: invoice.rfq_id,
              companyId: invoice.buyer_company_id,
              branchId: invoice.buyer_branch_id,
              customerId: invoice.customer_id,
              invoiceNumber: invoice.invoice_number,
              feedbackUrl,
            });

            await db.query(
              `
              UPDATE feedbacks
              SET email_sent_at = NOW()
              WHERE id = ?
              `,
              [existing.id]
            );

            await db.query(
              `
              UPDATE invoices
              SET feedback_email_sent = 1
              WHERE id = ?
              `,
              [invoice.id]
            );

            continue;
          }

          const feedbackToken = crypto.randomUUID();
          const feedbackUrl = `${process.env.NEXT_PUBLIC_Feedback_APP_URL}/feedback?token=${feedbackToken}`;

          const clientType = invoice.invoice_for === "B2B" ? "B2B" : "B2C";

          const [result] = await db.query(
            `
            INSERT INTO feedbacks
            (
              proposal_id,
              invoice_id,
              feedback_source,
              client_type,
              buyer_company_id,
              buyer_branch_id,
              customer_id,
              feedback_token,
              email_sent_at,
              created_at
            )
            VALUES
            (
              ?,
              ?,
              'Invoice',
              ?,
              ?,
              ?,
              ?,
              ?,
              NULL,
              NOW()
            )
            `,
            [
              invoice.proposal_id,
              invoice.id,
              clientType,
              invoice.buyer_company_id,
              invoice.buyer_branch_id,
              invoice.customer_id,
              feedbackToken,
            ]
          );

          console.log(`Inserted Feedback ID: ${result.insertId}`);

          console.log("BEFORE SEND:", {
            invoiceFor: invoice.invoice_for,
            rfqId: invoice.rfq_id,
            companyId: invoice.buyer_company_id,
            branchId: invoice.buyer_branch_id,
            customerId: invoice.customer_id,
            invoiceNumber: invoice.invoice_number,
            feedbackUrl,
          });

          await sendFeedbackEmail({
            invoiceFor: invoice.invoice_for,
            rfqId: invoice.rfq_id,
            companyId: invoice.buyer_company_id,
            branchId: invoice.buyer_branch_id,
            customerId: invoice.customer_id,
            invoiceNumber: invoice.invoice_number,
            feedbackUrl,
          });

          console.log(`Feedback email sent for ${invoice.invoice_number}`);

          await db.query(
            `
            UPDATE feedbacks
            SET email_sent_at = NOW()
            WHERE id = ?
            `,
            [result.insertId]
          );

          await db.query(
            `
            UPDATE invoices
            SET feedback_email_sent = 1
            WHERE id = ?
            `,
            [invoice.id]
          );

          console.log(`Invoice updated: ${invoice.invoice_number}`);
        } catch (err) {
          console.error(`Failed processing invoice ${invoice.invoice_number}`, err);
        }
      }

      console.log(`Found ${invoices.length} invoice(s).`);

      if (invoices.length > 0) {
        console.table(invoices);
      }
    } catch (err) {
      console.error("Feedback Cron Error:", err);
    }
  });
}