import { db } from "../../../../db";

export async function GET(req, { params }) {
  try {
    const companyId = Number(params.companyId);
    if (!companyId) {
      return Response.json({ message: "Invalid companyId" }, { status: 400 });
    }

    const [pricing] = await db.query(
      `
      SELECT product_id AS productId, custom_price AS price
      FROM company_product_pricing
      WHERE company_id = ?
      `,
      [companyId]
    );

    return Response.json({ pricing }, { status: 200 });
  } catch (err) {
    console.error("GET /api/org-pricing/[companyId]/get error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
