import { db } from "../../../db";

export async function POST(req, { params }) {
  try {
    // ✅ params is Promise in Next.js 15 → await it
    const { companyId } = await params;
    const companyIdNum = Number(companyId);

    if (!companyIdNum) {
      return Response.json({ message: "Invalid companyId" }, { status: 400 });
    }

    const body = await req.json();
    const { pricing = [] } = body;

    if (!Array.isArray(pricing) || pricing.length === 0) {
      return Response.json({ message: "Pricing array required" }, { status: 400 });
    }

    for (const p of pricing) {
      const productId = Number(p.productId);
      const price = Number(p.price);

      if (!productId || isNaN(price)) continue;

      await db.query(
        `
        INSERT INTO company_product_pricing (company_id, product_id, custom_price)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE custom_price = ?, updated_at = CURRENT_TIMESTAMP
        `,
        [companyIdNum, productId, price, price]
      );
    }

    return Response.json({ message: "Pricing saved successfully" }, { status: 200 });
  } catch (err) {
    console.error("POST /api/org-pricing/[companyId] error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
