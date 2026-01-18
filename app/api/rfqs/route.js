import { db } from "../../db";

export async function GET() {
  try {
    // ✅ Organizations
    const [orgRows] = await db.query(`
      SELECT id, company_name AS name
      FROM companies
      ORDER BY id DESC
    `);

    // ✅ Branches
    const [branchRows] = await db.query(`
      SELECT id, company_id AS orgId, branch_name AS name
      FROM company_branches
      ORDER BY id DESC
    `);

    // ✅ RFQs
    const [rfqRows] = await db.query(`
      SELECT 
        r.id,
        r.company_id AS orgId,
        c.company_name AS orgName,
        r.branch_id AS branchId,
        b.branch_name AS branch,
        r.submitted_at AS submittedAt,
        r.status,
        r.notes
      FROM rfqs r
      JOIN companies c ON c.id = r.company_id
      JOIN company_branches b ON b.id = r.branch_id
      ORDER BY r.id DESC
    `);

    // ✅ RFQ Products + Product data
    const [productRows] = await db.query(`
      SELECT
        rp.rfq_id AS rfqId,
        p.id AS productId,
        p.product_name AS name,
        p.sku AS code,
        p.category,
        p.sub_category AS subcategory,
        p.hsn,
        rp.quantity
      FROM rfq_products rp
      JOIN products p ON p.id = rp.product_id
      ORDER BY rp.rfq_id DESC
    `);

    // ✅ Make organizations array with branches
    const organizations = orgRows.map((o) => ({
      id: o.id,
      name: o.name,
      branches: branchRows
        .filter((b) => b.orgId === o.id)
        .map((b) => ({ id: b.id, name: b.name })),
    }));

    // ✅ Attach products to each rfq
    const rfqs = rfqRows.map((r) => ({
      id: r.id,
      orgId: r.orgId,
      orgName: r.orgName,
      branchId: r.branchId,
      branch: r.branch,
      submittedAt: r.submittedAt,
      status: r.status,
      notes: r.notes,
      products: productRows
        .filter((p) => p.rfqId === r.id)
        .map((p) => ({
          id: p.productId,
          name: p.name,
          hsn:p.hsn,
          code: p.code,
          category: p.category,
          subcategory: p.subcategory,
          quantity: p.quantity,
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
