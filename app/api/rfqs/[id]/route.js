import { db } from "../../../db";

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;         // ✅ Next.js 15 fix
    const Id = Number(id);

    if (!Id) {
      return Response.json({ message: "Invalid rfq id" }, { status: 400 });
    }

    const body = await req.json();
    const { status } = body;

    const allowed = ["Submitted", "Under Review", "Accepted", "Rejected"];
    if (!allowed.includes(status)) {
      return Response.json({ message: "Invalid status" }, { status: 400 });
    }

    await db.query(`UPDATE rfqs SET status = ? WHERE id = ?`, [status, Id]);

    return Response.json({ message: "Status updated" }, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/rfqs/[Id] error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
