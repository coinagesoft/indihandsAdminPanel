import { db } from "../../db";

export async function GET() {

  try {

    /* ================= PRODUCTS ================= */

    const [products] = await db.query(`
      SELECT

        id,

        product_name AS name,

        base_price AS basePrice

      FROM products

      ORDER BY id DESC
    `);

    /* ================= B2C PRICING ================= */

    const [pricingRaw] = await db.query(`
      SELECT DISTINCT

        product_id AS productId,

        custom_price AS price

      FROM customer_product_pricing
    `);

    /* ================= NORMALIZE ================= */

    const pricing = pricingRaw.map((p) => ({

      productId: p.productId,

      price:
        p.price == null
          ? ""
          : Number(p.price),
    }));

    /* ================= RESPONSE ================= */

    return Response.json(
      {
        products,
        pricing,
      },
      {
        status: 200,
      }
    );

  } catch (err) {

    console.error(
      "GET /api/customer-pricing error:",
      err
    );

    return Response.json(
      {
        message: "Server error",
      },
      {
        status: 500,
      }
    );
  }
}