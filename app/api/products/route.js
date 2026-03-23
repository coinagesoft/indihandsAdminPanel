export const runtime = "nodejs";

import { db } from "../../db";
import cloudinary from "../../../lib/cloudinary";

async function uploadBase64ToCloudinary(base64, folder = "products") {
  if (!base64 || typeof base64 !== "string") {
    throw new Error("Invalid image file");
  }

  // ✅ Allow all image types (jpg, png, webp, gif, svg, etc.)
  if (!base64.startsWith("data:image/")) {
    throw new Error("Invalid image file");
  }

  const uploadResult = await cloudinary.uploader.upload(file, {
  folder: "products",
  quality: "auto",
  fetch_format: "auto"
});


  return uploadResult.secure_url;
}




export async function POST(req) {
  try {
    const data = await req.json();

  const {
  product_name,
  sku,
  barcode,
  description,
  stock,
  price,
  status,
  featuredImage,
  images,
  hsn,
   size,          
      weight
} = data;

const [result] = await db.query(
  `INSERT INTO products 
  (product_name, sku, barcode, description, hsn, size, weight, stock_qty,  base_price, status, featured_image)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    product_name,
    sku,
    barcode || null,
    description || null,
    hsn || null,
    size || null,     
    weight || null,
    stock,
    price,
    status,
    featuredImage || null,
  ]
);


    const productId = result.insertId;

    if (Array.isArray(images) && images.length > 0) {
      const values = images.map((url) => [productId, url]);

      await db.query(
        `INSERT INTO product_gallery_images (product_id, image_url) VALUES ?`,
        [values]
      );
    }

    return Response.json({ message: "Product created", productId }, { status: 201 });
  } catch (err) {
    console.error("❌ POST ERROR:", err);
    return Response.json(
      { message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}



export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 5;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");

    const offset = (page - 1) * limit;

    let where = `WHERE 1=1`;
    let values = [];

    if (search) {
      where += ` AND (p.product_name LIKE ? OR p.sku LIKE ?)`;
      values.push(`%${search}%`, `%${search}%`);
    }

 

    if (status && status !== "All") {
      where += ` AND p.status = ?`;
      values.push(status);
    }

    // 🔹 Products
    const [products] = await db.query(
      `
      SELECT 
        p.id,
        p.product_name AS name,
       p.barcode,
        p.hsn AS hsn, 
          p.size,         
        p.weight, 
        p.description,
        p.stock_qty AS stock,
        p.sku,
        p.base_price AS price,
        p.status,
        p.featured_image AS featureImage,

        COALESCE(
          (
            SELECT JSON_ARRAYAGG(g.image_url)
            FROM product_gallery_images g
            WHERE g.product_id = p.id
          ),
          JSON_ARRAY()
        ) AS images

      FROM products p
      ${where}
      ORDER BY p.id DESC
      LIMIT ? OFFSET ?
      `,
      [...values, limit, offset]
    );

    // ✅ FIX: Ensure images is always an array
    const formattedProducts = products.map((p) => ({
      ...p,
      images:
        typeof p.images === "string"
          ? JSON.parse(p.images)
          : Array.isArray(p.images)
          ? p.images
          : [],
    }));

    // 🔹 Total count (pagination)
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM products p ${where}`,
      values
    );

    return new Response(
      JSON.stringify({
        products: formattedProducts, // ✅ send formatted
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ message: "Server error", error: err.message }),
      { status: 500 }
    );
  }
}


