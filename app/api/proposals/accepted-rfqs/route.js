import { db } from "../../../db";

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        r.id,
        r.company_id AS companyId,
         r.rfq_number, 
        r.branch_id AS branchId,
        c.company_name AS company,
        cb.gstin,
        cb.branch_name AS branchName,
        cb.contact_person AS customerName,
        p.place AS place,
        p.id AS proposalId,          -- ⭐ ADD
        p.proposal_number AS proposalNumber
      FROM rfqs r
      JOIN companies c ON c.id = r.company_id
      JOIN company_branches cb ON cb.id = r.branch_id
      LEFT JOIN proposals p ON p.rfq_id = r.id
      WHERE r.status = 'Accepted'
      ORDER BY r.id DESC
    `);

    const rfqs = rows.map((x) => ({
      id: x.id,
      companyId: x.companyId,
        rfqNumber: x.rfq_number || "", 
      branchId: x.branchId,
      customerName: x.customerName || x.company,
      company: x.company,
      gstin: x.gstin || "",
      place: x.place || "",
      proposalId: x.proposalId || null,   // ⭐ ADD
      proposalNumber: x.proposalNumber || "",
      branchName: x.branchName,
    }));

    return Response.json({ rfqs }, { status: 200 });
  } catch (err) {
    console.error("GET /api/proposals/accepted-rfqs error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}