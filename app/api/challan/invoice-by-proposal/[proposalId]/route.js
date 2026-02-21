import { db } from "../../../../db";
export async function GET(req, { params }) {
  const { proposalId } =await  params;

  const [[row]] = await db.query(
    "SELECT * FROM invoices WHERE proposal_id=? ORDER BY id DESC LIMIT 1",
    [proposalId]
  );

  return Response.json(row || {});
}