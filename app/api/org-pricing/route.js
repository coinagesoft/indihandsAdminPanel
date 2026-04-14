import { db } from "../../db";

export async function GET() {
  try {
    // ✅ Companies
    const [companies] = await db.query(`
      SELECT 
        c.id,
        c.company_name AS name,
        c.company_email AS email,
        (
          SELECT cb.gstin 
          FROM company_branches cb
          WHERE cb.company_id = c.id
          ORDER BY cb.id ASC
          LIMIT 1
        ) AS gst
      FROM companies c
      ORDER BY c.id DESC
    `);

    // ✅ Products
    const [products] = await db.query(`
      SELECT 
        id,
        product_name AS name,
        base_price AS basePrice
      FROM products
      ORDER BY id DESC
    `);

    // ✅ Pricing (FIXED 🔥)
    const [pricingRaw] = await db.query(`
      SELECT 
        company_id AS companyId,
        product_id AS productId,
        custom_price AS price,
        prefix                     -- ✅ ADDED
      FROM company_product_pricing
    `);

    // ✅ Normalize data (important for UI)
    const pricing = pricingRaw.map((p) => ({
      companyId: p.companyId,
      productId: p.productId,
      price: p.price == null ? "" : Number(p.price),
      prefix: p.prefix || "",   // ✅ ADDED
    }));

    return Response.json(
      { companies, products, pricing },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/org-pricing error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
