import { db } from "../../../db";

export async function PATCH(req, { params }) {
  try {
       const { id } = await params;   // ✅ unwrap params
    const companyId = Number(id);

    if (!companyId) {
      return Response.json({ message: "Invalid companyId" }, { status: 400 });
    }

    const body = await req.json();
    const { companyName, companyEmail, charges } = body;

    // ✅ update company
    await db.query(
      `UPDATE companies 
       SET company_name = ?, company_email = ?
       WHERE id = ?`,
      [companyName?.trim() || "", companyEmail?.trim() || "", companyId]
    );

    // ✅ replace charges
    await db.query(`DELETE FROM company_charges WHERE company_id = ?`, [companyId]);

    if (Array.isArray(charges) && charges.length > 0) {
      const values = charges.map((c) => [
        companyId,
        c.label,
        c.amount || 0,
        c.taxPercent || 0,
      ]);

      await db.query(
        `INSERT INTO company_charges (company_id, label, amount, tax_percent)
         VALUES ?`,
        [values]
      );
    }

    return Response.json({ message: "Company updated" }, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/companies/[id] error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}


/* ✅ delete company (will delete branches due to cascade) */
export async function DELETE(req, { params }) {
  try {
    const companyId = Number(params.id);

    if (!companyId) {
      return Response.json({ message: "Invalid companyId" }, { status: 400 });
    }

    // delete charges first (safe)
    await db.query(`DELETE FROM company_charges WHERE company_id = ?`, [companyId]);

    // delete company (branches cascade)
    await db.query(`DELETE FROM companies WHERE id = ?`, [companyId]);

    return Response.json({ message: "Company deleted" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/companies/[id] error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}

