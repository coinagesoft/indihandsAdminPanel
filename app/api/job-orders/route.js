import { db } from "../../db";

// export async function POST(req) {

//   try {

//     const body =
//       await req.json();

//     const {

//       rfqId,

//       proposalId,

//       deliveryDate,

//       companyName,

//       location,

//       deliveryInstructions,

//       clientNames,

//       preparedBy,

//       checkedBy,

//       approvedBy,

//       includeLogo

//     } = body;

//     /* CHECK EXISTING */

//     const [[existing]] =
//       await db.query(
//         `
//         SELECT id

//         FROM job_orders

//         WHERE rfq_id = ?
//         `,
//         [rfqId]
//       );

//     /* UPDATE */

//     if (existing) {

//       await db.query(
//         `
//         UPDATE job_orders

//         SET

//           proposal_id = ?,

//           delivery_date = ?,

//           company_name = ?,

//           location = ?,

//           delivery_instructions = ?,

//           client_names = ?,

//           prepared_by = ?,

//           checked_by = ?,

//           approved_by = ?,

//           include_logo = ?

//         WHERE rfq_id = ?
//         `,
//         [

//           proposalId,

//           deliveryDate,

//           companyName,

//           location,

//           deliveryInstructions,

//           JSON.stringify(clientNames),

//           preparedBy,

//           checkedBy,

//           approvedBy,

//           includeLogo,

//           rfqId
//         ]
//       );

//       return Response.json({

//         success: true,

//         type: "updated"
//       });
//     }

//     /* INSERT */

//     await db.query(
//       `
//       INSERT INTO job_orders (

//         rfq_id,

//         proposal_id,

//         delivery_date,

//         company_name,

//         location,

//         delivery_instructions,

//         client_names,

//         prepared_by,

//         checked_by,

//         approved_by,

//         include_logo

//       )

//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//       `,
//       [

//         rfqId,

//         proposalId,

//         deliveryDate,

//         companyName,

//         location,

//         deliveryInstructions,

//         JSON.stringify(clientNames),

//         preparedBy,

//         checkedBy,

//         approvedBy,

//         includeLogo
//       ]
//     );

//     return Response.json({

//       success: true,

//       type: "created"
//     });

//   } catch (err) {

//     console.error(err);

//     return Response.json(
//       {
//         message: err.message
//       },
//       {
//         status: 500
//       }
//     );
//   }
// }


export async function POST(req) {
  try {
    const body = await req.json();

    const {
      rfqId,
      proposalId,
      deliveryDate,
      companyName,
      location,
      deliveryInstructions,
      clientNames,
      preparedBy,
      checkedBy,
      approvedBy,
      includeLogo,
    } = body;

    // ✅ Normalize: treat empty string / undefined / null as NULL in DB
    // This prevents MySQL storing zero-dates like 1899-11-30 or 0000-00-00
    const safeDeliveryDate =
      deliveryDate && String(deliveryDate).trim() !== ""
        ? deliveryDate
        : null;

    /* CHECK EXISTING */
    const [[existing]] = await db.query(
      `SELECT id FROM job_orders WHERE rfq_id = ?`,
      [rfqId]
    );

    /* UPDATE */
    if (existing) {
      await db.query(
        `
        UPDATE job_orders
        SET
          proposal_id           = ?,
          delivery_date         = ?,
          company_name          = ?,
          location              = ?,
          delivery_instructions = ?,
          client_names          = ?,
          prepared_by           = ?,
          checked_by            = ?,
          approved_by           = ?,
          include_logo          = ?
        WHERE rfq_id = ?
        `,
        [
          proposalId,
          safeDeliveryDate,   // ← null when not provided
          companyName,
          location,
          deliveryInstructions,
          JSON.stringify(clientNames),
          preparedBy,
          checkedBy,
          approvedBy,
          includeLogo,
          rfqId,
        ]
      );

      return Response.json({ success: true, type: "updated" });
    }

    /* INSERT */
    await db.query(
      `
      INSERT INTO job_orders (
        rfq_id,
        proposal_id,
        delivery_date,
        company_name,
        location,
        delivery_instructions,
        client_names,
        prepared_by,
        checked_by,
        approved_by,
        include_logo
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        rfqId,
        proposalId,
        safeDeliveryDate,   // ← null when not provided
        companyName,
        location,
        deliveryInstructions,
        JSON.stringify(clientNames),
        preparedBy,
        checkedBy,
        approvedBy,
        includeLogo,
      ]
    );

    return Response.json({ success: true, type: "created" });

  } catch (err) {
    console.error(err);
    return Response.json({ message: err.message }, { status: 500 });
  }
}