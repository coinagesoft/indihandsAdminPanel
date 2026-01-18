import { db } from '../../../db';
import bcrypt from 'bcrypt';
import { generateToken } from '@/lib/auth';


export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email?.trim() || !password?.trim()) {
      return Response.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email.trim()]
    );

    if (existing.length > 0) {
      return Response.json({ message: "User already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ role must be Admin or Client
    const [result] = await db.query(
      "INSERT INTO users (email, password_hash, role, active) VALUES (?, ?, 'Admin', 1)",
      [email.trim(), hashedPassword]
    );

    const user = { id: result.insertId, email: email.trim(), role: "Admin" };
    const token = generateToken(user);

    return Response.json({ message: "Signup successful", token, user }, { status: 201 });
  } catch (error) {
    console.error("SIGNUP ERROR 👉", error);
    return Response.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
