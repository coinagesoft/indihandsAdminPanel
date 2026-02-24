import { NextResponse } from "next/server";
import {db} from "../../../db";

export async function POST(req) {
  try {
    const { rows } = await req.json();

    if (!Array.isArray(rows)) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

const values = rows
  .map((r) => {
    const companyId = Number(r.company_id);
    const productId = Number(r.product_id);

    let price = r.custom_price;

    if (price === "" || price == null) {
      price = null;
    } else {
      // ✅ remove currency + commas
      price = String(price)
        .replace(/₹/g, "")
        .replace(/,/g, "")
        .trim();

      price = Number(price);

      if (isNaN(price)) price = null;
    }

    if (!companyId || !productId) return null;

    return [companyId, productId, price];
  })
  .filter(Boolean);

   await db.query(
  `
  INSERT INTO company_product_pricing (company_id, product_id, custom_price)
  VALUES ?
  ON DUPLICATE KEY UPDATE
    custom_price = VALUES(custom_price),
    updated_at = CURRENT_TIMESTAMP
  `,
  [values]
);

    return NextResponse.json({
      message: `Imported ${values.length} pricing records successfully`,
    });
  } catch (err) {
    console.error("Import pricing error:", err);
    return NextResponse.json(
      { message: "Failed to import pricing" },
      { status: 500 }
    );
  }
}
