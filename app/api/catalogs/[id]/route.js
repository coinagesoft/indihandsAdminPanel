import { db } from "../../../db";

const STORAGE_BASE_URL =
  "https://storage.indihands.com";


// ============================================
// DELETE CATALOG IMAGE FROM VPS
// ============================================

async function deleteCatalogImageFromStorage(imageUrl) {
  if (!imageUrl) {
    console.log("No catalog image to delete");
    return;
  }

  try {
    console.log("CATALOG IMAGE TO DELETE:", imageUrl);

    // Extract filename from URL
    const url = new URL(imageUrl);

    const fileName = decodeURIComponent(
      url.pathname.split("/").pop()
    );

    if (!fileName) {
      console.log("Could not extract catalog image filename");
      return;
    }

    const deleteUrl =
      `${STORAGE_BASE_URL}/api/delete/category/${encodeURIComponent(fileName)}`;

    console.log("VPS DELETE URL:", deleteUrl);

    const deleteResponse = await fetch(deleteUrl, {
      method: "DELETE",
    });

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

    // Ignore 404 because image might already be deleted
    if (
      !deleteResponse.ok &&
      deleteResponse.status !== 404
    ) {
      throw new Error(
        `Failed to delete catalog image: ${responseText}`
      );
    }

    console.log(
      "Catalog image deleted successfully:",
      fileName
    );

  } catch (error) {
    console.error(
      "DELETE CATALOG IMAGE ERROR:",
      error
    );

    throw error;
  }
}


// ============================================
// DELETE CATALOG
// ============================================

export async function DELETE(req, { params }) {
  const { id } = await params;

  const catalogId = Number(id);

  if (!catalogId) {
    return Response.json(
      {
        message: "Invalid catalogId"
      },
      {
        status: 400
      }
    );
  }

  const conn = await db.getConnection();

  try {
    // ==========================================
    // GET CATALOG + OLD IMAGE FIRST
    // ==========================================

    const [catalogs] = await conn.query(
      `
      SELECT
        id,
        featured_image
      FROM catalogs
      WHERE id = ?
      `,
      [catalogId]
    );

    if (!catalogs.length) {
      return Response.json(
        {
          message: "Catalog not found"
        },
        {
          status: 404
        }
      );
    }

    const catalog = catalogs[0];

    const oldImageUrl =
      catalog.featured_image;


    console.log(
      "OLD CATALOG IMAGE:",
      oldImageUrl
    );


    // ==========================================
    // DELETE IMAGE FROM VPS FIRST
    // ==========================================

    if (oldImageUrl) {
      await deleteCatalogImageFromStorage(
        oldImageUrl
      );
    }


    // ==========================================
    // START DATABASE TRANSACTION
    // ==========================================

    await conn.beginTransaction();


    // ==========================================
    // DELETE PRODUCT MAPPINGS
    // ==========================================

    await conn.query(
      `
      DELETE FROM product_catalog_map
      WHERE catalog_id = ?
      `,
      [catalogId]
    );


    // ==========================================
    // DELETE CATALOG
    // ==========================================

    await conn.query(
      `
      DELETE FROM catalogs
      WHERE id = ?
      `,
      [catalogId]
    );


    await conn.commit();


    return Response.json(
      {
        message:
          "Catalog and image deleted successfully"
      },
      {
        status: 200
      }
    );

  } catch (err) {

    await conn.rollback();

    console.error(
      "DELETE /api/catalogs/[id] error:",
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

  } finally {

    conn.release();

  }
}