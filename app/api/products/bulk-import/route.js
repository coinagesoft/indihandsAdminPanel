import { db } from "../../../db";

export async function POST(req) {
  try {
    const body = await req.json();
    const { products } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return Response.json(
        { message: "Products array required" },
        { status: 400 }
      );
    }

    const rows = products.map((p) => ({
      product_name: p.productName || "",
      sku: p.sku || "",
      barcode: p.barcode || null,
      category: p.category || "",
      sub_category: p.subCategory || "",
      hsn: p.hsn || null,
      size: p.size || null,
      weight: p.weight || null,
      description: p.description || null,
      stock_qty: Number(p.stockQty ?? 0),
      base_price: Number(p.basePrice ?? 0),
      status: p.status || "Available",
    }));


    console.log("rows", rows)

    // ✅ Fixed validation
    for (const r of rows) {
      if (!r.product_name || !r.category || isNaN(r.base_price)) {
        return Response.json(
          { message: "Excel must contain Product Name, Category and Base Price" },
          { status: 400 }
        );
      }
    }

    const values = rows.map((r) => [
      r.product_name,
      r.sku,
      r.barcode,
      r.category,
      r.sub_category,
      r.hsn,
      size,
      weight,
      r.size,
      r.weight,
      r.description,
      r.stock_qty,
      r.base_price,
      r.status,
    ]);


    await db.query(
      `
  INSERT INTO products
  (product_name, sku, barcode, category, sub_category, hsn, description, stock_qty, base_price, status)
  VALUES ?
  `,
      [values]
    );


    return Response.json(
      { message: `✅ ${rows.length} products imported successfully` },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/products/bulk-import error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
