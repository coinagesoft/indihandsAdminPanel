export const runtime = "nodejs";

import { db } from "../../../../db";

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const catalogId = id;

    const data = await req.json();
    const { name, description = null, featured_image = null } = data;

    if (!name?.trim()) {
      return Response.json({ message: "Catalog name required" }, { status: 400 });
    }

    await db.query(
      `UPDATE catalogs 
       SET name = ?, description = ?, featured_image = ?
       WHERE id = ?`,
      [name.trim(), description, featured_image, catalogId]
    );

    return Response.json({ message: "Catalog updated" }, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/catalogs/[id] error:", err);
    return Response.json(
      { message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const catalogId = id;

    // ✅ delete mapping first (optional because ON DELETE CASCADE will also work)
    await db.query(`DELETE FROM product_catalog_map WHERE catalog_id = ?`, [
      catalogId,
    ]);

    // ✅ delete catalog
    await db.query(`DELETE FROM catalogs WHERE id = ?`, [catalogId]);

    return Response.json({ message: "Catalog deleted" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/catalogs/[id] error:", err);
    return Response.json(
      { message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}


export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const productId = Number(id);

    if (!productId) {
      return Response.json({ message: "Invalid productId" }, { status: 400 });
    }

    const [rows] = await db.query(
      `SELECT catalog_id FROM product_catalog_map WHERE product_id = ?`,
      [productId]
    );

    const catalogIds = rows.map((r) => r.catalog_id);

    return Response.json({ catalogIds }, { status: 200 });
  } catch (err) {
    console.error("GET /api/products/[id]/catalogs error:", err);
    return Response.json(
      { message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}
