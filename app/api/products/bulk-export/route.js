import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { db } from "../../../db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
   
    const status = searchParams.get("status");

    let query = `
      SELECT
       id,
        product_name,
        sku,
        barcode,
        hsn,
          size,         
        weight,
        description,
        stock_qty,
        base_price,
        status,
        cgst_rate,
        sgst_rate,
        igst_rate,
        featured_image
      FROM products
      WHERE 1=1
    `;

    const params = [];

    if (search) {
      query += ` AND (product_name LIKE ? OR sku LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status && status !== "All") {
      query += ` AND status = ?`;
      params.push(status);
    }

    const [rows] = await db.query(query, params);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Products");

    sheet.columns = [
       { header: "ID", key: "id", width: 10 },   // 🔥 ADD
      { header: "Product Name", key: "product_name", width: 25 },
      { header: "SKU", key: "sku", width: 15 },
      { header: "Barcode", key: "barcode", width: 15 },
      { header: "HSN", key: "hsn", width: 15 },
       { header: "Size", key: "size", width: 18 },       
      { header: "Weight", key: "weight", width: 15 }, 
      { header: "Description", key: "description", width: 30 },
      { header: "Stock Qty", key: "stock_qty", width: 12 },
      { header: "Base Price", key: "base_price", width: 12 },
      { header: "Status", key: "status", width: 12 },
      { header: "CGST", key: "cgst_rate", width: 10 },
      { header: "SGST", key: "sgst_rate", width: 10 },
      { header: "IGST", key: "igst_rate", width: 10 },
      { header: "Featured Image", key: "featured_image", width: 35 },
    ];

     rows.forEach((row) => {
      sheet.addRow({
        ...row,
        size: row.size || "",       
        weight: row.weight || "",   
      });
    });

    sheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          "attachment; filename=products_export.xlsx",
      },
    });
  } catch (err) {
    console.error("Export error:", err);
    return NextResponse.json(
      { error: "Failed to export products" },
      { status: 500 }
    );
  }
}
