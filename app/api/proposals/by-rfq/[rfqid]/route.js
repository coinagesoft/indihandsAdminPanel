import { db } from "../../../../db";

export async function GET(req, { params }) {
  try {
    const rfqId = Number(params.rfqid);

    const [[row]] = await db.query(
      `SELECT id, proposal_number FROM proposals WHERE rfq_id = ? LIMIT 1`,
      [rfqId]
    );

    if (!row) {
      return Response.json({ exists: false }, { status: 200 });
    }

    return Response.json(
      { exists: true, proposalId: row.id, proposal_number: row.proposal_number },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET proposal by rfq error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
