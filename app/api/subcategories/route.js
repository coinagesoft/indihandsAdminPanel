import { db } from "../../db";


export async function POST(req) {
  try {
    const body = await req.json();
    const { categoryId, name } = body;

    if (!categoryId) {
      return Response.json({ message: "categoryId required" }, { status: 400 });
    }

    if (!name?.trim()) {
      return Response.json({ message: "Subcategory name required" }, { status: 400 });
    }

    await db.query(
      `INSERT INTO subcategories (category_id, name)
       VALUES (?, ?)`,
      [categoryId, name.trim()]
    );

    return Response.json({ message: "Subcategory created" }, { status: 201 });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return Response.json(
        { message: "Subcategory already exists in this category" },
        { status: 409 }
      );
    }

    console.error("POST /api/subcategories error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return Response.json({ message: "Subcategory id required" }, { status: 400 });
    }

    await db.query(`DELETE FROM subcategories WHERE id = ?`, [id]);

    return Response.json({ message: "Subcategory deleted" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/subcategories error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
