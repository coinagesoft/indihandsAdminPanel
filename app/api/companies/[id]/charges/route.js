import { db } from "../../../../db"; // adjust path if needed

export async function GET(req, { params }) {
  try {
   const { id } = await params;
    const companyId = Number(id);


    if (!companyId) {
      return Response.json(
        { message: "Invalid companyId" },
        { status: 400 }
      );
    }

    const [rows] = await db.query(
      `SELECT label, amount, tax_percent AS taxPercent
       FROM company_charges
       WHERE company_id = ?`,
      [companyId]
    );

    return Response.json({
      charges: rows || [],
    });
  } catch (err) {
    console.error("GET company charges error:", err);
    return Response.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
