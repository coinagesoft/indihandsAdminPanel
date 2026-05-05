import { db } from "../../../../db";

export async function GET(req, { params }) {
  const { id } = await params;

  console.log("➡️ GET /api/challan/proposal/", id);

  const [[row]] = await db.query(`
    SELECT 
      p.*,

      /* company */
      c.company_name,
      c.company_email,

      /* branch */
      b.branch_name,
      b.gstin,
      b.sez_type AS branch_sez_type,
      b.billing_address AS branch_billing_address,
      b.shipping_address AS branch_shipping_address,

      /* RFQ CLIENT */
      r.client_name,
      r.client_phone,
      r.client_email,
      r.rfq_number

    FROM proposals p
    LEFT JOIN companies c ON c.id = p.company_id
    LEFT JOIN company_branches b ON b.id = p.branch_id
    LEFT JOIN rfqs r ON r.id = p.rfq_id

    WHERE p.id = ?
  `, [id]);

  console.log("📦 Proposal API result:", row);

  if (!row) {
    return Response.json({ error: "Proposal not found" }, { status: 404 });
  }

  return Response.json(row);
}