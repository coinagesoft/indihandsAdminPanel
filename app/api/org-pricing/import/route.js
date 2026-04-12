import { NextResponse } from "next/server";
import {db} from "../../../db";

// export async function POST(req) {
//   try {
//     const { rows } = await req.json();

//     if (!Array.isArray(rows)) {
//       return NextResponse.json({ message: "Invalid data" }, { status: 400 });
//     }

// const values = rows
//   .map((r) => {
//     const companyId = Number(r.company_id);
//     const productId = Number(r.product_id);

//     let price = r.custom_price;

//     if (price === "" || price == null) {
//       price = null;
//     } else {
//       // ✅ remove currency + commas
//       price = String(price)
//         .replace(/₹/g, "")
//         .replace(/,/g, "")
//         .trim();

//       price = Number(price);

//       if (isNaN(price)) price = null;
//     }

//     if (!companyId || !productId) return null;

//     return [companyId, productId, price];
//   })
//   .filter(Boolean);

//    await db.query(
//   `
//   INSERT INTO company_product_pricing (company_id, product_id, custom_price)
//   VALUES ?
//   ON DUPLICATE KEY UPDATE
//     custom_price = VALUES(custom_price),
//     updated_at = CURRENT_TIMESTAMP
//   `,
//   [values]
// );

//     return NextResponse.json({
//       message: `Imported ${values.length} pricing records successfully`,
//     });
//   } catch (err) {
//     console.error("Import pricing error:", err);
//     return NextResponse.json(
//       { message: "Failed to import pricing" },
//       { status: 500 }
//     );
//   }
// }


export async function POST(req) {
  try {
    const { rows } = await req.json();

    if (!Array.isArray(rows)) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    // 🔥 helper to clean price
    const parsePrice = (val) => {
      if (val === "" || val === null || val === undefined) return null;

      const cleaned = String(val)
        .replace(/₹/g, "")
        .replace(/,/g, "")
        .trim();

      const num = Number(cleaned);
      return isNaN(num) ? null : num;
    };

    // 🔥 normalize keys (handles Excel spacing / casing issues)
    const normalizeRow = (row) => {
      const obj = {};
      Object.keys(row).forEach((k) => {
        obj[k.trim().toLowerCase()] = row[k];
      });
      return obj;
    };

    const getValue = (obj, keys) => {
  const normalized = {};

  Object.keys(obj).forEach((k) => {
    normalized[k.trim().toLowerCase().replace(/\s+/g, " ")] = obj[k];
  });

  for (const key of keys) {
    const val = normalized[key.toLowerCase()];
    if (val !== undefined) return val;
  }

  return null;
};

    const values = rows
      .map((r) => {
        const row = normalizeRow(r);

        const companyId = Number(row["company id"] || row.company_id);
        const productId = Number(row["product id"] || row.product_id);

        const price = parsePrice(
          row["custom price (₹)"] ?? row.custom_price
        );

    const prefix =
  getValue(row, ["prefix line no", "prefix"])?.toString().trim() || null;

        if (!companyId || !productId) return null;

        return [companyId, productId, price, prefix];
      })
      .filter(Boolean);

    if (values.length === 0) {
      return NextResponse.json(
        { message: "No valid rows found in file" },
        { status: 400 }
      );
    }

    await db.query(
      `
      INSERT INTO company_product_pricing 
      (company_id, product_id, custom_price, prefix)
      VALUES ?
      ON DUPLICATE KEY UPDATE
        custom_price = VALUES(custom_price),
        prefix = VALUES(prefix),   -- ✅ IMPORTANT
        updated_at = CURRENT_TIMESTAMP
      `,
      [values]
    );

    return NextResponse.json({
      message: `✅ Imported ${values.length} pricing records successfully`,
    });
  } catch (err) {
    console.error("Import pricing error:", err);
    return NextResponse.json(
      { message: "Failed to import pricing", error: err.message },
      { status: 500 }
    );
  }
}