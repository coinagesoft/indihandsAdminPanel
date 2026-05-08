import { db } from "../../../db";

export async function POST(req) {

  try {

    const body = await req.json();

    const {
      pricing = [],
    } = body;

    /* ================= VALIDATION ================= */

    if (
      !Array.isArray(pricing) ||
      pricing.length === 0
    ) {

      return Response.json(
        {
          message:
            "Pricing array required",
        },
        {
          status: 400,
        }
      );
    }

    /* ================= SAVE ================= */

    for (const p of pricing) {

      const productId = Number(
        p.productId
      );

      if (!productId) continue;

      let price = null;

      if (
        p.price !== "" &&
        p.price !== null &&
        p.price !== undefined
      ) {

        const parsed = Number(
          p.price
        );

        if (!isNaN(parsed)) {
          price = parsed;
        }
      }

      /* ================= DELETE ================= */

      if (price === null) {

        await db.query(
          `
          DELETE FROM customer_product_pricing
          WHERE product_id = ?
          `,
          [productId]
        );

        continue;
      }

      /* ================= INSERT / UPDATE ================= */

      await db.query(
        `
        INSERT INTO customer_product_pricing
          (
            product_id,
            custom_price
          )

        VALUES (?, ?)

        ON DUPLICATE KEY UPDATE

          custom_price =
            VALUES(custom_price),

          updated_at =
            CURRENT_TIMESTAMP
        `,
        [
          productId,
          price,
        ]
      );
    }

    /* ================= RESPONSE ================= */

    return Response.json(
      {
        message:
          "B2C pricing saved successfully",
      },
      {
        status: 200,
      }
    );

  } catch (err) {

    console.error(
      "POST /api/customer-pricing error:",
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