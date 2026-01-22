import { db } from "../../../db";

export async function DELETE(req, { params }) {
  const { id } = await params;   // ✅ important
  const catalogId = Number(id);

  if (!catalogId) {
    return Response.json({ message: "Invalid catalogId" }, { status: 400 });
  }

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 1️⃣ remove product mappings
    await conn.query(
      "DELETE FROM product_catalog_map WHERE catalog_id = ?",
      [catalogId]
    );

    // 2️⃣ delete catalog
    await conn.query(
      "DELETE FROM catalogs WHERE id = ?",
      [catalogId]
    );

    await conn.commit();

    return Response.json({ message: "Catalog deleted successfully" }, { status: 200 });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return Response.json({ message: "Server error" }, { status: 500 });
  } finally {
    conn.release();
  }
}
