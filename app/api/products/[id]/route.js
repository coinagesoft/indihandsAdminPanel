export const runtime = "nodejs";

import { db } from "../../../db";

export async function PATCH(req, { params }) {
  try {
    const { id: productId } = await params;
    const data = await req.json();

    const {
      name,
      sku,
      hsn,
      size,
      description,
      barcode,
      weight,
      stock,
      price,
      status,
      featuredImage,
      images,
      company_id,     // ✅ NEW
      name_prefix
    } = data;




    // ✅ keep old featured image if not sent
    const [[existing]] = await db.query(
      `SELECT featured_image FROM products WHERE id = ?`,
      [productId]
    );

    const featuredImageUrl = featuredImage || existing?.featured_image || null;

 const cleanDescription = description?.replace(/\r\n/g, "\n");

await db.query(
  `UPDATE products SET 
    product_name = ?, 
    sku = ?, 
    hsn = ?, 
    size = ?, 
    description = ?, 
    barcode = ?,    
    weight = ?,   
    stock_qty = ?, 
    base_price = ?, 
    status = ?, 
    featured_image = ?,
    company_id = ?,     
    name_prefix = ? 
    WHERE id = ?`,
  [
    name,
    sku,
    hsn || null,
    size || null,
    cleanDescription ?? null, 
    barcode || null,
    weight || null,
    stock,
    price,
    status,
    featuredImageUrl,
       company_id || null,  
   name_prefix?.trim() || null,
    productId,
  ]
);

    // ✅ Update gallery only if array passed
    if (Array.isArray(images)) {
      await db.query(`DELETE FROM product_gallery_images WHERE product_id = ?`, [
        productId,
      ]);

      if (images.length > 0) {
        const values = images.map((url) => [productId, url]);

        await db.query(
          `INSERT INTO product_gallery_images (product_id, image_url) VALUES ?`,
          [values]
        );
      }
    }

    return Response.json({ message: "Product updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/products/[id] error:", error);
    return Response.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}






export async function DELETE(req, { params }) {
  try {
    const { id: productId } = await params;

    // ✅ 1) Delete gallery images first (if no cascade)
    await db.query(`DELETE FROM product_gallery_images WHERE product_id = ?`, [
      productId,
    ]);

    // ✅ 2) Delete catalog mappings (optional if table exists)
    await db.query(`DELETE FROM product_catalog_map WHERE product_id = ?`, [
      productId,
    ]);

    // ✅ 3) Delete product
    await db.query(`DELETE FROM products WHERE id = ?`, [productId]);

    return Response.json({ message: "Product deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);
    return Response.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}


