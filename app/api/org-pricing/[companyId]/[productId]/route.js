import { db } from "../../../../db";

export async function DELETE(req, { params }) {
  try {
    const companyId = Number(params.companyId);
    const productId = Number(params.productId);

    if (!companyId || !productId) {
      return Response.json({ message: "Invalid ids" }, { status: 400 });
    }

    await db.query(
      `DELETE FROM company_product_pricing WHERE company_id=? AND product_id=?`,
      [companyId, productId]
    );

    return Response.json({ message: "Custom price removed" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/org-pricing/[companyId]/[productId] error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
