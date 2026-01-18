import { NextResponse } from "next/server";
import {db} from "../../../db";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        c.id AS "Company ID",
        c.company_name AS "Company Name",
        p.id AS "Product ID",
        p.product_name AS "Product Name",
        p.category AS "Category",
        p.sub_category AS "Sub Category",
        p.base_price AS "Base Price",
        IFNULL(cpp.custom_price, p.base_price) AS "Custom Price"
      FROM companies c
      CROSS JOIN products p
      LEFT JOIN company_product_pricing cpp
        ON cpp.company_id = c.id
       AND cpp.product_id = p.id
      ORDER BY c.company_name, p.product_name
    `);

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Org Pricing");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Disposition": "attachment; filename=org_pricing.xlsx",
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (err) {
    console.error("Export pricing error:", err);
    return NextResponse.json(
      { message: "Failed to export pricing" },
      { status: 500 }
    );
  }
}
