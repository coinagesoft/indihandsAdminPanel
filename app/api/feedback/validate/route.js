import { db } from "../../../db.js";

export async function POST(request) {
  try {
    const { token, rating, comments } = await request.json();

    console.log("==================================");
    console.log("SUBMIT INVOICE FEEDBACK");
    console.log("Token  :", token);
    console.log("Rating :", rating);
    console.log("==================================");

    // Validate token
    if (!token) {
      return Response.json(
        {
          success: false,
          message: "Feedback token is required.",
        },
        { status: 400 }
      );
    }

    // Validate rating
    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return Response.json(
        {
          success: false,
          message: "Rating must be between 1 and 5.",
        },
        { status: 400 }
      );
    }

    // Find feedback
    const [[feedback]] = await db.query(
      `
      SELECT
        id,
        invoice_id,
        feedback_token,
        rating,
        submitted_at
      FROM feedbacks
      WHERE feedback_token = ?
      LIMIT 1
      `,
      [token]
    );

    if (!feedback) {
      return Response.json(
        {
          success: false,
          message: "Invalid or expired feedback link.",
        },
        { status: 404 }
      );
    }

    console.log("Feedback:", feedback);

    // Prevent duplicate submission
    if (feedback.submitted_at) {
      return Response.json(
        {
          success: false,
          message: "Feedback has already been submitted.",
        },
        { status: 409 }
      );
    }

    // Save feedback
    await db.query(
      `
      UPDATE feedbacks
      SET
        rating = ?,
        comments = ?,
        submitted_at = NOW()
      WHERE id = ?
      `,
      [
        numericRating,
        comments ? comments.trim() : null,
        feedback.id,
      ]
    );

    console.log(
      `Feedback submitted successfully for feedback ID ${feedback.id}`
    );

    return Response.json(
      {
        success: true,
        message: "Thank you! Your feedback has been submitted successfully.",
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("submitInvoiceFeedback Error:");
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Failed to submit feedback.",
      },
      { status: 500 }
    );
  }
}