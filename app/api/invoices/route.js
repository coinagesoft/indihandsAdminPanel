import { db } from "../../db";


export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        p.id,
        p.proposal_number,
        p.proposal_date,
        p.status,
        p.company_id,
        p.branch_id,
        p.rfq_id,
        
        r.rfq_number,
        r.client_name,
        r.client_email,

        c.company_name,
        cb.branch_name,

        (
          IFNULL(it.subtotal,0)
          + IFNULL(it.cgst,0)
          + IFNULL(it.sgst,0)
          + IFNULL(it.igst,0)
          + IFNULL(ch.amount,0)
          + IFNULL(ch.tax,0)
        ) AS grand_total

      FROM proposals p
      LEFT JOIN rfqs r ON r.id = p.rfq_id
      LEFT JOIN companies c ON c.id = p.company_id
      LEFT JOIN company_branches cb ON cb.id = p.branch_id

      /* ===== ITEMS AGG (same as edit page) ===== */
      LEFT JOIN (
        SELECT
          proposal_id,
          SUM(quantity * rate) AS subtotal,
          SUM((quantity * rate) * cgst_rate/100) AS cgst,
          SUM((quantity * rate) * sgst_rate/100) AS sgst,
          SUM((quantity * rate) * igst_rate/100) AS igst
        FROM proposal_items
        GROUP BY proposal_id
      ) it ON it.proposal_id = p.id

      /* ===== CHARGES AGG ===== */
      LEFT JOIN (
        SELECT
          proposal_id,
          SUM(amount) AS amount,
          SUM(amount * tax_percent/100) AS tax
        FROM proposal_charges
        GROUP BY proposal_id
      ) ch ON ch.proposal_id = p.id

WHERE p.status IN ('Sent','Approved')
      ORDER BY p.id DESC
    `);

    return Response.json(rows);

  } catch (err) {
    console.error("admin proposals error:", err);
    return Response.json({ error: "DB error" }, { status: 500 });
  }
}