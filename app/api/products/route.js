export const runtime = "nodejs";

import { db } from "../../db";


// ======================================================
// UPLOAD BASE64 IMAGE TO VPS STORAGE
// ======================================================

async function uploadBase64ToStorage(
  base64Image,
  originalFileName
) {
  // Validate image
  if (!base64Image?.startsWith("data:image/")) {
    throw new Error("Invalid image");
  }

  // Validate original filename
  if (!originalFileName) {
    throw new Error("Original file name is required");
  }


  // ======================================================
  // CONVERT BASE64 TO BLOB
  // ======================================================

  const response = await fetch(base64Image);

  if (!response.ok) {
    throw new Error("Failed to process image");
  }

  const blob = await response.blob();


  // ======================================================
  // CREATE FORM DATA
  // ======================================================

  const formData = new FormData();

  // Send original filename to VPS
  formData.append(
    "image",
    blob,
    originalFileName
  );


  // ======================================================
  // UPLOAD TO VPS
  // ======================================================

  const uploadResponse = await fetch(
    "https://storage.indihands.com/api/upload/product",
    {
      method: "POST",
      body: formData
    }
  );


  // ======================================================
  // READ RESPONSE
  // ======================================================

  let result;

  try {
    result = await uploadResponse.json();
  }
  catch (error) {

    console.error(
      "Invalid VPS response:",
      error
    );

    throw new Error(
      "Invalid response from VPS storage server"
    );
  }


  console.log(
    "VPS UPLOAD RESULT:",
    result
  );


  // ======================================================
  // VALIDATE RESPONSE
  // ======================================================

  if (
    !uploadResponse.ok ||
    !result?.success
  ) {

    throw new Error(
      result?.message ||
      "Image upload failed"
    );
  }


  if (!result.imageUrl) {

    throw new Error(
      "VPS storage did not return image URL"
    );
  }


  // Return VPS image URL
  return result.imageUrl;
}


// ======================================================
// CREATE PRODUCT
// ======================================================

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
      weight,
      cgst_rate,
      sgst_rate,
      igst_rate
    } = data;


    // ======================================================
    // CLEAN DESCRIPTION
    // ======================================================

    const cleanDescription =
      description?.replace(/\r\n/g, "\n");


    // ======================================================
    // FEATURED IMAGE
    // ======================================================

   // ======================================================
// FEATURED IMAGE
// ======================================================

let featuredImageUrl = null;

console.log("FEATURED IMAGE RECEIVED:");
console.log(featuredImage);
console.log("TYPE:", typeof featuredImage);


if (featuredImage) {

  // Get base64 from possible frontend properties
  const base64Image =
    typeof featuredImage === "object"
      ? (
          featuredImage.base64 ||
          featuredImage.preview ||
          featuredImage.dataUrl
        )
      : null;


  // Get original filename
  const originalFileName =
    typeof featuredImage === "object"
      ? (
          featuredImage.fileName ||
          featuredImage.name
        )
      : null;


  // ================================================
  // NEW IMAGE → UPLOAD TO VPS
  // ================================================

  if (
    base64Image &&
    base64Image.startsWith("data:image/")
  ) {

    featuredImageUrl =
      await uploadBase64ToStorage(
        base64Image,
        originalFileName
      );

  }


  // ================================================
  // ALREADY VPS URL
  // ================================================

  else if (
    typeof featuredImage === "string" &&
    (
      featuredImage.startsWith(
        "https://storage.indihands.com/"
      ) ||
      featuredImage.startsWith(
        "http://storage.indihands.com/"
      )
    )
  ) {

    featuredImageUrl = featuredImage;

  }


  // ================================================
  // INVALID
  // ================================================

  else {

    console.log(
      "INVALID FEATURED IMAGE:",
      JSON.stringify(featuredImage, null, 2)
    );

    throw new Error(
      "Invalid featured image format"
    );

  }
}

  // ======================================================
// GALLERY IMAGES
// ======================================================

const uploadedImages = [];

if (
  Array.isArray(images) &&
  images.length > 0
) {

  for (const image of images) {

    if (!image) {
      continue;
    }


    console.log("GALLERY IMAGE RECEIVED:", image);


    // Get base64 from possible frontend properties
    const base64Image =
      typeof image === "object"
        ? (
            image.base64 ||
            image.preview ||
            image.dataUrl
          )
        : null;


    // Get original filename
    const originalFileName =
      typeof image === "object"
        ? (
            image.fileName ||
            image.name
          )
        : null;


    // ================================================
    // NEW IMAGE → UPLOAD TO VPS
    // ================================================

    if (
      base64Image &&
      base64Image.startsWith("data:image/")
    ) {

      const imageUrl =
        await uploadBase64ToStorage(
          base64Image,
          originalFileName
        );

      uploadedImages.push(imageUrl);

      continue;
    }


    // ================================================
    // EXISTING VPS URL
    // ================================================

    if (
      typeof image === "string" &&
      (
        image.startsWith(
          "https://storage.indihands.com/"
        ) ||
        image.startsWith(
          "http://storage.indihands.com/"
        )
      )
    ) {

      uploadedImages.push(image);

      continue;
    }


    // ================================================
    // INVALID
    // ================================================

    console.log(
      "INVALID GALLERY IMAGE:",
      JSON.stringify(image, null, 2)
    );

    throw new Error(
      "Invalid gallery image format"
    );
  }
}


    // ======================================================
    // INSERT PRODUCT
    // ======================================================

    const [result] = await db.query(

      `
      INSERT INTO products
      (
        product_name,
        sku,
        barcode,
        description,
        hsn,
        size,
        weight,
        stock_qty,
        base_price,
        status,
        featured_image,
        cgst_rate,
        sgst_rate,
        igst_rate
      )
      VALUES
      (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
      `,

      [
        product_name,
        sku,
        barcode || null,
        cleanDescription ?? null,
        hsn || null,
        size || null,
        weight || null,
        stock,
        price,
        status,
        featuredImageUrl,
        Number(cgst_rate ?? 0),
        Number(sgst_rate ?? 0),
        Number(igst_rate ?? 0)
      ]
    );


    const productId =
      result.insertId;


    // ======================================================
    // SAVE GALLERY IMAGES
    // ======================================================

    if (
      uploadedImages.length > 0
    ) {

      const values =
        uploadedImages.map(
          (imageUrl) => [

            productId,
            imageUrl

          ]
        );


      await db.query(

        `
        INSERT INTO product_gallery_images
        (
          product_id,
          image_url
        )
        VALUES ?
        `,

        [values]
      );
    }


    // ======================================================
    // SUCCESS RESPONSE
    // ======================================================

    return Response.json(
      {

        success: true,

        message:
          "Product created successfully",

        productId,

        featuredImage:
          featuredImageUrl,

        images:
          uploadedImages

      },

      {
        status: 201
      }
    );

  }
  catch (err) {

    console.error(
      "❌ POST ERROR:",
      err
    );


    return Response.json(
      {

        success: false,

        message:
          "Server error",

        error:
          err.message

      },

      {
        status: 500
      }
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
  where += ` AND (
    p.product_name LIKE ? 
    OR p.sku LIKE ? 
    OR p.barcode LIKE ?
  )`;

  values.push(
    `%${search}%`,
    `%${search}%`,
    `%${search}%`
  );
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
  p.cgst_rate,
  p.sgst_rate,
  p.igst_rate,

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
 cgst_rate: Number(p.cgst_rate ?? 0),
sgst_rate: Number(p.sgst_rate ?? 0),
igst_rate: Number(p.igst_rate ?? 0),
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


