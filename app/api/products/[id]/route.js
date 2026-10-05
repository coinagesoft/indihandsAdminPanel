export const runtime = "nodejs";

import { db } from "../../../db";

// ============================================
// VPS CONFIG
// ============================================

const STORAGE_BASE_URL =
  "https://storage.indihands.com";

const PRODUCT_IMAGE_BASE_URL =
  `${STORAGE_BASE_URL}/images/products/`;




async function uploadBase64ToStorage(
  base64Image,
  originalFileName
) {
  if (!base64Image?.startsWith("data:image/")) {
    throw new Error("Invalid image");
  }

  if (!originalFileName) {
    throw new Error(
      "Original file name is required"
    );
  }

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
      `${STORAGE_BASE_URL}/api/upload/product`,
      {
        method: "POST",
        body: formData,
      }
    );

  const result =
    await uploadResponse.json();

  console.log(
    "VPS PRODUCT UPLOAD RESULT:",
    result
  );

  if (
    !uploadResponse.ok ||
    !result.success
  ) {
    throw new Error(
      result.message ||
      "Image upload failed"
    );
  }

  return result.imageUrl;
}




async function deleteImageFromStorage(
  imageUrl
) {
  if (!imageUrl) {
    console.log(
      "No product image to delete"
    );

    return;
  }

  try {

    console.log(
      "OLD PRODUCT IMAGE URL:",
      imageUrl
    );

    // Safety: only delete product images
    if (
      !imageUrl.startsWith(
        PRODUCT_IMAGE_BASE_URL
      )
    ) {
      console.log(
        "Skipping non-VPS product image:",
        imageUrl
      );

      return;
    }

    const url =
      new URL(imageUrl);

    const fileName =
      decodeURIComponent(
        url.pathname
          .split("/")
          .pop()
      );

    if (!fileName) {
      throw new Error(
        "Could not extract product filename"
      );
    }

    console.log(
      "PRODUCT FILE TO DELETE:",
      fileName
    );

    const deleteUrl =
      `${STORAGE_BASE_URL}/api/delete/product/${encodeURIComponent(fileName)}`;

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
    // have been deleted
    if (
      !deleteResponse.ok &&
      deleteResponse.status !== 404
    ) {
      throw new Error(
        `Failed to delete image: ${responseText}`
      );
    }

    console.log(
      "PRODUCT IMAGE DELETE COMPLETED:",
      fileName
    );

  }
  catch (error) {

    console.error(
      "DELETE PRODUCT IMAGE ERROR:",
      error
    );

    throw error;
  }
}


// ============================================
// UPDATE PRODUCT
// ============================================

export async function PATCH(
  req,
  { params }
) {
  try {

    const { id } =
      await params;

    const productId =
      Number(id);

    if (!productId) {
      return Response.json(
        {
          message: "Invalid product ID"
        },
        {
          status: 400
        }
      );
    }


    const data =
      await req.json();


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
      company_id,
      name_prefix,
      cgst_rate,
      sgst_rate,
      igst_rate,
    } = data;


    // ============================================
    // GET EXISTING PRODUCT
    // ============================================

    const [productRows] =
      await db.query(
        `
        SELECT
          id,
          featured_image
        FROM products
        WHERE id = ?
        `,
        [productId]
      );

    const existing =
      productRows[0];


    if (!existing) {
      return Response.json(
        {
          message: "Product not found"
        },
        {
          status: 404
        }
      );
    }


    console.log(
      "EXISTING FEATURED IMAGE:",
      existing.featured_image
    );


    // ============================================
    // GET EXISTING GALLERY IMAGES
    // ============================================

    const [existingGalleryImages] =
      await db.query(
        `
        SELECT
          id,
          image_url
        FROM product_gallery_images
        WHERE product_id = ?
        `,
        [productId]
      );


    console.log(
      "EXISTING GALLERY IMAGES:",
      existingGalleryImages
    );


    // ============================================
    // FEATURED IMAGE
    // ============================================

    let featuredImageUrl =
      existing.featured_image ||
      null;

    let oldFeaturedImageToDelete =
      null;


    if (
      featuredImage !== undefined
    ) {

      // ========================================
      // NEW FEATURED IMAGE
      // ========================================

      if (
        featuredImage &&
        typeof featuredImage === "object" &&
        featuredImage.base64?.startsWith(
          "data:image/"
        )
      ) {

        // Save old image before upload/update
        oldFeaturedImageToDelete =
          existing.featured_image;


        console.log(
          "OLD FEATURED IMAGE TO DELETE:",
          oldFeaturedImageToDelete
        );


        featuredImageUrl =
          await uploadBase64ToStorage(
            featuredImage.base64,
            featuredImage.fileName
          );


        console.log(
          "NEW FEATURED IMAGE:",
          featuredImageUrl
        );
      }


      // ========================================
      // REMOVE FEATURED IMAGE
      // ========================================

      else if (
        featuredImage === null ||
        featuredImage === ""
      ) {

        oldFeaturedImageToDelete =
          existing.featured_image;

        featuredImageUrl =
          null;
      }


      // ========================================
      // KEEP / CHANGE EXISTING URL
      // ========================================

      else if (
        typeof featuredImage === "string"
      ) {

        featuredImageUrl =
          featuredImage;


        if (
          existing.featured_image &&
          existing.featured_image !==
            featuredImageUrl
        ) {

          oldFeaturedImageToDelete =
            existing.featured_image;
        }
      }


      else {

        throw new Error(
          "Invalid featured image"
        );
      }
    }

// ============================================
// GALLERY IMAGES
// ============================================

let uploadedImages = null;

if (Array.isArray(images)) {

  uploadedImages = [];

  for (const image of images) {

    if (!image) {
      continue;
    }

    console.log("GALLERY IMAGE RECEIVED:", image);

    // ========================================
    // NEW IMAGE → UPLOAD TO VPS
    // ========================================

    if (
      typeof image === "object" &&
      image.base64?.startsWith("data:image/")
    ) {

      console.log(
        "UPLOADING NEW GALLERY IMAGE TO VPS:",
        image.fileName
      );

      const imageUrl =
        await uploadBase64ToStorage(
          image.base64,
          image.fileName
        );

      console.log(
        "NEW VPS GALLERY IMAGE URL:",
        imageUrl
      );

      if (!imageUrl) {
        throw new Error(
          "VPS upload did not return image URL"
        );
      }

      uploadedImages.push(imageUrl);
    }


    // ========================================
    // EXISTING IMAGE → KEEP EXISTING URL
    // ========================================

    else if (typeof image === "string") {

      console.log(
        "KEEPING EXISTING GALLERY URL:",
        image
      );

      uploadedImages.push(image);
    }


    else {

      console.error(
        "INVALID GALLERY IMAGE:",
        image
      );

      throw new Error(
        "Invalid gallery image"
      );
    }
  }

  console.log(
    "FINAL GALLERY URLs TO STORE IN DB:",
    uploadedImages
  );
}
    // ============================================
    // CLEAN DESCRIPTION
    // ============================================

    const cleanDescription =
      description?.replace(
        /\r\n/g,
        "\n"
      );


    // ============================================
    // UPDATE PRODUCT DATABASE
    // ============================================

    await db.query(
      `
      UPDATE products
      SET

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
        name_prefix = ?,
        cgst_rate = ?,
        sgst_rate = ?,
        igst_rate = ?

      WHERE id = ?
      `,
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
        Number(cgst_rate ?? 0),
        Number(sgst_rate ?? 0),
        Number(igst_rate ?? 0),
        productId,
      ]
    );


    console.log(
      "PRODUCT DATABASE UPDATED"
    );


    // ============================================
    // DELETE OLD FEATURED IMAGE
    // ============================================

 
// ============================================
// TRACK GALLERY IMAGES TO DELETE
// ============================================

let oldGalleryImagesToDelete = [];

    // ============================================
    // UPDATE GALLERY
    // ============================================

    if (
      uploadedImages !== null
    ) {

      // ----------------------------------------
      // FIND OLD IMAGES THAT ARE NOT KEPT
      // ----------------------------------------
oldGalleryImagesToDelete =
  existingGalleryImages.filter(
    (oldImage) =>
      !uploadedImages.includes(
        oldImage.image_url
      )
  );


      console.log(
        "OLD GALLERY IMAGES TO DELETE:",
        oldGalleryImagesToDelete
      );


      // ----------------------------------------
      // DELETE OLD DB RECORDS
      // ----------------------------------------

      await db.query(
        `
        DELETE FROM product_gallery_images
        WHERE product_id = ?
        `,
        [productId]
      );


      // ----------------------------------------
      // INSERT CURRENT IMAGES
      // ----------------------------------------

      if (
        uploadedImages.length > 0
      ) {

        const values =
          uploadedImages.map(
            (url) => [
              productId,
              url
            ]
          );


        await db.query(
          `
          INSERT INTO
          product_gallery_images
          (
            product_id,
            image_url
          )
          VALUES ?
          `,
          [values]
        );
      }


  
   
    }

// ============================================
// DELETE UNUSED VPS IMAGES SAFELY
// ============================================

const imagesToCheckForDeletion = [];


// --------------------------------------------
// OLD FEATURED IMAGE
// --------------------------------------------

if (
  oldFeaturedImageToDelete &&
  oldFeaturedImageToDelete !==
    featuredImageUrl
) {

  imagesToCheckForDeletion.push(
    oldFeaturedImageToDelete
  );
}


// --------------------------------------------
// REMOVED GALLERY IMAGES
// --------------------------------------------

for (
  const oldImage of oldGalleryImagesToDelete
) {

  imagesToCheckForDeletion.push(
    oldImage.image_url
  );
}


// --------------------------------------------
// REMOVE DUPLICATE URLS
// --------------------------------------------

const uniqueImagesToCheck =
  [
    ...new Set(
      imagesToCheckForDeletion
    )
  ];



for (
  const imageUrl of uniqueImagesToCheck
) {

  try {

    const stillUsed =
      await isImageStillUsed(
        imageUrl
      );

    if (stillUsed) {

      console.log(
        "IMAGE STILL USED - NOT DELETING:",
        imageUrl
      );

      continue;
    }


    console.log(
      "IMAGE NOT USED - DELETING FROM VPS:",
      imageUrl
    );

    await deleteImageFromStorage(
      imageUrl
    );

  }
  catch (deleteError) {

    console.error(
      "FAILED TO PROCESS IMAGE DELETION:",
      imageUrl,
      deleteError
    );
  }
}
    // ============================================
    // SUCCESS RESPONSE
    // ============================================

    return Response.json(
      {
        message:
          "Product updated successfully",

        productId,

        featuredImage:
          featuredImageUrl,

        images:
          uploadedImages
      },
      {
        status: 200
      }
    );

  }
  catch (error) {

    console.error(
      "PATCH /api/products/[id] error:",
      error
    );

    return Response.json(
      {
        message: "Server error",
        error: error.message
      },
      {
        status: 500
      }
    );
  }
}



async function isImageStillUsed(imageUrl) {
  const [featuredRows] = await db.query(
    `
    SELECT id
    FROM products
    WHERE featured_image = ?
    LIMIT 1
    `,
    [imageUrl]
  );

  const [galleryRows] = await db.query(
    `
    SELECT id
    FROM product_gallery_images
    WHERE image_url = ?
    LIMIT 1
    `,
    [imageUrl]
  );

  return featuredRows.length > 0 || galleryRows.length > 0;
}


export async function DELETE(req, { params }) {
  try {
    const { id: productId } = await params;

    // ============================================
    // 1. GET PRODUCT IMAGES BEFORE DELETING DB DATA
    // ============================================

    const [products] = await db.query(
      `
      SELECT featured_image
      FROM products
      WHERE id = ?
      `,
      [productId]
    );

    const [galleryImages] = await db.query(
      `
      SELECT image_url
      FROM product_gallery_images
      WHERE product_id = ?
      `,
      [productId]
    );


    // ============================================
    // 2. DELETE IMAGE FROM VPS
    // ============================================

    const deleteImageFromStorage = async (imageUrl) => {

      if (!imageUrl) {
        return;
      }

      const baseUrl =
        "https://storage.indihands.com/images/products/";

      // Delete only VPS product images
      if (!imageUrl.startsWith(baseUrl)) {

        console.log(
          "Skipping non-VPS image:",
          imageUrl
        );

        return;
      }

      const fileName =
        imageUrl.replace(baseUrl, "");

      if (!fileName) {
        return;
      }

      try {

        const response = await fetch(
          `https://storage.indihands.com/api/delete/product/${encodeURIComponent(
            fileName
          )}`,
          {
            method: "DELETE",
          }
        );

        let result = {};

        try {
          result = await response.json();
        } catch {
          result = {};
        }

        console.log(
          "VPS DELETE RESULT:",
          result
        );

        // Ignore 404 because image may
        // already have been deleted
        if (
          !response.ok &&
          response.status !== 404
        ) {
          throw new Error(
            result.message ||
            "Failed to delete image from VPS"
          );
        }

      } catch (error) {

        console.error(
          "VPS IMAGE DELETE ERROR:",
          imageUrl,
          error
        );

        // Don't stop database deletion
        // if VPS image deletion fails
      }
    };


    // ============================================
    // 3. DELETE FEATURED IMAGE FROM VPS
    // ============================================

    if (products.length > 0) {

      await deleteImageFromStorage(
        products[0].featured_image
      );

    }


    // ============================================
    // 4. DELETE ALL GALLERY IMAGES FROM VPS
    // ============================================

    for (const galleryImage of galleryImages) {

      await deleteImageFromStorage(
        galleryImage.image_url
      );

    }


    // ============================================
    // 5. DELETE GALLERY DATABASE RECORDS
    // ============================================

    await db.query(
      `
      DELETE FROM product_gallery_images
      WHERE product_id = ?
      `,
      [productId]
    );


    // ============================================
    // 6. DELETE PRODUCT CATALOG MAPPINGS
    // ============================================

    await db.query(
      `
      DELETE FROM product_catalog_map
      WHERE product_id = ?
      `,
      [productId]
    );


    // ============================================
    // 7. DELETE PRODUCT
    // ============================================

    const [deleteResult] = await db.query(
      `
      DELETE FROM products
      WHERE id = ?
      `,
      [productId]
    );


    if (deleteResult.affectedRows === 0) {

      return Response.json(
        {
          success: false,
          message: "Product not found",
        },
        {
          status: 404,
        }
      );

    }


    return Response.json(
      {
        success: true,
        message:
          "Product and images deleted successfully",
      },
      {
        status: 200,
      }
    );

  } catch (error) {

    console.error(
      "DELETE /api/products/[id] error:",
      error
    );

    return Response.json(
      {
        success: false,
        message: "Server error",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}


