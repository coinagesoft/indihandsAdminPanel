import { db } from "../../db";


export async function GET() {
  try {
    const [categories] = await db.query(`
      SELECT id, name
      FROM categories
      ORDER BY id DESC
    `);

    const [subs] = await db.query(`
      SELECT id, category_id, name
      FROM subcategories
      ORDER BY id DESC
    `);

    const formatted = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      subcategories: subs
        .filter((s) => s.category_id === cat.id)
        .map((s) => ({
          id: s.id,
          name: s.name,
        })),
    }));

    return Response.json({ categories: formatted }, { status: 200 });
  } catch (err) {
    console.error("GET /api/categories error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}


export async function POST(req) {
  try {
    const body = await req.json();
    const { name } = body;

    if (!name?.trim()) {
      return Response.json({ message: "Category name required" }, { status: 400 });
    }

    await db.query(
      `INSERT INTO categories (name) VALUES (?)`,
      [name.trim()]
    );

    return Response.json({ message: "Category created" }, { status: 201 });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return Response.json({ message: "Category already exists" }, { status: 409 });
    }

    console.error("POST /api/categories error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}


/* ✅ DELETE category */
export async function DELETE(req) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return Response.json({ message: "Category id required" }, { status: 400 });
    }

    // ✅ because ON DELETE CASCADE will delete subcategories automatically
    await db.query(`DELETE FROM categories WHERE id = ?`, [id]);

    return Response.json({ message: "Category deleted" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/categories error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}

