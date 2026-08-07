

import { NextResponse } from "next/server";
import { db } from "../../db";

export async function GET() {
  try {

    const [rows] = await db.query(`
      SELECT
        f.id,

        f.feedback_source,
        f.client_type,

        f.rating,
        f.comments,

        f.submitted_at,
        f.created_at,

        p.proposal_number,

        i.invoice_number,

        c.company_name,

        cb.branch_name,

        r.client_name,

        cust.username AS customer_name,

        CASE
          WHEN f.client_type = 'B2B'
            THEN r.client_name
          WHEN f.client_type = 'B2C'
            THEN cust.username
        END AS client_name

      FROM feedbacks f

      LEFT JOIN proposals p
        ON p.id = f.proposal_id

      LEFT JOIN rfqs r
        ON r.id = p.rfq_id

      LEFT JOIN invoices i
        ON i.id = f.invoice_id

      LEFT JOIN companies c
        ON c.id = f.buyer_company_id

      LEFT JOIN company_branches cb
        ON cb.id = f.buyer_branch_id

      LEFT JOIN customers cust
        ON cust.id = f.customer_id

      ORDER BY f.created_at DESC
    `);

    return NextResponse.json(rows);

  } catch (error) {

    console.error("Feedback API Error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch feedback."
      },
      {
        status: 500
      }
    );

  }
}


export async function POST(req) {
  try {

    const {
      token,
      rating,
      comments
    } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: "Invalid feedback link." },
        { status: 400 }
      );
    }

    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: "Invalid rating." },
        { status: 400 }
      );
    }

    // Validate token
    const [[feedback]] = await db.query(
      `
      SELECT
        id,
        submitted_at
      FROM feedbacks
      WHERE feedback_token = ?
      LIMIT 1
      `,
      [token]
    );

    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback link not found." },
        { status: 404 }
      );
    }

    if (feedback.submitted_at) {
      return NextResponse.json(
        { error: "Feedback already submitted." },
        { status: 400 }
      );
    }

    // Update feedback
    await db.query(
      `
      UPDATE feedbacks
      SET
        rating = ?,
        comments = ?,
        submitted_at = NOW(),
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        rating || null,
        comments || null,
        feedback.id
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Thank you for your feedback."
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Server error." },
      { status: 500 }
    );

  }
}