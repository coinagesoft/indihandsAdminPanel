import { NextResponse } from "next/server";
import { db } from "../../../db";



export async function POST(req) {

  try {

    const { rows } = await req.json();

    /* ================= VALIDATION ================= */

    if (!Array.isArray(rows)) {

      return NextResponse.json(
        {
          message: "Invalid data",
        },
        {
          status: 400,
        }
      );
    }

    /* ================= HELPERS ================= */

    const parsePrice = (val) => {

      if (
        val === "" ||
        val === null ||
        val === undefined
      ) {
        return null;
      }

      const cleaned = String(val)

        .replace(/₹/g, "")
        .replace(/,/g, "")
        .trim();

      const num = Number(cleaned);

      return isNaN(num)
        ? null
        : num;
    };

    /* ================= VALUES ================= */

    const values = rows

      .map((row) => {

        const productId = Number(
          row.productId ||
          row["Product ID"] ||
          row.product_id
        );

        const price = parsePrice(
          row.price ??
          row["Custom Price (₹)"] ??
          row.custom_price
        );

        if (!productId) {
          return null;
        }

        return [
          productId,
          price,
        ];
      })

      .filter(Boolean);

    /* ================= EMPTY ================= */

    if (values.length === 0) {

      return NextResponse.json(
        {
          message:
            "No valid rows found in file",
        },
        {
          status: 400,
        }
      );
    }

    /* ================= INSERT ================= */

    await db.query(
      `
      INSERT INTO customer_product_pricing

      (
        product_id,
        custom_price
      )

      VALUES ?

      ON DUPLICATE KEY UPDATE

        custom_price =
          VALUES(custom_price),

        updated_at =
          CURRENT_TIMESTAMP
      `,
      [values]
    );

    /* ================= RESPONSE ================= */

    return NextResponse.json({

      message:
        `Imported ${values.length} B2C pricing records successfully`,
    });

  } catch (err) {

    console.error(
      "Import B2C pricing error:",
      err
    );

    return NextResponse.json(
      {
        message:
          "Failed to import pricing",

        error: err.message,
      },
      {
        status: 500,
      }
    );
  }
}