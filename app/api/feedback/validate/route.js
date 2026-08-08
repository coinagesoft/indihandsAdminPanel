import { db } from "../../../db.js";

export async function submitInvoiceFeedback(req, res) {
  try {
    const { token, rating, comments } = req.body;

    console.log("==================================");
    console.log("SUBMIT INVOICE FEEDBACK");
    console.log("Token  :", token);
    console.log("Rating :", rating);
    console.log("==================================");

    // -----------------------------
    // Validate token
    // -----------------------------
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Feedback token is required.",
      });
    }

    // -----------------------------
    // Validate rating
    // -----------------------------
    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5.",
      });
    }

    // -----------------------------
    // Find feedback
    // -----------------------------
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
      return res.status(404).json({
        success: false,
        message: "Invalid or expired feedback link.",
      });
    }

    console.log("Feedback:", feedback);

    // -----------------------------
    // Prevent duplicate submission
    // -----------------------------
    if (feedback.submitted_at) {
      return res.status(409).json({
        success: false,
        message: "Feedback has already been submitted.",
      });
    }

    // -----------------------------
    // Save feedback
    // -----------------------------
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

    return res.status(200).json({
      success: true,
      message: "Thank you! Your feedback has been submitted successfully.",
    });

  } catch (error) {
    console.error("submitInvoiceFeedback Error:");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit feedback.",
    });
  }
}