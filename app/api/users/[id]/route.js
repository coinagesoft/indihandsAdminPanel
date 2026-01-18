import { db } from "../../../db";

// ✅ Update user
export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const userId = Number(id);

    if (!userId) {
      return Response.json({ message: "Invalid userId" }, { status: 400 });
    }

    const body = await req.json();
    const { email, role, active } = body;

    // ✅ validate role ENUM
    if (role && !["Admin", "Client"].includes(role)) {
      return Response.json({ message: "Invalid role" }, { status: 400 });
    }

    await db.query(
      `UPDATE users SET email=?, role=?, active=? WHERE id=?`,
      [email?.trim(), role, active ? 1 : 0, userId]
    );

    return Response.json({ message: "User updated" }, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/users/[id] error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}

// ✅ Delete user
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const userId = Number(id);

    if (!userId) {
      return Response.json({ message: "Invalid userId" }, { status: 400 });
    }

    await db.query(`DELETE FROM users WHERE id=?`, [userId]);

    return Response.json({ message: "User deleted" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/users/[id] error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
