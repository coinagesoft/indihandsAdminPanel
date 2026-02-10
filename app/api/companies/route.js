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

    const formatted = companies.map((c) => ({
      ...c,
      branches: branches
        .filter((b) => b.companyId === c.id)
        .map((b) => ({
          ...b,
          phones: typeof b.phones === "string" ? JSON.parse(b.phones || "[]") : (b.phones || []),
          emails: typeof b.emails === "string" ? JSON.parse(b.emails || "[]") : (b.emails || []),
        })),
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
    const { companyName, companyEmail } = body;

    if (!companyName?.trim())
      return Response.json({ message: "Company name required" }, { status: 400 });

    if (!companyEmail?.trim())
      return Response.json({ message: "Company email required" }, { status: 400 });

    const [result] = await db.query(
      `INSERT INTO companies (company_name, company_email) VALUES (?, ?)`,
      [companyName.trim(), companyEmail.trim()]
    );

    return Response.json(
      { message: "Company created", id: result.insertId },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/companies error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
