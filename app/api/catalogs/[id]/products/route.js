export const runtime = "nodejs";

import { db } from "../../../../db";

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const catalogId = Number(id);

    const data = await req.json();
    const { productIds = [] } = data;

    if (!catalogId) {
      return Response.json({ message: "Invalid catalogId" }, { status: 400 });
    }

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return Response.json({ message: "No products selected" }, { status: 400 });
    }

    // ✅ 1) Check already assigned products
    const [existingRows] = await db.query(
      `SELECT product_id 
       FROM product_catalog_map 
       WHERE catalog_id = ? AND product_id IN (?)`,
      [catalogId, productIds]
    );

    const alreadyAssignedIds = existingRows.map((r) => r.product_id);

    // ✅ If any duplicates found -> block
    if (alreadyAssignedIds.length > 0) {
      return Response.json(
        {
          message: "Duplicate products not allowed in same catalog",
          duplicates: alreadyAssignedIds,
        },
        { status: 409 } // conflict
      );
    }

    // ✅ 2) Insert only fresh ones
    const values = productIds.map((pid) => [pid, catalogId]);

    await db.query(
      `INSERT INTO product_catalog_map (product_id, catalog_id) VALUES ?`,
      [values]
    );

    return Response.json(
      { message: "Products added to catalog successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("POST /api/catalogs/[id]/products error:", err);
    return Response.json(
      { message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}


export async function DELETE(req, context) {
  try {
    const { params } = context;
    const { id } = await params;

    const catalogId = Number(id);  // ✅ convert to number

    if (!catalogId) {
      return Response.json({ message: "Invalid catalogId" }, { status: 400 });
    }

    const data = await req.json();
    const { productId } = data;

    if (!productId) {
      return Response.json({ message: "productId required" }, { status: 400 });
    }

    await db.query(
      `DELETE FROM product_catalog_map 
       WHERE product_id = ? AND catalog_id = ?`,
      [productId, catalogId]
    );

    return Response.json(
      { message: "Product removed from catalog" },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE /api/catalogs/[id]/products error:", err);
    return Response.json(
      { message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}

export async function GET(req, context) {
  try {
    const { params } = context;
    const { id } = await params;

    const catalogId = Number(id);

    if (!catalogId) {
      return Response.json({ message: "Invalid catalogId" }, { status: 400 });
    }

    // Get catalog
    const [catalogRows] = await db.query(
      `SELECT name FROM catalogs WHERE id = ?`,
      [catalogId]
    );

    if (catalogRows.length === 0) {
      return Response.json({ message: "Catalog not found" }, { status: 404 });
    }

    // ✅ Popular Products
    if (catalogRows[0].name === "Popular Products") {
      const [rows] = await db.query(`
        SELECT
          p.id,
          p.product_name AS name,
          p.sku,
          p.stock_qty AS stock,
          p.base_price AS price,
          p.status,
          p.featured_image AS featureImage,
          SUM(ii.quantity) AS totalSold
        FROM invoice_items ii
        INNER JOIN products p
          ON p.id = ii.product_id
        WHERE ii.is_charge = 0
        GROUP BY
          p.id,
          p.product_name,
          p.sku,
          p.stock_qty,
          p.base_price,
          p.status,
          p.featured_image
        ORDER BY totalSold DESC
      `);

      return Response.json({ products: rows }, { status: 200 });
    }

    // ✅ Existing logic for normal catalogs
    const [rows] = await db.query(
      `
      SELECT
        p.id,
        p.product_name AS name,
        p.sku,
        p.stock_qty AS stock,
        p.base_price AS price,
        p.status,
        p.featured_image AS featureImage
      FROM product_catalog_map pcm
      INNER JOIN products p
        ON p.id = pcm.product_id
      WHERE pcm.catalog_id = ?
      ORDER BY p.id DESC
      `,
      [catalogId]
    );

    return Response.json({ products: rows }, { status: 200 });

  } catch (err) {
    console.error("GET /api/catalogs/[id]/products error:", err);

    return Response.json(
      {
        message: "Server error",
        error: err.message
      },
      { status: 500 }
    );
  }
}

