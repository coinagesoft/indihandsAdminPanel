import { NextResponse } from "next/server";
import { db } from "../../../db";
import * as XLSX from "xlsx";




export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    let where = "";
    let params = [];

    if (companyId && companyId !== "all") {
      where = "WHERE c.id = ?";
      params.push(companyId);
    }

    const [rows] = await db.query(
      `
      SELECT
        c.id AS companyId,
        c.company_name AS companyName,
        p.id AS productId,
        p.product_name AS productName,
        p.base_price AS basePrice,
        cpp.custom_price AS customPrice,
        cpp.prefix AS prefix,  -- ✅ NEW FIELD
        COALESCE(cpp.custom_price, p.base_price) AS finalPrice
      FROM companies c
      CROSS JOIN products p
      LEFT JOIN company_product_pricing cpp
        ON cpp.company_id = c.id
       AND cpp.product_id = p.id
      ${where}
      ORDER BY c.id ASC, p.id ASC   -- ✅ FCFS ORDER FIX
      `,
      params
    );

    /* ========= PREP DATA ========= */
    const data = rows.map((r) => ({
      "Company ID": r.companyId,
      "Company Name": r.companyName,
      "Product ID": r.productId,
      "Product Name": r.productName,
      "Base Price (₹)": r.basePrice,
      "Custom Price (₹)": r.customPrice ?? "",
      "Prefix Line No": r.prefix ?? ""
    }));

    const ws = XLSX.utils.json_to_sheet(data);

    /* ========= COLUMN WIDTH ========= */
    ws["!cols"] = [
      { wch: 12 },
      { wch: 25 },
      { wch: 12 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 }  // ✅ PREFIX COLUMN WIDTH
    ];

    /* ========= HEADER STYLE ========= */
    const range = XLSX.utils.decode_range(ws["!ref"]);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: C })];
      if (cell) {
        cell.s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4472C4" } },
          alignment: { horizontal: "center" }
        };
      }
    }

    /* ========= PRICE FORMAT ₹ ========= */
    for (let R = 1; R <= range.e.r; ++R) {
      const baseCell = ws[XLSX.utils.encode_cell({ r: R, c: 4 })];
      const customCell = ws[XLSX.utils.encode_cell({ r: R, c: 5 })];

      if (baseCell) baseCell.z = "₹#,##0.00";
      if (customCell) customCell.z = "₹#,##0.00";
    }

    /* ========= FILTER ========= */
    ws["!autofilter"] = { ref: ws["!ref"] };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Org Pricing");

    const buffer = XLSX.write(wb, {
      type: "buffer",
      bookType: "xlsx",
      cellStyles: true
    });

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