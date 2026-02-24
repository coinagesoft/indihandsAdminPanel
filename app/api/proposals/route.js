import { db } from "../../db";

/* ---------------- helpers ---------------- */
const calcAmount = (qty, rate, discount) => {
  const base = Number(qty) * Number(rate);
  const disc = (base * Number(discount || 0)) / 100;
  return base - disc;
};

const calcTax = (amount, percent) =>
  (Number(amount) * Number(percent || 0)) / 100;

async function generateNextProposalNumber() {
  const now = new Date();

  const YYYY = now.getFullYear();
  const MM = String(now.getMonth() + 1).padStart(2, "0");
  const DD = String(now.getDate()).padStart(2, "0");

  const baseKey = `${YYYY}${MM}${DD}`;

  const [[row]] = await db.query(
    `
    SELECT proposal_number
    FROM proposals
    WHERE proposal_number LIKE ?
    ORDER BY id DESC
    LIMIT 1
    `,
    [`QTN-${baseKey}-%`]
  );

  let nextSeq = 1;

  if (row?.proposal_number) {
    const match = row.proposal_number.match(/QTN-\d{8}-(\d+)/);
    if (match) nextSeq = Number(match[1]) + 1;
  }

  return `QTN-${baseKey}-${String(nextSeq).padStart(3, "0")}`;
}







export async function POST(req) {
  try {
    const body = await req.json();

    const {
      rfqId,
      companyId,
      branchId,
      proposal_date,
      billing_address,
      shipping_address,
      place,
      items = [],
      charges = []   // ⭐ NEW
    } = body;

    const safeCharges = Array.isArray(charges) ? charges : [];

    /* ---------- validations ---------- */
    if (!rfqId || !companyId || !branchId) {
      return Response.json(
        { message: "rfqId, companyId, branchId are required" },
        { status: 400 }
      );
    }

    if (!proposal_date) {
      return Response.json(
        { message: "proposal_date is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return Response.json(
        { message: "At least one item is required" },
        { status: 400 }
      );
    }

    /* ---------- 1) Compute charges totals (override) ---------- */
    let extra_charges_amount = 0;
    let extra_charges_tax = 0;

    for (const ch of safeCharges) {
      const amount = Number(ch.amount || 0);
      const taxPercent = Number(ch.taxPercent || 0);

      const tax = (amount * taxPercent) / 100;

      extra_charges_amount += amount;
      extra_charges_tax += tax;
    }

    /* ---------- 2) Items totals ---------- */
    let subtotal = 0;
    let cgst_total = 0;
    let sgst_total = 0;
    let igst_total = 0;

    const computedItems = items.map((it) => {
      const qty = Number(it.quantity ?? it.qty ?? 1);
      const rate = Number(it.rate ?? 0);
      const discount = Number(it.discount ?? 0);

      const cgst_rate = Number(it.cgst_rate ?? it.cgst ?? 0);
      const sgst_rate = Number(it.sgst_rate ?? it.sgst ?? 0);
      const igst_rate = Number(it.igst_rate ?? it.igst ?? 0);

      const amount = calcAmount(qty, rate, discount);

      const cgst = calcTax(amount, cgst_rate);
      const sgst = calcTax(amount, sgst_rate);
      const igst = calcTax(amount, igst_rate);

      const line_total = amount + cgst + sgst + igst;

      subtotal += amount;
      cgst_total += cgst;
      sgst_total += sgst;
      igst_total += igst;

      return {
        productId: Number(it.productId),
        quantity: qty,
        rate,
        discount,
        cgst_rate,
        sgst_rate,
        igst_rate,
        line_total,
      };
    });

    /* ---------- 3) Grand total ---------- */
    const grand_total =
      subtotal +
      cgst_total +
      sgst_total +
      igst_total +
      extra_charges_amount +
      extra_charges_tax;

    /* ---------- 4) Insert / Update proposal ---------- */
    const [[existingProposal]] = await db.query(
      `SELECT id, proposal_number FROM proposals WHERE rfq_id = ? LIMIT 1`,
      [rfqId]
    );

    let proposalId;
    let proposal_number;

    if (existingProposal) {
      proposalId = existingProposal.id;
      proposal_number = existingProposal.proposal_number;

      await db.query(
        `UPDATE proposals
         SET company_id=?, branch_id=?, proposal_date=?,
             billing_address=?, shipping_address=?,
             subtotal=?, cgst_total=?, sgst_total=?, igst_total=?, grand_total=?,
             status='Pending',
             place=?
         WHERE id=?`,
        [
          companyId,
          branchId,
          proposal_date,
          billing_address || null,
          shipping_address || null,
          subtotal,
          cgst_total,
          sgst_total,
          igst_total,
          grand_total,
          place || null,
          proposalId,
        ]
      );

      await db.query(
        `DELETE FROM proposal_items WHERE proposal_id = ?`,
        [proposalId]
      );

    } else {
      proposal_number = await generateNextProposalNumber();

      const [result] = await db.query(
        `INSERT INTO proposals
         (rfq_id, company_id, branch_id, proposal_number, proposal_date,
          billing_address, shipping_address,
          subtotal, cgst_total, sgst_total, igst_total, grand_total,
          status, place)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)`,
        [
          rfqId,
          companyId,
          branchId,
          proposal_number,
          proposal_date,
          billing_address || null,
          shipping_address || null,
          subtotal,
          cgst_total,
          sgst_total,
          igst_total,
          grand_total,
          place || null,
        ]
      );

      proposalId = result.insertId;
    }

    /* ---------- 5) Insert items ---------- */
    for (const it of computedItems) {
      if (!it.productId) continue;

      await db.query(
        `INSERT INTO proposal_items
         (proposal_id, product_id, quantity, rate, discount,
          cgst_rate, sgst_rate, igst_rate, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          proposalId,
          it.productId,
          it.quantity,
          it.rate,
          it.discount,
          it.cgst_rate,
          it.sgst_rate,
          it.igst_rate,
          it.line_total,
        ]
      );
    }

    /* ---------- 6) Save proposal override charges ---------- */
    await db.query(
      `DELETE FROM proposal_charges WHERE proposal_id = ?`,
      [proposalId]
    );

    for (const ch of safeCharges) {
      if (!ch.label) continue;

      await db.query(
        `INSERT INTO proposal_charges
         (proposal_id, label, amount, tax_percent)
         VALUES (?, ?, ?, ?)`,
        [
          proposalId,
          ch.label,
          Number(ch.amount || 0),
          Number(ch.taxPercent || 0),
        ]
      );
    }

    /* ---------- response ---------- */
    return Response.json({
      message: existingProposal
        ? "✅ Proposal updated successfully"
        : "✅ Proposal created successfully",
      proposalId,
      proposal_number,
      charges_summary: {
        amount: extra_charges_amount,
        tax: extra_charges_tax,
      },
    });

  } catch (err) {
    console.error("POST /api/proposals error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}


export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        p.id,
        p.proposal_number,
        p.proposal_date,
        p.grand_total,
        p.status,

        p.company_id,
        p.branch_id,
        p.rfq_id,

        r.rfq_number,
        r.client_name,
        r.client_email,

        c.company_name,
        cb.branch_name

      FROM proposals p
      LEFT JOIN rfqs r ON r.id = p.rfq_id
      LEFT JOIN companies c ON c.id = p.company_id
      LEFT JOIN company_branches cb ON cb.id = p.branch_id
      ORDER BY p.id DESC
    `);

    return Response.json(rows);
  } catch (err) {
    console.error("admin proposals error:", err);
    return Response.json({ error: "DB error" }, { status: 500 });
  }
}