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
      sez_type
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
       sez_type || "NONE" 
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
          shipping_address=?, billing_address=?, login_email=? , sez_type=?  
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




export async function DELETE(req, { params }) {
  const connection = await db.getConnection();

  try {
    const { id } = await params;
    const branchId = Number(id);

    if (!branchId) {
      return Response.json({ message: "Invalid branchId" }, { status: 400 });
    }

    await connection.beginTransaction();

    /* 1️⃣ Delete invoice_items via proposals */
    await connection.query(
      `DELETE ii FROM invoice_items ii
       JOIN invoices i ON ii.invoice_id = i.id
       JOIN proposals p ON i.proposal_id = p.id
       WHERE p.branch_id = ?`,
      [branchId]
    );

    /* 2️⃣ Delete invoice_items where branch is buyer */
    await connection.query(
      `DELETE ii FROM invoice_items ii
       JOIN invoices i ON ii.invoice_id = i.id
       WHERE i.buyer_branch_id = ?`,
      [branchId]
    );

    /* 3️⃣ Delete invoices via proposals */
    await connection.query(
      `DELETE i FROM invoices i
       JOIN proposals p ON i.proposal_id = p.id
       WHERE p.branch_id = ?`,
      [branchId]
    );

    /* 4️⃣ Delete invoices where branch is buyer */
    await connection.query(
      `DELETE FROM invoices WHERE buyer_branch_id = ?`,
      [branchId]
    );

    /* 5️⃣ Delete proposals */
    await connection.query(
      `DELETE FROM proposals WHERE branch_id = ?`,
      [branchId]
    );

    /* 6️⃣ Delete company product pricing via company */
    await connection.query(
      `DELETE cpp FROM company_product_pricing cpp
       JOIN company_branches b ON cpp.company_id = b.company_id
       WHERE b.id = ?`,
      [branchId]
    );

    /* 7️⃣ Delete users login mapped to this branch */
    await connection.query(
      `DELETE u FROM users u
       JOIN company_branches b ON u.email = b.login_email
       WHERE b.id = ?`,
      [branchId]
    );

    /* 8️⃣ Delete branch (includes branch login fields) */
    const [result] = await connection.query(
      `DELETE FROM company_branches WHERE id = ?`,
      [branchId]
    );

    await connection.commit();

    if (result.affectedRows === 0) {
      return Response.json({ message: "Branch not found" }, { status: 404 });
    }

    return Response.json(
      { message: "Branch, user login, and all related data deleted successfully" },
      { status: 200 }
    );

  } catch (err) {
    await connection.rollback();
    console.error("DELETE /api/branches/[id] error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  } finally {
    connection.release();
  }
}
