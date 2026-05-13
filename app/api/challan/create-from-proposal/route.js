import { db } from "../../../db";

// ✅ Only this branch gets two invoices (Product + Charges)
const SEZ_SPLIT_BRANCH_ID = 27;

function generateInvoiceNumber(lastNumber) {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm   = String(now.getMonth() + 1).padStart(2, "0");
  const dd   = String(now.getDate()).padStart(2, "0");

  let seq = 1;
  if (lastNumber) {
    // strip trailing -P or -C before parsing sequence
    const stripped = lastNumber.replace(/-[PC]$/, "");
    const parts    = stripped.split("-");
    const lastSeq  = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) seq = lastSeq + 1;
  }

  return `INV-${yyyy}${mm}${dd}-${String(seq).padStart(3, "0")}`;
}

export async function POST(req) {
  try {
    const data = await req.json();

    /* ================= PROPOSAL ================= */
    const [[proposal]] = await db.query(
      `SELECT p.*, c.company_name, cb.gstin, cb.state, cb.sez_type, cb.id AS branch_id
       FROM proposals p
       JOIN companies c        ON c.id  = p.company_id
       JOIN company_branches cb ON cb.id = p.branch_id
       WHERE p.id = ?`,
      [data.proposal_id]
    );

    if (!proposal)
      return Response.json({ error: "Proposal not found" }, { status: 404 });

    // ✅ isSEZ = branch is SEZ type
    // ✅ isSEZSplit = ONLY branch 27 gets Product + Charges split
    const isSEZ      = proposal.sez_type?.toLowerCase() === "sez";
    const isSEZSplit = isSEZ && Number(proposal.branch_id) === SEZ_SPLIT_BRANCH_ID;

    /* ================= SELLER ================= */
    const [[seller]] = await db.query(`SELECT * FROM company_info LIMIT 1`);

    /* ================= STATE ================= */
    const buyerStateCode  = proposal.gstin?.substring(0, 2) || "";
    const sellerStateCode = seller.gstin?.substring(0, 2)   || "";

    /* ================= CHECK EXISTING ================= */
    const [existingInvoices] = await db.query(
      `SELECT id, invoice_number, invoice_type FROM invoices WHERE proposal_id = ?`,
      [proposal.id]
    );

    /* =========================================================
       UPDATE FLOW — invoices already exist for this proposal
    ========================================================== */
    if (existingInvoices.length > 0) {

      for (const existing of existingInvoices) {
        await db.query(
          `UPDATE invoices SET
            invoice_date     = ?,
            supply_date      = ?,
            place_of_supply  = ?,
            po_number        = ?,
            po_date          = ?,
            transport_mode   = ?,
            vehicle_number   = ?,
            challan_number   = ?,
            challan_date     = ?,
            reverse_charge   = ?,
            billing_address  = ?,
            shipping_address = ?,
            client_name     = ?,
            contact_phone    = ?
           WHERE id = ?`,
          [
            data.invoice_date,
            data.supply_date    || null,
            data.place_of_supply || null,
            data.po_number      || null,
            data.po_date        || null,
            data.transport_mode || null,
            data.vehicle_number || null,
            data.challan_number || null,
            data.challan_date   || null,
            data.reverse_charge || false,
            proposal.billing_address,
            proposal.shipping_address,
          data.client_name  || null,
            data.contact_phone || null,
            existing.id
          ]
        );

        // Refresh items for product invoices
        await db.query(`DELETE FROM invoice_items WHERE invoice_id = ?`, [existing.id]);

        const isProductInvoice = !isSEZSplit || existing.invoice_type === "product";
        if (isProductInvoice) {
          await db.query(
            `INSERT INTO invoice_items
               (invoice_id, product_id, quantity, rate, cgst_rate, sgst_rate, igst_rate, line_total)
             SELECT ?, product_id, quantity, rate, cgst_rate, sgst_rate, igst_rate, line_total
             FROM proposal_items
             WHERE proposal_id = ?`,
            [existing.id, proposal.id]
          );
        }
      }

      // Return the right IDs
      if (isSEZSplit) {
        const productInvoice = existingInvoices.find(i => i.invoice_type === "product");
        const chargesInvoice = existingInvoices.find(i => i.invoice_type === "charges");
        return Response.json({
          ok: true,
          product_invoice_id: productInvoice?.id,
          charges_invoice_id: chargesInvoice?.id
        });
      }

      return Response.json({ ok: true, invoice_id: existingInvoices[0]?.id });
    }

    /* =========================================================
       CREATE FLOW — no invoices exist yet
    ========================================================== */

    // Generate base invoice number (never re-use -P / -C suffixed numbers as seed)
    const [[last]] = await db.query(
      `SELECT invoice_number FROM invoices ORDER BY id DESC LIMIT 1`
    );
    const baseInvoiceNo = generateInvoiceNumber(last?.invoice_number);

    /* ── Totals from proposal ── */
    const [[itemsTotal]] = await db.query(`
      SELECT
        SUM(line_total)                        AS subtotal,
        SUM(cgst_rate * line_total / 100)      AS cgst,
        SUM(sgst_rate * line_total / 100)      AS sgst,
        SUM(igst_rate * line_total / 100)      AS igst
      FROM proposal_items
      WHERE proposal_id = ?
    `, [proposal.id]);

    const [[chargesTotal]] = await db.query(`
      SELECT
        SUM(amount)                    AS subtotal,
        SUM(amount * tax_percent / 100) AS tax
      FROM proposal_charges
      WHERE proposal_id = ?
    `, [proposal.id]);

    /* ── Insert one invoice ── */
    const createInvoice = async (type) => {
      // Only branch 27 gets -P / -C suffix
    // Each invoice gets its own fresh sequential number
      const [[latestBeforeThis]] = await db.query(
        `SELECT invoice_number FROM invoices ORDER BY id DESC LIMIT 1`
      );
      const invoiceNo = isSEZSplit
        ? generateInvoiceNumber(latestBeforeThis?.invoice_number)
        : baseInvoiceNo;

      const invoiceType = isSEZSplit ? type : (isSEZ ? "sez" : "combined");

      const subtotal =
        isSEZSplit && type === "charges"
          ? chargesTotal.subtotal || 0
          : (itemsTotal.subtotal || 0) + (!isSEZSplit ? (chargesTotal.subtotal || 0) : 0);

      const cgst_total = isSEZSplit && type === "charges" ? 0 : (itemsTotal.cgst || 0);
      const sgst_total = isSEZSplit && type === "charges" ? 0 : (itemsTotal.sgst || 0);
      const igst_total =
        isSEZSplit && type === "charges"
          ? chargesTotal.tax || 0
          : (itemsTotal.igst || 0) + (!isSEZSplit ? (chargesTotal.tax || 0) : 0);

      const grand_total = subtotal + cgst_total + sgst_total + igst_total;

      const [res] = await db.query(`INSERT INTO invoices SET ?`, {
        invoice_number:   invoiceNo,
        invoice_type:     invoiceType,
        invoice_date:     data.invoice_date,
        supply_date:      data.supply_date    || null,
        proposal_id:      proposal.id,
        rfq_id:           proposal.rfq_id,
        seller_id:        1,
        buyer_company_id: proposal.company_id,
        buyer_branch_id:  proposal.branch_id,
        seller_name:      seller.company_name,
        seller_gstin:     seller.gstin,
        seller_state:     seller.state,
        seller_state_code: sellerStateCode,
        buyer_name:       proposal.company_name,
        buyer_gstin:      proposal.gstin,
        buyer_state:      proposal.state,
        buyer_state_code: buyerStateCode,
        billing_address:  proposal.billing_address,
        shipping_address: proposal.shipping_address,
        client_name:     data.client_name  || null,
        contact_phone:    data.contact_phone || null,
        place_of_supply:  data.place_of_supply || null,
        po_number:        data.po_number       || null,
        po_date:          data.po_date         || null,
        transport_mode:   data.transport_mode  || null,
        vehicle_number:   data.vehicle_number  || null,
        challan_number:   data.challan_number  || null,
        challan_date:     data.challan_date    || null,
        reverse_charge:   data.reverse_charge  || false,
        subtotal,
        cgst_total,
        sgst_total,
        igst_total,
        grand_total,
      });

      const invoiceId = res.insertId;

      // Insert items only into product invoice
      if (!isSEZSplit || type === "product") {
        await db.query(
          `INSERT INTO invoice_items
             (invoice_id, product_id, quantity, rate, cgst_rate, sgst_rate, igst_rate, line_total)
           SELECT ?, product_id, quantity, rate, cgst_rate, sgst_rate, igst_rate, line_total
           FROM proposal_items
           WHERE proposal_id = ?`,
          [invoiceId, proposal.id]
        );
      }

      return invoiceId;
    };

    // ✅ Only branch 27 creates two invoices
    if (isSEZSplit) {
      const productInvoiceId = await createInvoice("product");
      const chargesInvoiceId = await createInvoice("charges");
      return Response.json({
        ok: true,
        message: "SEZ split invoices created (branch 27)",
        product_invoice_id: productInvoiceId,
        charges_invoice_id: chargesInvoiceId
      });
    }

    // All other branches (including non-split SEZ) → single invoice
    const createdInvoiceId = await createInvoice("combined");
    return Response.json({ ok: true, invoice_id: createdInvoiceId });

  } catch (err) {
    console.error("CREATE INVOICE ERROR:", err);
    return Response.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}