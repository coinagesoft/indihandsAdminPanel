
import { NextResponse } from "next/server";
import db from "../../../../db"; // adjust path to your DB helper

// ─────────────────────────────────────────────
// GET /api/delivery-label/[proposalId]
// ─────────────────────────────────────────────
export async function GET(req, { params }) {
  const { proposalId } = await params;

  try {
    // 1. Fetch proposal (shipping address)
    const [proposals] = await db.query(
      `SELECT shipping_address, billing_address, company_name FROM proposals WHERE id = ?`,
      [proposalId]
    );

    if (!proposals.length) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    const proposal = proposals[0];

    const [rfqs] = await db.query(
      `SELECT client_name, client_phone
       FROM rfqs
       WHERE branch_id IN (
         SELECT branch_id FROM proposals WHERE id = ?
       )
       ORDER BY submitted_at DESC
       LIMIT 1`,
      [proposalId]
    );

    const rfq = rfqs[0] || {};

    // 3. Check if a saved label already exists
    const [saved] = await db.query(
      `SELECT * FROM delivery_labels WHERE proposal_id = ? ORDER BY updated_at DESC LIMIT 1`,
      [proposalId]
    );

    if (saved.length) {
      // Return saved label (user already edited it before)
      return NextResponse.json({ ...saved[0], source: "saved" });
    }

    // 4. Return prefilled defaults
    return NextResponse.json({
      proposal_id:      Number(proposalId),
      attn_name:        rfq.client_name   || "",
      contact_no:       rfq.client_phone  || "",
      to_address:       proposal.shipping_address || "",
      from_name:        "MTDS",
      from_address:     "303, Meghana Apartment, D.S.K. Ranawara,\nN.D.A. – Pashan Road, Bavdhan,\nPune 411021",
      from_contact:     "9822513937 / 9026311152",
      handle_with_care: true,
      source:           "prefilled"
    });

  } catch (err) {
    console.error("GET /api/delivery-label error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ─────────────────────────────────────────────
// POST /api/delivery-label/[proposalId]
// ─────────────────────────────────────────────
export async function POST(req, { params }) {
  const { proposalId } =await params;
  const body = await req.json();

  const {
    attn_name,
    contact_no,
    to_address,
    from_name,
    from_address,
    from_contact,
    handle_with_care
  } = body;

  try {
    // Upsert — update if exists, insert if not
    const [existing] = await db.query(
      `SELECT id FROM delivery_labels WHERE proposal_id = ?`,
      [proposalId]
    );

    if (existing.length) {
      await db.query(
        `UPDATE delivery_labels
         SET attn_name=?, contact_no=?, to_address=?,
             from_name=?, from_address=?, from_contact=?,
             handle_with_care=?, updated_at=NOW()
         WHERE proposal_id=?`,
        [attn_name, contact_no, to_address, from_name, from_address, from_contact, handle_with_care ? 1 : 0, proposalId]
      );
    } else {
      await db.query(
        `INSERT INTO delivery_labels
           (proposal_id, attn_name, contact_no, to_address,
            from_name, from_address, from_contact, handle_with_care)
         VALUES (?,?,?,?,?,?,?,?)`,
        [proposalId, attn_name, contact_no, to_address, from_name, from_address, from_contact, handle_with_care ? 1 : 0]
      );
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("POST /api/delivery-label error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}