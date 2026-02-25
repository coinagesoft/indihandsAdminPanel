import { db } from "../../../../db";

export async function GET(req, { params }) {
  try {
const { id } = await params; 
    const rfqId = Number(id);

    if (!rfqId) {
      return Response.json({ message: "Invalid rfqId" }, { status: 400 });
    }

    // ✅ RFQ + Company + Branch header
    const [headerRows] = await db.query(
      `
      SELECT
        r.id AS rfqId,
        r.company_id AS companyId,
        r.branch_id AS branchId,
        r.submitted_at AS submittedAt,
        r.status,
        r.notes,
        r.client_name,
  r.client_phone,
  r.client_email,
        c.company_name AS company,
        c.company_email AS companyEmail,
        cb.gstin,
        cb.branch_name AS branchName,
        cb.contact_person AS customerName,
        cb.billing_address,
        cb.shipping_address
        
      FROM rfqs r
      JOIN companies c ON c.id = r.company_id
      JOIN company_branches cb ON cb.id = r.branch_id
      WHERE r.id = ?
      LIMIT 1
      `,
      [rfqId]
    );

    if (headerRows.length === 0) {
      return Response.json({ message: "RFQ not found" }, { status: 404 });
    }

    const header = headerRows[0];

    // ✅ RFQ items
    // ✅ rate priority:
    // 1) rfq_products.quoted_price (if filled)
    // 2) company_product_pricing.custom_price (if exists)
    // 3) products.base_price
 // check proposal exists
const [[proposalRow]] = await db.query(
  `SELECT id FROM proposals WHERE rfq_id=? LIMIT 1`,
  [rfqId]
);

let items = [];

if (proposalRow) {
  const [pItems] = await db.query(
    `
    SELECT
      pi.product_id AS productId,
      p.product_name AS description,
      p.hsn,
      pi.quantity AS qty,
      pi.rate,
       p.base_price AS basePrice,  
      pi.discount,
      pi.cgst_rate AS cgst,
      pi.sgst_rate AS sgst,
      pi.igst_rate AS igst
    FROM proposal_items pi
    JOIN products p ON p.id = pi.product_id
    WHERE pi.proposal_id = ?
    ORDER BY pi.id ASC
    `,
    [proposalRow.id]
  );

  items = pItems.map(x => {
    const qty = Number(x.qty || 1);
    const rate = Number(x.rate || 0);
     const basePrice = Number(x.basePrice || 0);
    const discountPercent = Number(x.discount || 0);

    return {
      productId: x.productId,
      description: x.description,
      hsn: x.hsn,
      uom: "No",
      qty,
        basePrice,
      rate,
      discount: Number(discountPercent.toFixed(2)), // ONLY %
      cgst: Number(x.cgst || 0),
      sgst: Number(x.sgst || 0),
      igst: Number(x.igst || 0),
    };
  });
} else {
  const [itemRows] = await db.query(
    `
    SELECT
      rp.product_id AS productId,
      p.product_name AS description,
      p.hsn,
      rp.quantity AS qty,
      rp.quoted_price AS quotedPrice,
      cpp.custom_price AS customPrice,
     p.base_price AS basePrice,  
    FROM rfq_products rp
    JOIN products p ON p.id = rp.product_id
    LEFT JOIN company_product_pricing cpp
      ON cpp.company_id = ? AND cpp.product_id = rp.product_id
    WHERE rp.rfq_id = ?
    ORDER BY rp.product_id ASC
    `,
    [header.companyId, rfqId]
  );

  items = itemRows.map(x => {
    const qty = Number(x.qty || 1);
    const basePrice = Number(x.basePrice || 0);

    const rate =
      x.quotedPrice != null
        ? Number(x.quotedPrice)
        : x.customPrice != null
        ? Number(x.customPrice)
        : basePrice;

    // ✅ per unit discount
  const discountPerUnit =
    basePrice > rate ? basePrice - rate : 0;

  // ✅ per product %
  const discountPercent =
    basePrice > 0
      ? (discountPerUnit / basePrice) * 100
      : 0;

  // ✅ per product amount (qty included)
  const discountAmount =
    discountPerUnit * qty;

    return {
      productId: x.productId,
      description: x.description,
      hsn: x.hsn,
      uom: "No",
      qty,
      rate,
        basePrice,
      discount: Number(discountPercent.toFixed(2)), // ONLY %
      cgst: 9,
      sgst: 9,
      igst: 0,
    };
  });
}

    return Response.json(
      {
        header: {
          rfqId: header.rfqId,
          companyId: header.companyId,
          branchId: header.branchId,
          customerName: header.customerName || header.company,
          clientName: header.client_name || "",
  clientPhone: header.client_phone || "",
  clientEmail: header.client_email || "",
          company: header.company,
          gstin: header.gstin || "",
          place: header.place, // optional
          billing_address: header.billing_address || "",
          shipping_address: header.shipping_address || "",
          submittedAt: header.submittedAt,
          status: header.status,
          notes: header.notes || "",
        },
        items,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/rfqs/[rfqId]/details error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}


// export async function GET(req, { params }) {
//   try {
//     const { id } = await params;
//     const rfqId = Number(id);

//     if (!rfqId) {
//       return Response.json({ message: "Invalid rfqId" }, { status: 400 });
//     }

//     /* ================= HEADER ================= */
//     const [headerRows] = await db.query(
//       `
//       SELECT
//         r.id AS rfqId,
//         r.company_id AS companyId,
//         r.branch_id AS branchId,
//         r.submitted_at AS submittedAt,
//         r.status,
//         r.notes,
//         r.client_name,
//         r.client_phone,
//         r.client_email,
//         c.company_name AS company,
//         c.company_email AS companyEmail,
//         cb.gstin,
//         cb.branch_name AS branchName,
//         cb.contact_person AS customerName,
//         cb.billing_address,
//         cb.shipping_address
//       FROM rfqs r
//       JOIN companies c ON c.id = r.company_id
//       JOIN company_branches cb ON cb.id = r.branch_id
//       WHERE r.id = ?
//       LIMIT 1
//       `,
//       [rfqId]
//     );

//     if (headerRows.length === 0) {
//       return Response.json({ message: "RFQ not found" }, { status: 404 });
//     }

//     const header = headerRows[0];

//     /* ================= CHECK PROPOSAL ================= */
//     const [[proposalRow]] = await db.query(
//       `SELECT id FROM proposals WHERE rfq_id=? LIMIT 1`,
//       [rfqId]
//     );

//     let items = [];

//     /* =========================================================
//        CASE 1️⃣ PROPOSAL EXISTS → use saved discount (%)
//     ========================================================= */
//     if (proposalRow) {
//       const [pItems] = await db.query(
//         `
//         SELECT
//           pi.product_id AS productId,
//           p.product_name AS description,
//           p.hsn,
//           p.base_price AS basePrice,
//           pi.quantity AS qty,
//           pi.rate,
//           pi.discount,
//           pi.cgst_rate AS cgst,
//           pi.sgst_rate AS sgst,
//           pi.igst_rate AS igst
//         FROM proposal_items pi
//         JOIN products p ON p.id = pi.product_id
//         WHERE pi.proposal_id = ?
//         ORDER BY pi.id ASC
//         `,
//         [proposalRow.id]
//       );

//     items = pItems.map(x => {
//   const qty = Number(x.qty || 1);
//   const rate = Number(x.rate || 0);
//   const base = Number(x.basePrice || 0);
//   const discountPercent = Number(x.discount || 0);

//   const rowBase = qty * rate;
//   const discountAmount =
//     rowBase > 0 ? (rowBase * discountPercent) / 100 : 0;
    

//   return {
//     productId: x.productId,
//     description: x.description,
//     hsn: x.hsn,
//     uom: "No",
//     qty,

//     basePrice: base,
//     rate,

//     discount: discountPercent,
//     discountPercent,
//     discountAmount: Number(discountAmount.toFixed(2)),

//     cgst: Number(x.cgst || 0),
//     sgst: Number(x.sgst || 0),
//     igst: Number(x.igst || 0),
//   };
// });

//     } else {
//       /* =========================================================
//          CASE 2️⃣ RFQ DEFAULT → compute discount
//       ========================================================= */
//       const [itemRows] = await db.query(
//         `
//         SELECT
//           rp.product_id AS productId,
//           p.product_name AS description,
//           p.hsn,
//           rp.quantity AS qty,
//           rp.quoted_price AS quotedPrice,
//           cpp.custom_price AS customPrice,
//           p.base_price AS basePrice
//         FROM rfq_products rp
//         JOIN products p ON p.id = rp.product_id
//         LEFT JOIN company_product_pricing cpp
//           ON cpp.company_id = ? AND cpp.product_id = rp.product_id
//         WHERE rp.rfq_id = ?
//         ORDER BY rp.product_id ASC
//         `,
//         [header.companyId, rfqId]
//       );

//      items = itemRows.map(x => {
//   const qty = Number(x.qty || 1);
//   const base = Number(x.basePrice || 0);

//   const rate =
//     x.quotedPrice != null
//       ? Number(x.quotedPrice)
//       : x.customPrice != null
//       ? Number(x.customPrice)
//       : base;

//   const rowBaseOriginal = qty * base;
//   const rowBase = qty * rate;

//   const discountAmount =
//     rowBaseOriginal > rowBase
//       ? rowBaseOriginal - rowBase
//       : 0;

//   const discountPercent =
//     rowBaseOriginal > 0
//       ? (discountAmount / rowBaseOriginal) * 100
//       : 0;

//   return {
//     productId: x.productId,
//     description: x.description,
//     hsn: x.hsn,
//     uom: "No",
//     qty,

//     basePrice: base,
//     rate,

//     discount: Number(discountPercent.toFixed(2)),
//     discountPercent: Number(discountPercent.toFixed(2)),
//     discountAmount: Number(discountAmount.toFixed(2)),

//     cgst: 9,
//     sgst: 9,
//     igst: 0,
//   };
// });
//     }

//     /* ================= RESPONSE ================= */
//     return Response.json(
//       {
//         header: {
//           rfqId: header.rfqId,
//           companyId: header.companyId,
//           branchId: header.branchId,
//           customerName: header.customerName || header.company,
//           clientName: header.client_name || "",
//           clientPhone: header.client_phone || "",
//           clientEmail: header.client_email || "",
//           company: header.company,
//           gstin: header.gstin || "",
//           billing_address: header.billing_address || "",
//           shipping_address: header.shipping_address || "",
//           submittedAt: header.submittedAt,
//           status: header.status,
//           notes: header.notes || "",
//         },
//         items,
//       },
//       { status: 200 }
//     );
//   } catch (err) {
//     console.error("GET /api/rfqs/[rfqId]/details error:", err);
//     return Response.json({ message: "Server error" }, { status: 500 });
//   }
// }