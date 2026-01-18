import { NextResponse } from "next/server";
import {db} from "../../../db";

export async function POST(req) {
  try {
    const { rows } = await req.json();

    if (!Array.isArray(rows)) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    const values = rows
      .filter((r) => r.company_id && r.product_id && r.custom_price !== "")
      .map((r) => [
        r.company_id,
        r.product_id,
        Number(r.custom_price),
      ]);

    if (!values.length) {
      return NextResponse.json(
        { message: "No valid rows to import" },
        { status: 400 }
      );
    }

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
