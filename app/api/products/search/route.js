import { db } from "../../../db";

export async function GET(req) {

  try {

    const { searchParams } = new URL(req.url);

    const search =
      searchParams.get("search") || "";

    const limit =
      parseInt(searchParams.get("limit")) || 20;

    let where = `
      WHERE p.status != 'Deleted'
    `;

    let values = [];

    /* SEARCH */

    if (search) {

      where += `
        AND (
          p.product_name LIKE ?
          OR p.sku LIKE ?
          OR p.barcode LIKE ?
        )
      `;

      values.push(
        `%${search}%`,
        `%${search}%`,
        `%${search}%`
      );
    }

    /* PRODUCTS */

    const [products] = await db.query(
      `
      SELECT

        p.id,

        p.product_name,

        p.barcode,

        p.hsn,

        p.stock_qty,

        p.base_price,

        p.featured_image,

        p.cgst_rate,

        p.sgst_rate,

        p.igst_rate

      FROM products p

      ${where}

      ORDER BY p.product_name ASC

      LIMIT ?
      `,
      [...values, limit]
    );

    return Response.json({
      products
    });

  } catch (err) {

    console.error(err);

    return Response.json(
      {
        message: "Server error"
      },
      {
        status: 500
      }
    );
  }
}