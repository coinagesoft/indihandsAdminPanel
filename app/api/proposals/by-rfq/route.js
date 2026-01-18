import { db } from "../../../db";

export async function GET() {
  try {
    const now = new Date();

    const YYYY = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, "0");
    const DD = String(now.getDate()).padStart(2, "0");

    const HH = String(now.getHours()).padStart(2, "0");
    const MIN = String(now.getMinutes()).padStart(2, "0");
    const SS = String(now.getSeconds()).padStart(2, "0");

    // ✅ baseKey = YYYYMMDD-HHMMSS
    const baseKey = `${YYYY}${MM}${DD}-${HH}${MIN}${SS}`;

    // ✅ get latest proposal for same baseKey
    const [[row]] = await db.query(
      `
      SELECT proposal_number
      FROM proposals
      WHERE proposal_number LIKE ?
      ORDER BY id DESC
      LIMIT 1
      `,
      [`QTN-${baseKey}-%`]
    );

    let nextSeq = 1;

    if (row?.proposal_number) {
      // example: QTN-20260117-173045-003
      const match = row.proposal_number.match(/QTN-\d{8}-\d{6}-(\d+)/);

      if (match) {
        nextSeq = Number(match[1]) + 1;
      }
    }

    const nextNumber = `QTN-${baseKey}-${String(nextSeq).padStart(3, "0")}`;

    return Response.json({ nextNumber }, { status: 200 });
  } catch (err) {
    console.error("GET /api/proposals/next-number error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
