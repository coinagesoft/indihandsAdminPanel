import { db } from "../../../db";

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const companyId = Number(id);

    const body = await req.json();
    const { companyName, companyEmail } = body;

    if (!companyId) {
      return Response.json({ message: "Invalid companyId" }, { status: 400 });
    }

    await db.query(
      `UPDATE companies SET company_name=?, company_email=? WHERE id=?`,
      [companyName?.trim() || "", companyEmail?.trim() || "", companyId]
    );

    return Response.json({ message: "Company updated" }, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/companies/[id] error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}

/* ✅ delete company (will delete branches due to cascade) */
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const companyId = Number(id);

    if (!companyId) {
      return Response.json({ message: "Invalid companyId" }, { status: 400 });
    }

    await db.query(`DELETE FROM companies WHERE id=?`, [companyId]);

    return Response.json({ message: "Company deleted" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/companies/[id] error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
