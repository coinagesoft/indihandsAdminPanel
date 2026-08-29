export const runtime = "nodejs";

import { db } from "../../../../db";


const STORAGE_BASE_URL =
  "https://storage.indihands.com";

const CATALOG_IMAGE_BASE_URL =
  `${STORAGE_BASE_URL}/images/categories/`;


// ============================================
// UPLOAD IMAGE TO VPS
// ============================================

async function uploadBase64ToStorage(
  base64Image,
  originalFileName
) {
  if (
    !base64Image?.startsWith("data:image/")
  ) {
    throw new Error("Invalid catalog image");
  }

  if (!originalFileName) {
    throw new Error(
      "Original file name is required"
    );
  }

  // Convert base64 → Blob
  const response =
    await fetch(base64Image);

  const blob =
    await response.blob();

  const formData =
    new FormData();

  formData.append(
    "image",
    blob,
    originalFileName
  );

  const uploadResponse =
    await fetch(
      `${STORAGE_BASE_URL}/api/upload/category`,
      {
        method: "POST",
        body: formData,
      }
    );

  const result =
    await uploadResponse.json();

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
// DELETE IMAGE FROM VPS
// ============================================

async function deleteImageFromStorage(
  imageUrl
) {
  if (!imageUrl) {
    console.log(
      "No old catalog image to delete"
    );

    return;
  }

  try {

    console.log(
      "OLD CATALOG IMAGE URL:",
      imageUrl
    );

    // Extract filename from URL
    const url =
      new URL(imageUrl);

    const fileName =
      decodeURIComponent(
        url.pathname
          .split("/")
          .pop()
      );

    if (!fileName) {
      console.log(
        "Could not extract catalog filename"
      );

      return;
    }

    console.log(
      "CATALOG FILE TO DELETE:",
      fileName
    );

    const deleteUrl =
      `${STORAGE_BASE_URL}/api/delete/category/${encodeURIComponent(fileName)}`;

    console.log(
      "DELETE REQUEST URL:",
      deleteUrl
    );

    const deleteResponse =
      await fetch(
        deleteUrl,
        {
          method: "DELETE"
        }
      );

    const responseText =
      await deleteResponse.text();

    console.log(
      "VPS DELETE STATUS:",
      deleteResponse.status
    );

    console.log(
      "VPS DELETE RESPONSE:",
      responseText
    );

    // Ignore 404 because file may already
    // be deleted or missing
    if (
      !deleteResponse.ok &&
      deleteResponse.status !== 404
    ) {
      throw new Error(
        `Failed to delete old catalog image: ${responseText}`
      );
    }

    console.log(
      "OLD CATALOG IMAGE DELETE COMPLETED:",
      fileName
    );

  }
  catch (error) {

    console.error(
      "DELETE OLD CATALOG IMAGE ERROR:",
      error
    );

    throw error;
  }
}


// ============================================
// PATCH CATALOG
// ============================================

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;

    const catalogId = Number(id);

    if (!catalogId) {
      return Response.json(
        {
          message: "Invalid catalog ID"
        },
        {
          status: 400
        }
      );
    }

    const data = await req.json();

    const {
      name,
      description = null,
      featured_image
    } = data;


    // ==========================================
    // VALIDATE NAME
    // ==========================================

    if (!name?.trim()) {
      return Response.json(
        {
          message: "Catalog name required"
        },
        {
          status: 400
        }
      );
    }


    // ==========================================
    // GET OLD CATALOG DATA
    // ==========================================

    const [catalogRows] = await db.query(
      `
      SELECT
        id,
        featured_image
      FROM catalogs
      WHERE id = ?
      `,
      [catalogId]
    );

    const existingCatalog =
      catalogRows[0];


    if (!existingCatalog) {
      return Response.json(
        {
          message: "Catalog not found"
        },
        {
          status: 404
        }
      );
    }


    console.log(
      "OLD CATALOG IMAGE FROM DATABASE:",
      existingCatalog.featured_image
    );


    // ==========================================
    // DEFAULT: KEEP EXISTING IMAGE
    // ==========================================

    let featuredImageUrl =
      existingCatalog.featured_image;

    let oldImageToDelete =
      null;


    // ==========================================
    // IMAGE FIELD PROVIDED
    // ==========================================

    if (featured_image !== undefined) {


      // ========================================
      // CASE 1: NEW BASE64 IMAGE
      // ========================================

      if (
        featured_image &&
        typeof featured_image === "object" &&
        featured_image.base64?.startsWith(
          "data:image/"
        )
      ) {

        console.log(
          "UPLOADING NEW CATALOG IMAGE..."
        );


        // Save old image BEFORE changing anything
        oldImageToDelete =
          existingCatalog.featured_image;


        console.log(
          "OLD IMAGE TO DELETE:",
          oldImageToDelete
        );


        // Upload new image
        featuredImageUrl =
          await uploadBase64ToStorage(
            featured_image.base64,
            featured_image.fileName
          );


        console.log(
          "NEW IMAGE UPLOADED:",
          featuredImageUrl
        );
      }


      // ========================================
      // CASE 2: REMOVE IMAGE
      // ========================================

      else if (
        featured_image === null ||
        featured_image === ""
      ) {

        oldImageToDelete =
          existingCatalog.featured_image;

        featuredImageUrl =
          null;


        console.log(
          "REMOVING CATALOG IMAGE:",
          oldImageToDelete
        );
      }


      // ========================================
      // CASE 3: EXISTING IMAGE URL
      // ========================================

      else if (
        typeof featured_image === "string"
      ) {

        featuredImageUrl =
          featured_image;


        // If frontend sends a different URL,
        // delete the previous VPS image.
        if (
          existingCatalog.featured_image &&
          existingCatalog.featured_image !==
            featuredImageUrl
        ) {

          oldImageToDelete =
            existingCatalog.featured_image;
        }


        console.log(
          "CATALOG IMAGE URL:",
          featuredImageUrl
        );
      }


      // ========================================
      // INVALID IMAGE
      // ========================================

      else {

        throw new Error(
          "Invalid catalog image"
        );
      }
    }


    // ==========================================
    // UPDATE DATABASE
    // ==========================================

    await db.query(
      `
      UPDATE catalogs
      SET
        name = ?,
        description = ?,
        featured_image = ?
      WHERE id = ?
      `,
      [
        name.trim(),
        description || null,
        featuredImageUrl,
        catalogId
      ]
    );


    console.log(
      "CATALOG DATABASE UPDATED"
    );


    // ==========================================
    // DELETE OLD IMAGE
    // ==========================================

    if (
      oldImageToDelete &&
      oldImageToDelete !== featuredImageUrl
    ) {

      console.log(
        "DELETING OLD CATALOG IMAGE:",
        oldImageToDelete
      );


      try {

        await deleteImageFromStorage(
          oldImageToDelete
        );


        console.log(
          "OLD CATALOG IMAGE DELETED SUCCESSFULLY"
        );

      }
      catch (deleteError) {

        console.error(
          "FAILED TO DELETE OLD CATALOG IMAGE:",
          deleteError
        );
      }

    }
    else {

      console.log(
        "NO OLD IMAGE NEEDS TO BE DELETED"
      );
    }


    // ==========================================
    // SUCCESS
    // ==========================================

    return Response.json(
      {
        message:
          "Catalog updated successfully",

        catalogId,

        featured_image:
          featuredImageUrl
      },
      {
        status: 200
      }
    );

  }
  catch (err) {

    console.error(
      "PATCH /api/catalogs/[id] error:",
      err
    );

    return Response.json(
      {
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






// ============================================
// DELETE CATALOG
// ============================================

// export async function DELETE(req, { params }) {
//   try {
//     const { id } = await params;
//     const catalogId = id;

//     // ============================================
//     // 1. GET EXISTING CATALOG IMAGE
//     // ============================================

//     const [catalogs] = await db.query(
//       `
//       SELECT featured_image
//       FROM catalogs
//       WHERE id = ?
//       `,
//       [catalogId]
//     );

//     if (catalogs.length === 0) {
//       return Response.json(
//         {
//           message: "Catalog not found"
//         },
//         {
//           status: 404
//         }
//       );
//     }

//     const catalog = catalogs[0];


//     // ============================================
//     // 2. DELETE IMAGE FROM VPS
//     // ============================================
//     // FIX: wrapped in its own try/catch. Previously an
//     // unhandled throw here would skip the DB deletes below
//     // and return 500 even though nothing had actually
//     // failed on the DB side — a VPS/network hiccup could
//     // block catalog deletion entirely.

//     if (catalog.featured_image) {
//       try {
//         await deleteImageFromStorage(catalog.featured_image);
//       } catch (imageDeleteError) {
//         console.error(
//           "FAILED TO DELETE CATALOG IMAGE:",
//           imageDeleteError
//         );
//       }
//     }


//     // ============================================
//     // 3. DELETE PRODUCT-CATALOG MAPPINGS
//     // ============================================

//     await db.query(
//       `
//       DELETE FROM product_catalog_map
//       WHERE catalog_id = ?
//       `,
//       [catalogId]
//     );


//     // ============================================
//     // 4. DELETE CATALOG FROM DATABASE
//     // ============================================

//     await db.query(
//       `
//       DELETE FROM catalogs
//       WHERE id = ?
//       `,
//       [catalogId]
//     );


//     // ============================================
//     // SUCCESS
//     // ============================================

//     return Response.json(
//       {
//         message: "Catalog deleted successfully"
//       },
//       {
//         status: 200
//       }
//     );

//   } catch (err) {

//     console.error(
//       "DELETE /api/catalogs/[id] error:",
//       err
//     );

//     return Response.json(
//       {
//         message: "Server error",
//         error: err.message
//       },
//       {
//         status: 500
//       }
//     );
//   }
// }


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