import { db } from "../../../db";
function generateInvoiceNumber(lastNumber) {
  const now = new Date();

  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");

  let seq = 1;

  if (lastNumber) {
    const parts = lastNumber.split("-");
    const lastSeq = parseInt(parts[parts.length - 1], 10);

    if (!isNaN(lastSeq)) {
      seq = lastSeq + 1;
    }
  }

  const seqStr = String(seq).padStart(3, "0");

  return `INV-${yyyy}${mm}${dd}-${seqStr}`;
}
export async function POST(req) {
  const data = await req.json();

  /* ================= PROPOSAL ================= */
  const [[proposal]] = await db.query(
    `SELECT p.*, c.company_name, cb.gstin, cb.state
     FROM proposals p
     JOIN companies c ON c.id = p.company_id
     JOIN company_branches cb ON cb.id = p.branch_id
     WHERE p.id=?`,
    [data.proposal_id]
  );

  if (!proposal)
    return Response.json({ error: "Proposal not found" }, { status: 404 });

  /* ================= SELLER ================= */
  const [[seller]] = await db.query(
    `SELECT * FROM company_info LIMIT 1`
  );

  /* ================= CHECK EXISTING INVOICE ================= */
  const [[existing]] = await db.query(
    `SELECT id, invoice_number FROM invoices WHERE proposal_id=?`,
    [proposal.id]
  );

  /* ================= STATE ================= */
  const buyerStateCode = proposal.gstin?.substring(0, 2) || "";
  const sellerStateCode = seller.gstin?.substring(0, 2) || "";

  let invoiceId;
  let invoiceNo;

  /* =========================================================
     UPDATE FLOW
  ========================================================== */
  if (existing) {
    invoiceId = existing.id;
    invoiceNo = existing.invoice_number;

    await db.query(
      `UPDATE invoices SET
        invoice_date=?,
        supply_date=?,
        place_of_supply=?,
        po_number=?,
        po_date=?,
        transport_mode=?,
        vehicle_number=?,
        challan_date=?,
        reverse_charge=?,
        billing_address=?,
        shipping_address=?
       WHERE id=?`,
      [
        data.invoice_date,
        data.supply_date || null,
        data.place_of_supply || null,
        data.po_number || null,
        data.po_date || null,
        data.transport_mode || null,
        data.vehicle_number || null,
        data.invoice_date,
        data.reverse_charge || false,
        proposal.billing_address,
        proposal.shipping_address,
        invoiceId
      ]
    );

    /* delete + recopy items */
    await db.query(`DELETE FROM invoice_items WHERE invoice_id=?`, [invoiceId]);

    await db.query(
      `INSERT INTO invoice_items
       (invoice_id, product_id, quantity, rate, cgst_rate, sgst_rate, igst_rate, line_total)
       SELECT ?, product_id, quantity, rate, cgst_rate, sgst_rate, igst_rate, line_total
       FROM proposal_items
       WHERE proposal_id=?`,
      [invoiceId, proposal.id]
    );

  } else {

  /* =========================================================
     CREATE FLOW
  ========================================================== */

    const [[last]] = await db.query(
      "SELECT invoice_number FROM invoices ORDER BY id DESC LIMIT 1"
    );

    invoiceNo = generateInvoiceNumber(last?.invoice_number);

    const [res] = await db.query(`INSERT INTO invoices SET ?`, {
      invoice_number: invoiceNo,
      invoice_date: data.invoice_date,
      supply_date: data.supply_date || null,

      proposal_id: proposal.id,
      rfq_id: proposal.rfq_id,

      seller_id: 1,
      buyer_company_id: proposal.company_id,
      buyer_branch_id: proposal.branch_id,

      seller_name: seller.company_name,
      seller_gstin: seller.gstin,
      seller_state: seller.state,
      seller_state_code: sellerStateCode,

      buyer_name: proposal.company_name,
      buyer_gstin: proposal.gstin,
      buyer_state: proposal.state,
      buyer_state_code: buyerStateCode,

      billing_address: proposal.billing_address,
      shipping_address: proposal.shipping_address,

      place_of_supply: data.place_of_supply || null,
      po_number: data.po_number || null,
      po_date: data.po_date || null,
      transport_mode: data.transport_mode || null,
      vehicle_number: data.vehicle_number || null,

      challan_number: invoiceNo,
      challan_date: data.invoice_date,
      reverse_charge: data.reverse_charge || false,

      subtotal: proposal.subtotal,
      cgst_total: proposal.cgst_total,
      sgst_total: proposal.sgst_total,
      igst_total: proposal.igst_total,
      grand_total: proposal.grand_total
    });

    invoiceId = res.insertId;

    await db.query(
      `INSERT INTO invoice_items
       (invoice_id, product_id, quantity, rate, cgst_rate, sgst_rate, igst_rate, line_total)
       SELECT ?, product_id, quantity, rate, cgst_rate, sgst_rate, igst_rate, line_total
       FROM proposal_items
       WHERE proposal_id=?`,
      [invoiceId, proposal.id]
    );
  }

  return Response.json({ ok: true, invoice_id: invoiceId, invoice_number: invoiceNo });
}