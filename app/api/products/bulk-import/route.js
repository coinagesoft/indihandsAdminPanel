import { db } from "../../../db";


export async function POST(req) {
  try {
    const body = await req.json();
    const { products } = body;

    /* ================= VALIDATION ================= */
    if (!Array.isArray(products) || products.length === 0) {
      return Response.json(
        { message: "Products array required" },
        { status: 400 }
      );
    }

    /* ================= MAP DATA ================= */
    const rows = products.map((p) => ({
      product_name: p.productName?.trim() || "",
      sku: p.sku?.trim() || "",
      barcode: p.barcode?.trim() || null,
      hsn: p.hsn?.trim() || null,
      size: p.size?.trim() || null,          // ✅ NEW
      weight: p.weight?.trim() || null,      // ✅ NEW
      description: p.description?.trim() || null,
      stock_qty: Number(p.stockQty ?? 0),
      base_price: Number(p.basePrice ?? 0),
      status: p.status?.trim() || "Available",
    }));

    console.log("📦 Import rows:", rows);

    /* ================= ROW-LEVEL VALIDATION ================= */
  rows.forEach((r, i) => {
  if (!r.product_name || isNaN(r.base_price)) {
    throw new Error(
      `Row ${i + 2}: Product Name, Category and Base Price are required`
    );
  }
});


    /* ================= PREPARE SQL VALUES ================= */
    const values = rows.map((r) => [
      r.product_name,
      r.sku,
      r.barcode,
      r.hsn,
      r.size,         // ✅
      r.weight,       // ✅
      r.description,
      r.stock_qty,
      r.base_price,
      r.status,
    ]);

    /* ================= INSERT ================= */
    await db.query(
      `
      INSERT INTO products
      (
        product_name,
        sku,
        barcode,
        hsn,
        size,
        weight,
        description,
        stock_qty,
        base_price,
        status
      )
      VALUES ?
      `,
      [values]
    );

    return Response.json(
      { message: `✅ ${rows.length} products imported successfully` },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ POST /api/products/bulk-import error:", err);
    return Response.json(
      { message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}

