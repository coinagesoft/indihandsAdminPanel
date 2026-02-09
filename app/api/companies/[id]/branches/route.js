import { db } from "../../../../db";
import bcrypt from "bcryptjs";






export async function POST(req, { params }) {
  try {
    const { id } =await  params;
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
      password,
    } = body;

    /* ================= VALIDATIONS ================= */

    if (!branchName?.trim())
      return Response.json({ message: "Branch name required" }, { status: 400 });

    if (!gstin?.trim())
      return Response.json({ message: "GSTIN required" }, { status: 400 });

    if (!loginEmail?.trim())
      return Response.json({ message: "Login email required" }, { status: 400 });

    if (!password?.trim() || password.trim().length < 6)
      return Response.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );

    /* ================= DUPLICATE CHECKS ================= */

    const [existingUser] = await db.query(
      "SELECT id FROM users WHERE email=? LIMIT 1",
      [loginEmail.trim()]
    );

    if (existingUser.length) {
      return Response.json(
        { message: "This login email already exists" },
        { status: 400 }
      );
    }

    const [existingBranch] = await db.query(
      "SELECT id FROM company_branches WHERE login_email=? LIMIT 1",
      [loginEmail.trim()]
    );

    if (existingBranch.length) {
      return Response.json(
        { message: "This login email already exists in branches" },
        { status: 400 }
      );
    }

    /* ================= PASSWORD HASH ================= */

    const passwordHash = await bcrypt.hash(password.trim(), 10);

    /* ================= INSERT BRANCH ================= */

    const [branchResult] = await db.query(
      `INSERT INTO company_branches
      (company_id, branch_name, phones, emails, gstin, contact_person,
       shipping_address, billing_address, login_email, password_hash)
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
        passwordHash,
      ]
    );

    /* ================= INSERT USER ================= */

    const [userResult] = await db.query(
      `INSERT INTO users (email, role, active, password_hash)
       VALUES (?, 'client', 1, ?)`,
      [
        loginEmail.trim(),
        passwordHash,
      ]
    );

    return Response.json(
      {
        message: "Branch & client user created successfully",
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



