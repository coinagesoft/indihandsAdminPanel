import { db } from "../../../db";
import bcrypt from "bcryptjs";


export async function POST(req) {
  try {
    const body = await req.json();
    const { token, password } = body;

    if (!token?.trim()) {
      return Response.json({ message: "Token required" }, { status: 400 });
    }

    if (!password?.trim() || password.length < 6) {
      return Response.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // ✅ find token
    const [rows] = await db.query(
      `SELECT id, reset_token_expiry 
       FROM company_branches 
       WHERE reset_token = ? LIMIT 1`,
      [token.trim()]
    );

    if (rows.length === 0) {
      return Response.json({ message: "Invalid token" }, { status: 400 });
    }

    const branch = rows[0];

    // ✅ expiry check
    if (!branch.reset_token_expiry || new Date(branch.reset_token_expiry) < new Date()) {
      return Response.json({ message: "Token expired" }, { status: 400 });
    }

    // ✅ hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // ✅ update password + remove token
    await db.query(
      `UPDATE company_branches
       SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL
       WHERE id = ?`,
      [passwordHash, branch.id]
    );

    return Response.json({ message: "Password reset successful" }, { status: 200 });
  } catch (err) {
    console.error("POST /api/auth/reset-password error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
