import { db } from "../../../../db";

// export async function GET(req, { params }) {
//   try {
// const { id } = await params; 
//     const rfqId = Number(id);

//     if (!rfqId) {
//       return Response.json({ message: "Invalid rfqId" }, { status: 400 });
//     }

//     // ✅ RFQ + Company + Branch header
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
//   r.client_phone,
//   r.client_email,
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

//     // ✅ RFQ items
//     // ✅ rate priority:
//     // 1) rfq_products.quoted_price (if filled)
//     // 2) company_product_pricing.custom_price (if exists)
//     // 3) products.base_price
//  // check proposal exists
// const [[proposalRow]] = await db.query(
//   `SELECT id FROM proposals WHERE rfq_id=? LIMIT 1`,
//   [rfqId]
// );

// let items = [];

// if (proposalRow) {
//   const [pItems] = await db.query(
//     `
//     SELECT
//       pi.product_id AS productId,
//        CASE 
//       WHEN cpp.prefix IS NOT NULL AND cpp.prefix != ''
//       THEN CONCAT(cpp.prefix, ' | ', p.product_name)
//       ELSE p.product_name
//     END AS description,
//       p.hsn,
//       pi.quantity AS qty,
//       pi.rate,
//        p.base_price AS basePrice,  
//       pi.discount,
//       pi.cgst_rate AS cgst,
//       pi.sgst_rate AS sgst,
//       pi.igst_rate AS igst
//     FROM proposal_items pi
//     JOIN products p ON p.id = pi.product_id

//   LEFT JOIN company_product_pricing cpp
//     ON cpp.product_id = p.id
//     AND cpp.company_id = ?

//     WHERE pi.proposal_id = ?
//     ORDER BY pi.id ASC
//     `,
//    [header.companyId, proposalRow.id]
//   );

//   items = pItems.map(x => {
//     const qty = Number(x.qty || 1);
//     const rate = Number(x.rate || 0);
//      const basePrice = Number(x.basePrice || 0);
//     const discountPercent = Number(x.discount || 0);

//     return {
//       productId: x.productId,
//       description: x.description,
//       hsn: x.hsn,
//       uom: "No",
//       qty,
//       basePrice,
//       rate,
//       discount: Number(discountPercent.toFixed(2)), // ONLY %
//       cgst: Number(x.cgst || 0),
//       sgst: Number(x.sgst || 0),
//       igst: Number(x.igst || 0),
//     };
//   });
// } else {
//   const [itemRows] = await db.query(
//     `
//     SELECT
//       rp.product_id AS productId,
//        CASE 
//       WHEN cpp.prefix IS NOT NULL AND cpp.prefix != ''
//       THEN CONCAT(cpp.prefix, ' | ', p.product_name)
//       ELSE p.product_name
//     END AS description,
//       p.hsn,
//       rp.quantity AS qty,
//       rp.quoted_price AS quotedPrice,
//       cpp.custom_price AS customPrice,
//      p.base_price AS basePrice ,
//      p.cgst_rate,
//      p.sgst_rate,
//      p.igst_rate
//     FROM rfq_products rp
//     JOIN products p ON p.id = rp.product_id

//       LEFT JOIN company_product_pricing cpp
//     ON cpp.company_id = ? 
//     AND cpp.product_id = rp.product_id

//     WHERE rp.rfq_id = ?
//     ORDER BY rp.product_id ASC
//     `,
//     [header.companyId, rfqId]
//   );

//   items = itemRows.map(x => {
//     const qty = Number(x.qty || 1);
//     const basePrice = Number(x.basePrice || 0);

//     const rate =
//       x.quotedPrice != null
//         ? Number(x.quotedPrice)
//         : x.customPrice != null
//         ? Number(x.customPrice)
//         : basePrice;

//     // ✅ per unit discount
//   const discountPerUnit =
//     basePrice > rate ? basePrice - rate : 0;

//   // ✅ per product %
//   const discountPercent =
//     basePrice > 0
//       ? (discountPerUnit / basePrice) * 100
//       : 0;

//   // ✅ per product amount (qty included)
//   const discountAmount =
//     discountPerUnit * qty;

//     return {
//       productId: x.productId,
//       description: x.description,
//       hsn: x.hsn,
//       uom: "No",
//       qty,
//       rate,
//       basePrice,
      
//       discount: Number(discountPercent.toFixed(2)), // ONLY %
//     cgst: Number(x.cgst_rate ?? 0),
// sgst: Number(x.sgst_rate ?? 0),
// igst: Number(x.igst_rate ?? 0),
//     };
//   });
// }

//     return Response.json(
//       {
//         header: {
//           rfqId: header.rfqId,
//           companyId: header.companyId,
//           branchId: header.branchId,
//           customerName: header.customerName || header.company,
//           clientName: header.client_name || "",
//           clientPhone: header.client_phone || "",
//            clientEmail: header.client_email || "",
//           company: header.company,
//           gstin: header.gstin || "",
//           place: header.place, // optional
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


export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const rfqId = Number(id);

    if (!rfqId) {
      return Response.json({ message: "Invalid rfqId" }, { status: 400 });
    }

    /* ================= HEADER ================= */
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
r.billing_type,
      COALESCE(p.company_name, c.company_name) AS company,
        c.company_email AS companyEmail,

        cb.gstin,
        cb.branch_name AS branchName,
        cb.contact_person AS customerName,
        cb.billing_address,
        cb.shipping_address

      FROM rfqs r
      JOIN companies c ON c.id = r.company_id
      JOIN company_branches cb ON cb.id = r.branch_id
      LEFT JOIN proposals p ON p.rfq_id = r.id
      WHERE r.id = ?
      LIMIT 1
      `,
      [rfqId]
    );




    if (headerRows.length === 0) {
      return Response.json({ message: "RFQ not found" }, { status: 404 });
    }

    const header = headerRows[0];


const proposalCompany = header.company; // COALESCE already
const hasProposalCompany = proposalCompany && proposalCompany.includes("(");

    /* ================= GST STATE LOGIC (DYNAMIC) ================= */

    // ✅ Seller GST (company)
    const [[companyRow]] = await db.query(
      `
      SELECT gstin 
      FROM company_branches 
      WHERE company_id = ?
      ORDER BY id ASC
      LIMIT 1
      `,
      [header.companyId]
    );

    const senderStateCode = companyRow?.gstin?.substring(0, 2) || "";
    const clientStateCode = header.gstin?.substring(0, 2) || "";

    const isInterState = senderStateCode !== clientStateCode;

    /* ================= CHECK PROPOSAL ================= */

    const [[proposalRow]] = await db.query(
      `SELECT id FROM proposals WHERE rfq_id=? LIMIT 1`,
      [rfqId]
    );

    let items = [];

    let proposalData = null;

if (proposalRow) {
  const [[p]] = await db.query(
    `SELECT billing_address, shipping_address 
     FROM proposals 
     WHERE id=?`,
    [proposalRow.id]
  );

  proposalData = p;
}

    /* ================= CASE 1: PROPOSAL EXISTS ================= */

    if (proposalRow) {
      const [pItems] = await db.query(
        `
        SELECT
          pi.product_id AS productId,

          CASE 
            WHEN cpp.prefix IS NOT NULL AND cpp.prefix != ''
            THEN CONCAT(cpp.prefix, ' | ', p.product_name)
            ELSE p.product_name
          END AS description,

          p.hsn,
          pi.quantity AS qty,
          pi.rate,
          p.base_price AS basePrice,
          pi.discount,

          pi.cgst_rate,
          pi.sgst_rate,
          pi.igst_rate

        FROM proposal_items pi
        JOIN products p ON p.id = pi.product_id

        LEFT JOIN company_product_pricing cpp
          ON cpp.product_id = p.id
          AND cpp.company_id = ?

        WHERE pi.proposal_id = ?
        ORDER BY pi.id ASC
        `,
        [header.companyId, proposalRow.id]
      );

      items = pItems.map((x) => {
        const qty = Number(x.qty || 1);
        const rate = Number(x.rate || 0);
        const basePrice = Number(x.basePrice || 0);
        const discountPercent = Number(x.discount || 0);

        const cgstRate = Number(x.cgst_rate ?? 0);
        const sgstRate = Number(x.sgst_rate ?? 0);
        const igstRate = Number(x.igst_rate ?? 0);

        return {
          productId: x.productId,
          description: x.description,
          hsn: x.hsn,
          uom: "No",
          qty,
          rate,
          basePrice,
          discount: Number(discountPercent.toFixed(2)),

          // ✅ STATE-BASED TAX
          cgst: isInterState ? 0 : cgstRate,
          sgst: isInterState ? 0 : sgstRate,
          igst: isInterState ? igstRate : 0,
        };
      });
    }

    /* ================= CASE 2: RFQ ONLY ================= */

    else {
      const [itemRows] = await db.query(
        `
        SELECT
          rp.product_id AS productId,

          CASE 
            WHEN cpp.prefix IS NOT NULL AND cpp.prefix != ''
            THEN CONCAT(cpp.prefix, ' | ', p.product_name)
            ELSE p.product_name
          END AS description,

          p.hsn,
          rp.quantity AS qty,
          rp.quoted_price AS quotedPrice,
          cpp.custom_price AS customPrice,
          p.base_price AS basePrice,

          p.cgst_rate,
          p.sgst_rate,
          p.igst_rate

        FROM rfq_products rp
        JOIN products p ON p.id = rp.product_id

        LEFT JOIN company_product_pricing cpp
          ON cpp.company_id = ?
          AND cpp.product_id = rp.product_id

        WHERE rp.rfq_id = ?
        ORDER BY rp.product_id ASC
        `,
        [header.companyId, rfqId]
      );

      items = itemRows.map((x) => {
        const qty = Number(x.qty || 1);
        const basePrice = Number(x.basePrice || 0);

        const rate =
          x.quotedPrice != null
            ? Number(x.quotedPrice)
            : x.customPrice != null
            ? Number(x.customPrice)
            : basePrice;

        const discountPerUnit =
          basePrice > rate ? basePrice - rate : 0;

        const discountPercent =
          basePrice > 0
            ? (discountPerUnit / basePrice) * 100
            : 0;

        const cgstRate = Number(x.cgst_rate ?? 0);
        const sgstRate = Number(x.sgst_rate ?? 0);
        const igstRate = Number(x.igst_rate ?? 0);

        return {
          productId: x.productId,
          description: x.description,
          hsn: x.hsn,
          uom: "No",
          qty,
          rate,
          basePrice,
          discount: Number(discountPercent.toFixed(2)),

          // ✅ STATE-BASED TAX
          cgst: isInterState ? 0 : cgstRate,
          sgst: isInterState ? 0 : sgstRate,
          igst: isInterState ? igstRate : 0,
        };
      });
    }

    /* ================= RESPONSE ================= */
// ✅ variables OUTSIDE
const clientName = header.client_name || "";
const companyName = header.company || "";
const address =
  proposalData?.billing_address || header.billing_address || "";

const shippingAddress =
  proposalData?.shipping_address || header.shipping_address || "";

// 📍 extract location
const location = address.includes(",")
  ? address.split(",").pop().trim()
  : address;

const isSelf = header.billing_type === "self";
const pureCompany = proposalCompany.includes("(")
  ? proposalCompany.split("(").pop().replace(")", "").trim()
  : proposalCompany;
// ✅ response
return Response.json(
  {
    header: {
      rfqId: header.rfqId,
      companyId: header.companyId,
      branchId: header.branchId,

      // ✅ NAME
      customerName: isSelf
        ? `${clientName} (${companyName})`
        : header.customerName || companyName,

      clientName,
      clientPhone: header.client_phone || "",
      clientEmail: header.client_email || "",

company: isSelf
  ? (hasProposalCompany
      ? proposalCompany   // ✅ already formatted → use directly
      : (clientName
          ? `${clientName} (${proposalCompany})`
          : proposalCompany))
  : proposalCompany,

      // ✅ GSTIN
      gstin: isSelf ? "" : header.gstin || "",

      // ✅ BILLING
   billing_address: isSelf
  ? `${pureCompany}, ${location}`
  : address,

shipping_address: isSelf
  ? `${pureCompany}, ${location}`
  : shippingAddress,



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