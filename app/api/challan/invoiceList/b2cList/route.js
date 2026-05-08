import { db } from "../../../../db";
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

        /* proposal */
        p.rfq_id,
        p.proposal_number,

        /* customer */
        r.client_name

      FROM invoices i

      LEFT JOIN proposals p ON p.id = i.proposal_id
      LEFT JOIN rfqs r ON r.id = p.rfq_id

      WHERE i.invoice_for = 'B2C'
    `;

    const params = [];

    /* 🔍 SEARCH */
    if (search) {
      query += `
        AND (
          i.invoice_number LIKE ?
          OR p.proposal_number LIKE ?
          OR r.client_name LIKE ?
        )
      `;

      params.push(
        `%${search}%`,
        `%${search}%`,
        `%${search}%`
      );
    }

    /* 📅 FROM DATE */
    if (fromDate) {
      query += ` AND DATE(i.invoice_date) >= ?`;
      params.push(fromDate);
    }

    /* 📅 TO DATE */
    if (toDate) {
      query += ` AND DATE(i.invoice_date) <= ?`;
      params.push(toDate);
    }

    query += ` ORDER BY i.id DESC`;

    const [rows] = await db.query(query, params);

    return Response.json(rows);

  } catch (err) {
    console.error("❌ B2C Invoice history API error:", err);

    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}