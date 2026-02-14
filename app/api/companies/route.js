import { db } from "../../db";

/* ✅ GET all companies + branches */
export async function GET() {
  try {
    const [companies] = await db.query(`
      SELECT id, company_name AS companyName, company_email AS companyEmail
      FROM companies
      ORDER BY id DESC
    `);

    const [branches] = await db.query(`
      SELECT 
        id,
        company_id AS companyId,
        branch_name AS branchName,
        gstin,
        contact_person AS contactPerson,
        shipping_address AS shippingAddress,
        billing_address AS billingAddress,
        login_email AS loginEmail,
        password_hash,
        phones,
        emails
      FROM company_branches
      ORDER BY id DESC
    `);

    const [charges] = await db.query(`
      SELECT 
        company_id AS companyId,
        label,
        amount,
        tax_percent AS taxPercent
      FROM company_charges
    `);

    const formatted = companies.map((c) => ({
      ...c,

      branches: branches
        .filter((b) => b.companyId === c.id)
        .map((b) => ({
          ...b,
          phones: typeof b.phones === "string" ? JSON.parse(b.phones || "[]") : (b.phones || []),
          emails: typeof b.emails === "string" ? JSON.parse(b.emails || "[]") : (b.emails || []),
        })),

      charges: charges.filter((ch) => ch.companyId === c.id)   // ✅ ADD
    }));

    return Response.json({ companies: formatted }, { status: 200 });
  } catch (err) {
    console.error("GET /api/companies error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}





/* ✅ Create Company */
export async function POST(req) {
  try {
    const body = await req.json();
    const { companyName, companyEmail, charges } = body;

    if (!companyName?.trim())
      return Response.json({ message: "Company name required" }, { status: 400 });

    if (!companyEmail?.trim())
      return Response.json({ message: "Company email required" }, { status: 400 });

    // create company
    const [result] = await db.query(
      `INSERT INTO companies (company_name, company_email) VALUES (?, ?)`,
      [companyName.trim(), companyEmail.trim()]
    );

    const companyId = result.insertId;

    // ✅ insert charges if any
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

    return Response.json(
      { message: "Company created", id: companyId },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/companies error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}

