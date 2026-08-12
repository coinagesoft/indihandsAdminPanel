import { runFeedbackCron } from "../../../../cron/feedbackCron.js";

export async function GET(request) {
  try {
    // Get Authorization header
    const authHeader = request.headers.get("authorization");

    // Check cron secret
    if (
      authHeader !==
      `Bearer ${process.env.CRON_SECRET}`
    ) {
      console.error("❌ Unauthorized feedback cron request");

      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    console.log("==================================");
    console.log("✅ FEEDBACK CRON API CALLED");
    console.log(new Date().toLocaleString());
    console.log("==================================");

    // Run your actual feedback cron logic
    const result = await runFeedbackCron();

    console.log("✅ Feedback cron completed");

    return Response.json(
      {
        success: true,
        message: "Feedback cron executed successfully",
        ...result,
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    console.error("❌ Feedback cron API error:");
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Feedback cron failed",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}