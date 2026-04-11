// import { db } from "../../db";

// export async function GET() {
//   try {
//     /* ================= ORGANIZATIONS ================= */
//     const [orgRows] = await db.query(`
//       SELECT id, company_name AS name
//       FROM companies
//       ORDER BY id DESC
//     `);

//     /* ================= BRANCHES ================= */
//     const [branchRows] = await db.query(`
//       SELECT id, company_id AS orgId, branch_name AS name
//       FROM company_branches
//       ORDER BY id DESC
//     `);

//     /* ================= RFQS ================= */
//     const [rfqRows] = await db.query(`
//       SELECT 
//         r.id,
//         r.company_id AS orgId,
//         c.company_name AS orgName,
//         r.branch_id AS branchId,
//         b.branch_name AS branch,
//         r.submitted_at AS submittedAt,
//         r.status,
//         r.rfq_number,
//         r.notes,
//         r.client_name,
//         r.client_phone,
//         r.client_email
//       FROM rfqs r
//       JOIN companies c ON c.id = r.company_id
//       JOIN company_branches b ON b.id = r.branch_id
//       WHERE r.status != 'Draft'
//       ORDER BY r.id DESC
//     `);

//     /* ================= PRODUCTS ================= */
//     const [productRows] = await db.query(`
//       SELECT
//         rp.rfq_id AS rfqId,
//         p.id AS productId,
//         p.product_name AS name,
//         p.sku AS code,
//         p.hsn,
//         rp.quoted_price,
//         rp.quantity
//       FROM rfq_products rp
//       JOIN products p ON p.id = rp.product_id
//       ORDER BY rp.rfq_id DESC
//     `);

//     /* ================= ORG STRUCTURE ================= */
//     const organizations = orgRows.map((o) => ({
//       id: o.id,
//       name: o.name,
//       branches: branchRows
//         .filter((b) => b.orgId === o.id)
//         .map((b) => ({ id: b.id, name: b.name })),
//     }));

//     /* ================= RFQ STRUCTURE ================= */
//     const rfqs = rfqRows.map((r) => ({
//       id: r.id,
//       orgId: r.orgId,
//       orgName: r.orgName,
//       branchId: r.branchId,
//       branch: r.branch,

//       // ✅ RFQ NUMBER SAFE
//       rfqNumber: r.rfq_number || "",

//       submittedAt: r.submittedAt,
//       status: r.status,
//       notes: r.notes,

//       clientName: r.client_name || "",
//       clientPhone: r.client_phone || "",
//       clientEmail: r.client_email || "",

//       products: productRows
//         .filter((p) => p.rfqId === r.id)
//         .map((p) => ({
//           id: p.productId,
//           name: p.name,
//           hsn: p.hsn,
//           code: p.code,
//           rate:p.quoted_price,
//           quantity: p.quantity,
//           totalAmount:p.quoted_price * p.quantity,
//         })),
//     }));

//     return Response.json({ organizations, rfqs }, { status: 200 });
//   } catch (err) {
//     console.error("GET /api/rfqs error:", err);
//     return Response.json(
//       { message: "Server error while loading RFQs" },
//       { status: 500 }
//     );
//   }
// }


import { db } from "../../db";

export async function GET() {
  try {
    /* ================= ORGANIZATIONS ================= */
    const [orgRows] = await db.query(`
      SELECT id, company_name AS name
      FROM companies
      ORDER BY id DESC
    `);

    /* ================= BRANCHES ================= */
    const [branchRows] = await db.query(`
      SELECT id, company_id AS orgId, branch_name AS name
      FROM company_branches
      ORDER BY id DESC
    `);

    /* ================= RFQS ================= */
    const [rfqRows] = await db.query(`
      SELECT 
        r.id,
        r.company_id AS orgId,
        c.company_name AS orgName,
        r.branch_id AS branchId,
        b.branch_name AS branch,
        r.submitted_at AS submittedAt,
        r.status,
        r.rfq_number,
        r.notes,
        r.client_name,
        r.client_phone,
        r.client_email
      FROM rfqs r
      JOIN companies c ON c.id = r.company_id
      JOIN company_branches b ON b.id = r.branch_id
      WHERE r.status != 'Draft'
      ORDER BY r.id DESC
    `);

    /* ================= PRODUCTS (UPDATED 🔥) ================= */
    const [productRows] = await db.query(`
      SELECT
        rp.rfq_id AS rfqId,
        p.id AS productId,

        CASE 
          WHEN cpp.prefix IS NOT NULL AND cpp.prefix != ''
          THEN CONCAT(cpp.prefix, ' | ', p.product_name)
          ELSE p.product_name
        END AS name,

        p.sku AS code,
        p.hsn,
        rp.quoted_price,
        rp.quantity
      FROM rfq_products rp
      JOIN products p ON p.id = rp.product_id

      LEFT JOIN company_product_pricing cpp
        ON cpp.product_id = p.id
        AND cpp.company_id = (
          SELECT r2.company_id 
          FROM rfqs r2 
          WHERE r2.id = rp.rfq_id
        )

      ORDER BY rp.rfq_id DESC
    `);

    /* ================= ORG STRUCTURE ================= */
    const organizations = orgRows.map((o) => ({
      id: o.id,
      name: o.name,
      branches: branchRows
        .filter((b) => b.orgId === o.id)
        .map((b) => ({ id: b.id, name: b.name })),
    }));

    /* ================= RFQ STRUCTURE ================= */
    const rfqs = rfqRows.map((r) => ({
      id: r.id,
      orgId: r.orgId,
      orgName: r.orgName,
      branchId: r.branchId,
      branch: r.branch,

      rfqNumber: r.rfq_number || "",
      submittedAt: r.submittedAt,
      status: r.status,
      notes: r.notes,

      clientName: r.client_name || "",
      clientPhone: r.client_phone || "",
      clientEmail: r.client_email || "",

      products: productRows
        .filter((p) => p.rfqId === r.id)
        .map((p) => ({
          id: p.productId,
          name: p.name,   // ✅ NOW PREFIX INCLUDED
          hsn: p.hsn,
          code: p.code,
          rate: p.quoted_price,
          quantity: p.quantity,
          totalAmount: p.quoted_price * p.quantity,
        })),
    }));

    return Response.json({ organizations, rfqs }, { status: 200 });
  } catch (err) {
    console.error("GET /api/rfqs error:", err);
    return Response.json(
      { message: "Server error while loading RFQs" },
      { status: 500 }
    );
  }
}