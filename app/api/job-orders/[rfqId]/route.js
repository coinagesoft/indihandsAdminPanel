import { db } from "../../../db";

export async function GET(req, { params }) {

  try {

    const { rfqId } =
      await params;

    const [[jobOrder]] =
      await db.query(
        `
        SELECT *

        FROM job_orders

        WHERE rfq_id = ?
        `,
        [rfqId]
      );

    if (!jobOrder) {

      return Response.json({
        success: false
      });
    }

    return Response.json({

      success: true,

      jobOrder: {

        ...jobOrder,

        clientNames:
          jobOrder.client_names
            ? JSON.parse(
                jobOrder.client_names
              )
            : []
      }
    });

  } catch (err) {

    console.error(err);

    return Response.json(
      {
        message: "Server error"
      },
      {
        status: 500
      }
    );
  }
}