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

  const HH = String(now.getHours()).padStart(2, "0");
  const MIN = String(now.getMinutes()).padStart(2, "0");
  const SS = String(now.getSeconds()).padStart(2, "0");

  const baseKey = `${YYYY}${MM}${DD}-${HH}${MIN}${SS}`;

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
    const match = row.proposal_number.match(/QTN-\d{8}-\d{6}-(\d+)/);
    if (match) nextSeq = Number(match[1]) + 1;
  }

  return `QTN-${baseKey}-${String(nextSeq).padStart(3, "0")}`;
}

/* ---------------- POST (UPSERT) ---------------- */
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
      place, // ✅ optional (if you store it)
      items = [],
    } = body;

    // ✅ validations
    if (!rfqId || !companyId || !branchId) {
      return Response.json(
        { message: "rfqId, companyId, branchId are required" },
        { status: 400 }
      );
    }

    if (!proposal_date) {
      return Response.json({ message: "proposal_date is required" }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return Response.json({ message: "items required" }, { status: 400 });
    }

    /* ✅ 1) Fetch Pricing Defaults */
    const [[pricingDefaults]] = await db.query(`
      SELECT sgst_rate, cgst_rate, igst_rate, delivery_charges, branding_charges
      FROM pricing_defaults
      ORDER BY id DESC
      LIMIT 1
    `);

    const defaults = pricingDefaults || {
      sgst_rate: 0,
      cgst_rate: 0,
      igst_rate: 0,
      delivery_charges: 0,
      branding_charges: 0,
    };

    /* ✅ 2) Calculate totals */
    let subtotal = 0;
    let cgst_total = 0;
    let sgst_total = 0;
    let igst_total = 0;

    const computedItems = items.map((it) => {
      const qty = Number(it.quantity ?? it.qty ?? 1);
      const rate = Number(it.rate ?? 0);
      const discount = Number(it.discount ?? 0);

      const cgst_rate =
        it.cgst_rate != null || it.cgst != null
          ? Number(it.cgst_rate ?? it.cgst)
          : Number(defaults.cgst_rate);

      const sgst_rate =
        it.sgst_rate != null || it.sgst != null
          ? Number(it.sgst_rate ?? it.sgst)
          : Number(defaults.sgst_rate);

      const igst_rate =
        it.igst_rate != null || it.igst != null
          ? Number(it.igst_rate ?? it.igst)
          : Number(defaults.igst_rate);

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

    const deliveryCharges = Number(defaults.delivery_charges || 0);
    const brandingCharges = Number(defaults.branding_charges || 0);

    const grand_total =
      subtotal +
      cgst_total +
      sgst_total +
      igst_total +
      deliveryCharges +
      brandingCharges;

    /* ✅ 3) Check existing proposal for same RFQ */
    const [[existingProposal]] = await db.query(
      `SELECT id, proposal_number FROM proposals WHERE rfq_id = ? LIMIT 1`,
      [rfqId]
    );

    let proposalId = null;
    let proposal_number = null;

    if (existingProposal) {
      // ✅ UPDATE (same proposal_number keep)
      proposalId = existingProposal.id;
      proposal_number = existingProposal.proposal_number;

      await db.query(
        `
        UPDATE proposals
        SET company_id=?, branch_id=?, proposal_date=?,
            billing_address=?, shipping_address=?,
            subtotal=?, cgst_total=?, sgst_total=?, igst_total=?, grand_total=?,
            status='Pending',
            place=?
        WHERE id=?
        `,
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

      // ✅ Replace items (delete old then insert new)
      await db.query(`DELETE FROM proposal_items WHERE proposal_id = ?`, [proposalId]);
    } else {
      // ✅ INSERT new proposal
      proposal_number = await generateNextProposalNumber();

      const [result] = await db.query(
        `
        INSERT INTO proposals
        (rfq_id, company_id, branch_id, proposal_number, proposal_date,
         billing_address, shipping_address, subtotal, cgst_total, sgst_total, igst_total, grand_total,
         status, place)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)
        `,
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

    /* ✅ 4) Insert proposal items */
    for (const it of computedItems) {
      if (!it.productId) continue;

      await db.query(
        `
        INSERT INTO proposal_items
        (proposal_id, product_id, quantity, rate, discount, cgst_rate, sgst_rate, igst_rate, line_total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
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

    return Response.json(
      {
        message: existingProposal ? "✅ Proposal updated successfully" : "✅ Proposal created successfully",
        proposalId,
        proposal_number, // ✅ same RFQ always same number
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("POST /api/proposals error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
