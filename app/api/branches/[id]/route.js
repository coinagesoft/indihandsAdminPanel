import { db } from "../../../db";
import bcrypt from "bcryptjs";


/* ✅ Update branch */
export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const branchId = Number(id);

    if (!branchId) {
      return Response.json({ message: "Invalid branchId" }, { status: 400 });
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
      password, // optional
    } = body;

    /* ================= FETCH EXISTING ================= */

    const [branchRows] = await db.query(
      "SELECT login_email FROM company_branches WHERE id=? LIMIT 1",
      [branchId]
    );

    if (!branchRows.length) {
      return Response.json({ message: "Branch not found" }, { status: 404 });
    }

    const oldEmail = branchRows[0].login_email;

    /* ================= EMAIL DUPLICATE CHECK ================= */

    if (loginEmail && loginEmail.trim() !== oldEmail) {
      const [dup] = await db.query(
        "SELECT id FROM users WHERE email=? LIMIT 1",
        [loginEmail.trim()]
      );

      if (dup.length) {
        return Response.json(
          { message: "This login email already exists" },
          { status: 400 }
        );
      }
    }

    /* ================= PASSWORD ================= */

    let passwordHash = null;
    if (password?.trim()) {
      if (password.length < 6) {
        return Response.json(
          { message: "Password must be at least 6 characters" },
          { status: 400 }
        );
      }
      passwordHash = await bcrypt.hash(password, 10);
    }

    /* ================= UPDATE company_branches ================= */

    const branchValues = [
      branchName?.trim() || "",
      JSON.stringify(phones),
      JSON.stringify(emails),
      gstin?.trim() || "",
      contactPerson || null,
      shippingAddress || null,
      billingAddress || null,
      loginEmail?.trim() || oldEmail,
    ];

    let branchPasswordSQL = "";
    if (passwordHash) {
      branchPasswordSQL = ", password_hash=?";
      branchValues.push(passwordHash);
    }

    branchValues.push(branchId);

    await db.query(
      `
      UPDATE company_branches
      SET branch_name=?, phones=?, emails=?, gstin=?, contact_person=?,
          shipping_address=?, billing_address=?, login_email=?
          ${branchPasswordSQL}
      WHERE id=?
      `,
      branchValues
    );

    /* ================= UPDATE users ================= */

    const userValues = [loginEmail?.trim() || oldEmail];
    let userPasswordSQL = "";

    if (passwordHash) {
      userPasswordSQL = ", password_hash=?";
      userValues.push(passwordHash);
    }

    userValues.push(oldEmail);

    await db.query(
      `
      UPDATE users
      SET email=? ${userPasswordSQL}
      WHERE email=?
      `,
      userValues
    );

    return Response.json(
      { message: "Branch updated successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("PATCH /api/branches/[id] error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}


/* ✅ Delete branch */
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const branchId = Number(id);

    if (!branchId) {
      return Response.json({ message: "Invalid branchId" }, { status: 400 });
    }

    await db.query(`DELETE FROM company_branches WHERE id=?`, [branchId]);

    return Response.json({ message: "Branch deleted" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/branches/[id] error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
