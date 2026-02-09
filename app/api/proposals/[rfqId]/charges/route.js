import { db } from "../../../../db";

export async function GET(req, { params }) {
  try {
    const {rfqId} = await params;; 

    if (!rfqId || Number.isNaN(rfqId)) {
      return Response.json(
        {
          success: false,
          error: "Invalid RFQ ID",
          code: "INVALID_RFQ_ID",
        },
        { status: 400 }
      );
    }

    // 1️⃣ Find proposal by RFQ
    const [[proposal]] = await db.query(
      `SELECT id FROM proposals WHERE rfq_id = ? LIMIT 1`,
      [rfqId]
    );

    if (!proposal) {
      return Response.json(
        {
          success: true,
          charges: [],
          message: "No proposal found for this RFQ",
        },
        { status: 200 }
      );
    }

    // 2️⃣ Fetch charges (NO tax_percent)
    const [charges] = await db.query(
      `
      SELECT
        id,
        label,
        amount,
         tax_percent AS taxPercent
      FROM proposal_charges
      WHERE proposal_id = ?
      ORDER BY id ASC
      `,
      [proposal.id]
    );

    return Response.json(
      {
        success: true,
        proposalId: proposal.id,
        charges,
      },
      { status: 200 }
    );

  } catch (err) {
    console.error("❌ GET /api/proposals/[id]/charges error:", err);

    return Response.json(
      {
        success: false,
        error: "Failed to fetch proposal charges",
        code: "FETCH_CHARGES_FAILED",
      },
      { status: 500 }
    );
  }
}
