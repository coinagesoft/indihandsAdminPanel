import { db } from "../../../db";


export async function GET(req) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const search = searchParams.get("search") || "";
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    let query = `
      SELECT 
        i.id,
        i.invoice_number,
        i.proposal_id,
        
        i.status,
        i.grand_total,

        DATE_FORMAT(i.invoice_date, '%Y-%m-%d') as invoice_date,

        /* from proposal */
        p.rfq_id,
  p.proposal_number,
        /* from RFQ */
        r.client_name,

        /* from company */
        c.company_name

      FROM invoices i
      LEFT JOIN proposals p ON p.id = i.proposal_id
      LEFT JOIN rfqs r ON r.id = p.rfq_id
      LEFT JOIN companies c ON c.id = p.company_id

      WHERE 1=1
    `;

    const params = [];

    /* 🔍 SEARCH */
    if (search) {
      query += `
        AND (
          i.invoice_number LIKE ?
          OR i.proposal_id LIKE ?
          OR r.client_name LIKE ?
        )
      `;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    /* 📅 DATE */
    if (fromDate) {
      query += ` AND DATE(i.invoice_date) >= ?`;
      params.push(fromDate);
    }

    if (toDate) {
      query += ` AND DATE(i.invoice_date) <= ?`;
      params.push(toDate);
    }

    query += ` ORDER BY i.id DESC`;

    const [rows] = await db.query(query, params);

    return Response.json(rows);

  } catch (err) {
    console.error("❌ Invoice list API error:", err);
    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}