import { NextResponse } from "next/server";
import { db } from "../../../db";
import * as XLSX from "xlsx";

export async function GET() {

  try {
    /* ================= PRODUCTS ================= */
    const [rows] = await db.query(`
      SELECT

        p.id AS productId,

        p.product_name AS productName,

        p.base_price AS basePrice,

        cpp.custom_price AS customPrice,

        COALESCE(
          cpp.custom_price,
          p.base_price
        ) AS finalPrice

      FROM products p

      LEFT JOIN customer_product_pricing cpp
        ON cpp.product_id = p.id

      ORDER BY p.id ASC
    `);

    /* ================= PREP DATA ================= */

    const data = rows.map((r) => ({

      "Product ID":
        r.productId,

      "Product Name":
        r.productName,

      "Base Price (₹)":
        r.basePrice,

      "Custom Price (₹)":
        r.customPrice ?? "",

   
    }));

    /* ================= SHEET ================= */

    const ws =
      XLSX.utils.json_to_sheet(data);

    /* ================= WIDTH ================= */

    ws["!cols"] = [

      { wch: 15 },

      { wch: 35 },

      { wch: 18 },

      { wch: 18 },

    ];

    /* ================= HEADER STYLE ================= */

    const range =
      XLSX.utils.decode_range(
        ws["!ref"]
      );

    for (
      let C = range.s.c;
      C <= range.e.c;
      ++C
    ) {

      const cell =
        ws[
          XLSX.utils.encode_cell({
            r: 0,
            c: C,
          })
        ];

      if (cell) {

        cell.s = {

          font: {
            bold: true,
            color: {
              rgb: "FFFFFF",
            },
          },

          fill: {
            fgColor: {
              rgb: "4472C4",
            },
          },

          alignment: {
            horizontal: "center",
          },
        };
      }
    }

    /* ================= ₹ FORMAT ================= */

    for (
      let R = 1;
      R <= range.e.r;
      ++R
    ) {

      const baseCell =
        ws[
          XLSX.utils.encode_cell({
            r: R,
            c: 2,
          })
        ];

      const customCell =
        ws[
          XLSX.utils.encode_cell({
            r: R,
            c: 3,
          })
        ];

      const finalCell =
        ws[
          XLSX.utils.encode_cell({
            r: R,
            c: 4,
          })
        ];

      if (baseCell) {
        baseCell.z = "₹#,##0.00";
      }

      if (customCell) {
        customCell.z = "₹#,##0.00";
      }

      if (finalCell) {
        finalCell.z = "₹#,##0.00";
      }
    }

    /* ================= FILTER ================= */

    ws["!autofilter"] = {
      ref: ws["!ref"],
    };

    /* ================= WORKBOOK ================= */

    const wb =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      wb,
      ws,
      "B2C Pricing"
    );

    const buffer = XLSX.write(
      wb,
      {
        type: "buffer",
        bookType: "xlsx",
        cellStyles: true,
      }
    );

    /* ================= RESPONSE ================= */

    return new NextResponse(
      buffer,
      {
        headers: {

          "Content-Disposition":
            "attachment; filename=b2c_pricing.xlsx",

          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      }
    );

  } catch (err) {

    console.error(
      "Export B2C pricing error:",
      err
    );

    return NextResponse.json(
      {
        message:
          "Failed to export pricing",
      },
      {
        status: 500,
      }
    );
  }
}