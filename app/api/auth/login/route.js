// app/api/auth/login/route.js
import db from "../../../db";
import bcrypt from "bcryptjs";
import { generateToken } from "../../../../lib/auth"; // same token function

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email?.trim() || !password?.trim()) {
      return Response.json(
        { message: "Email & Password required" },
        { status: 400 }
      );
    }

    // ✅ Admin only (role must be Admin)
    const [users] = await db.query(
      "SELECT id, email, password_hash, role, active FROM users WHERE email = ? AND role = 'Admin' LIMIT 1",
      [email.trim()]
    );

    if (users.length === 0) {
      return Response.json({ message: "Invalid admin credentials" }, { status: 401 });
    }

    const user = users[0];

    if (!user.active) {
      return Response.json({ message: "Account inactive" }, { status: 403 });
    }

    const isValid = await bcrypt.compare(password, user.password_hash || "");
    if (!isValid) {
      return Response.json({ message: "Invalid admin credentials" }, { status: 401 });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return Response.json(
      {
        message: "Admin login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("POST /api/auth/login error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
