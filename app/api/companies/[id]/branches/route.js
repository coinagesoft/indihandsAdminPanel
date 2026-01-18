import { db } from "../../../../db";
import bcrypt from "bcryptjs";

/* ✅ Add new branch to company */


export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const companyId = Number(id);

    if (!companyId) {
      return Response.json({ message: "Invalid companyId" }, { status: 400 });
    }

    const body = await req.json();
    const {
      branchName,
      gstin,
      contactPerson,
      shippingAddress,
      billingAddress,
      phones = [],
      emails = [],
      loginEmail,
    } = body;

    if (!branchName?.trim())
      return Response.json({ message: "Branch name required" }, { status: 400 });

    if (!gstin?.trim())
      return Response.json({ message: "GSTIN required" }, { status: 400 });

    if (!loginEmail?.trim())
      return Response.json({ message: "Login email required" }, { status: 400 });

    // ✅ Check if loginEmail already exists in users
    const [existingUser] = await db.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [loginEmail.trim()]
    );

    if (existingUser.length > 0) {
      return Response.json(
        { message: "This login email already exists in users" },
        { status: 400 }
      );
    }

    // ✅ Check if loginEmail already exists in branches
    const [existingBranch] = await db.query(
      "SELECT id FROM company_branches WHERE login_email = ? LIMIT 1",
      [loginEmail.trim()]
    );

    if (existingBranch.length > 0) {
      return Response.json(
        { message: "This login email already exists in branches" },
        { status: 400 }
      );
    }

    // ✅ Insert into company_branches (password_hash null)
    const [branchResult] = await db.query(
      `INSERT INTO company_branches 
      (company_id, branch_name, phones, emails, gstin, contact_person, shipping_address, billing_address, login_email, password_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        companyId,
        branchName.trim(),
        JSON.stringify(phones),
        JSON.stringify(emails),
        gstin.trim(),
        contactPerson || null,
        shippingAddress || null,
        billingAddress || null,
        loginEmail.trim(),
        null, // ✅ password will be set via reset link
      ]
    );

    // ✅ Insert into users (Client account)
    const [userResult] = await db.query(
      `INSERT INTO users (email, role, active, password_hash)
       VALUES (?, 'Client', 1, ?)`,
      [
        loginEmail.trim(),    // email
        null,                 // password will be set via reset link
      ]
    );

    return Response.json(
      {
        message: "Branch created & Client user added",
        branchId: branchResult.insertId,
        userId: userResult.insertId,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/companies/[id]/branches error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}

