export const runtime = "nodejs";

import { db } from "../../db";

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        name,
        description,
        featured_image
      FROM catalogs
      ORDER BY
        CASE
          WHEN name = 'Popular Products' THEN 1
          ELSE 0
        END,
        id DESC
    `);

    return Response.json({ catalogs: rows }, { status: 200 });

  } catch (err) {
    console.error("GET /api/catalogs error:", err);

    return Response.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}


async function uploadBase64ToStorage(
  base64Image,
  originalFileName
) {

  if (
    !base64Image?.startsWith(
      "data:image/"
    )
  ) {
    throw new Error(
      "Invalid catalog image"
    );
  }


  if (!originalFileName) {
    throw new Error(
      "Original file name is required"
    );
  }


  // Convert Base64 to Blob
  const response =
    await fetch(base64Image);

  const blob =
    await response.blob();


  const formData =
    new FormData();


  // Keep original filename
  formData.append(
    "image",
    blob,
    originalFileName
  );


  // Upload to VPS as category/catalog image
  const uploadResponse =
    await fetch(
      "https://storage.indihands.com/api/upload/category",
      {
        method: "POST",
        body: formData,
      }
    );


  let result;

  try {

    result =
      await uploadResponse.json();

  } catch {

    throw new Error(
      "Invalid response from VPS storage"
    );

  }


  console.log(
    "VPS CATALOG UPLOAD RESULT:",
    result
  );


  if (
    !uploadResponse.ok ||
    !result.success
  ) {

    throw new Error(
      result.message ||
      "Catalog image upload failed"
    );

  }


  return result.imageUrl;
}


// ============================================
// CREATE CATALOG
// ============================================

export async function POST(req) {

  try {

    const data =
      await req.json();


    const {
      name,
      description = null,
      featured_image = null
    } = data;


    // ============================================
    // VALIDATE CATALOG NAME
    // ============================================

    if (!name?.trim()) {

      return Response.json(
        {
          success: false,
          message: "Catalog name required"
        },
        {
          status: 400
        }
      );

    }


    // ============================================
    // UPLOAD CATALOG IMAGE TO VPS
    // ============================================

    let featuredImageUrl = null;


    if (featured_image) {

      // ------------------------------------------
      // NEW IMAGE FROM FRONTEND
      // ------------------------------------------

      if (
        typeof featured_image === "object" &&
        featured_image.base64?.startsWith(
          "data:image/"
        )
      ) {

        featuredImageUrl =
          await uploadBase64ToStorage(
            featured_image.base64,
            featured_image.fileName
          );

      }


      // ------------------------------------------
      // EXISTING VPS IMAGE URL
      // ------------------------------------------

      else if (
        typeof featured_image === "string" &&
        featured_image.startsWith(
          "https://storage.indihands.com/"
        )
      ) {

        featuredImageUrl =
          featured_image;

      }


      else {

        throw new Error(
          "Invalid catalog image"
        );

      }

    }


    // ============================================
    // INSERT CATALOG
    // ============================================

    const [result] =
      await db.query(
        `
        INSERT INTO catalogs
        (
          name,
          description,
          featured_image
        )
        VALUES (?, ?, ?)
        `,
        [
          name.trim(),
          description || null,
          featuredImageUrl
        ]
      );


    return Response.json(
      {
        success: true,
        message:
          "Catalog created successfully",

        catalogId:
          result.insertId,

        featured_image:
          featuredImageUrl
      },
      {
        status: 201
      }
    );

  } catch (err) {

    console.error(
      "POST /api/catalogs error:",
      err
    );


    return Response.json(
      {
        success: false,
        message: "Server error",
        error: err.message
      },
      {
        status: 500
      }
    );

  }
}
