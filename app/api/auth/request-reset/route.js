import { db } from "../../../db";
import crypto from "crypto";
import { sendResetPasswordEmail } from "../../../../lib/mailer";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email?.trim()) {
      return Response.json({ message: "Email required" }, { status: 400 });
    }

    // ✅ check branch exists
    const [rows] = await db.query(
      `SELECT id, login_email FROM company_branches WHERE login_email = ? LIMIT 1`,
      [email.trim()]
    );

    if (rows.length === 0) {
      return Response.json({ message: "Email not registered" }, { status: 404 });
    }

    const branch = rows[0];

    // ✅ token
    const token = crypto.randomBytes(32).toString("hex");

    // ✅ expiry 15 min
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    await db.query(
      `UPDATE company_branches 
       SET reset_token = ?, reset_token_expiry = ? 
       WHERE id = ?`,
      [token, expiry, branch.id]
    );

    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

    await sendResetPasswordEmail(email.trim(), resetLink);

    return Response.json({ message: "Reset link sent to email" }, { status: 200 });
  } catch (err) {
    console.error("POST /api/auth/request-reset error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
