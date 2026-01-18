export const runtime = "nodejs";

import { db } from "../../db";

export async function GET() {
  try {
    const [rows] = await db.query(
      `SELECT id, name, description, featured_image 
       FROM catalogs 
       ORDER BY id DESC`
    );

    return Response.json({ catalogs: rows }, { status: 200 });
  } catch (err) {
    console.error("GET /api/catalogs error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const { name, description = null, featured_image = null } = data;

    if (!name?.trim()) {
      return Response.json({ message: "Catalog name required" }, { status: 400 });
    }

    const [result] = await db.query(
      `INSERT INTO catalogs (name, description, featured_image)
       VALUES (?, ?, ?)`,
      [name.trim(), description, featured_image]
    );

    return Response.json(
      { message: "Catalog created", catalogId: result.insertId },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/catalogs error:", err);
    return Response.json(
      { message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}
