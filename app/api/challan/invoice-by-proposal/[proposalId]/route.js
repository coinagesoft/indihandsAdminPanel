import { db } from "../../../../db";

export async function GET(req, { params }) {
  const { proposalId } = await params;

  const [[row]] = await db.query(
    `SELECT 
      id,
      invoice_number,

      DATE_FORMAT(invoice_date, '%Y-%m-%d') as invoice_date,
      DATE_FORMAT(supply_date, '%Y-%m-%d') as supply_date,

      place_of_supply,
      po_number,
      DATE_FORMAT(po_date, '%Y-%m-%d') as po_date,

      transport_mode,
      vehicle_number,

      challan_number,
      DATE_FORMAT(challan_date, '%Y-%m-%d') as challan_date,

      reverse_charge

     FROM invoices 
     WHERE proposal_id = ? 
     ORDER BY id DESC 
     LIMIT 1`,
    [proposalId]
  );

  return Response.json(row || {});
}