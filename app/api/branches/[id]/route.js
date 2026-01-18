import { db } from "../../../db";
import bcrypt from "bcryptjs";

/* ✅ Update branch */
export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const branchId = Number(id);

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
      password, // optional (change password)
    } = body;

    if (!branchId) {
      return Response.json({ message: "Invalid branchId" }, { status: 400 });
    }

    let passwordHashQuery = "";
    let values = [
      branchName?.trim() || "",
      JSON.stringify(phones),
      JSON.stringify(emails),
      gstin?.trim() || "",
      contactPerson || null,
      shippingAddress || null,
      billingAddress || null,
      loginEmail?.trim() || "",
    ];

    if (password?.trim()) {
      const passwordHash = await bcrypt.hash(password, 10);
      passwordHashQuery = `, password_hash=?`;
      values.push(passwordHash);
    }

    values.push(branchId);

    await db.query(
      `
      UPDATE company_branches 
      SET branch_name=?, phones=?, emails=?, gstin=?, contact_person=?, shipping_address=?, billing_address=?, login_email=?
      ${passwordHashQuery}
      WHERE id=?
      `,
      values
    );

    return Response.json({ message: "Branch updated" }, { status: 200 });
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
