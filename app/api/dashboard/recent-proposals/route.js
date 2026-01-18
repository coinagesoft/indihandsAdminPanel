import { NextResponse } from "next/server";
import { db } from "../../../db";

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT p.id, p.proposal_number, p.grand_total, p.status, c.company_name
      FROM proposals p
      JOIN companies c ON p.company_id = c.id
      ORDER BY p.created_at DESC
      LIMIT 5
    `);

    const data = rows.map(r => ({
      clientName: r.company_name,
      proposalNumber: r.proposal_number,
      status: r.status,
      value: `₹${r.grand_total}L`
    }));

    return NextResponse.json(data);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
