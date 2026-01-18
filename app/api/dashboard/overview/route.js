import { NextResponse } from "next/server";
import { db } from "../../../db";

export async function GET() {
  try {
    const [activeClients] = await db.query(`SELECT COUNT(*) as count FROM companies`);
    const [openRFQs] = await db.query(`SELECT COUNT(*) as count FROM rfqs WHERE status='Submitted' OR status='Under Review'`);
    const [approvedProposals] = await db.query(`SELECT COUNT(*) as count FROM proposals WHERE status='Approved'`);
    const [activeProducts] = await db.query(`SELECT COUNT(*) as count FROM products WHERE status='Available'`);
    const [pendingRFQs] = await db.query(`SELECT COUNT(*) as count FROM rfqs WHERE status='Submitted'`);

    return NextResponse.json({
      activeClients: activeClients[0].count,
      openRFQs: openRFQs[0].count,
      approvedProposals: approvedProposals[0].count,
      activeProducts: activeProducts[0].count,
      pendingRFQs: pendingRFQs[0].count,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
