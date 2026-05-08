import { db } from "../../../db";

export async function GET() {

  try {

    const [rows] = await db.query(`
      SELECT

        r.id,

        r.company_id AS companyId,

        r.branch_id AS branchId,

        r.customer_id AS customerId,

        r.rfq_number,

        r.rfq_type,

        r.client_name,
        r.client_phone,
        r.client_email,

        c.company_name AS company,

        cb.gstin,

        cb.branch_name AS branchName,

        cb.contact_person AS branchCustomerName,

        p.place AS place,

        p.id AS proposalId,

        p.proposal_number AS proposalNumber,

        p.status AS proposalStatus

      FROM rfqs r

      LEFT JOIN companies c
        ON c.id = r.company_id

      LEFT JOIN company_branches cb
        ON cb.id = r.branch_id

      LEFT JOIN proposals p
        ON p.rfq_id = r.id

      WHERE r.status = 'Accepted'

      ORDER BY r.id DESC
    `);

    const rfqs = rows.map((x) => {

      const isB2C =
        x.rfq_type === "B2C";

      return {

        id: x.id,

        companyId:
          x.companyId,

        branchId:
          x.branchId,

        customerId:
          x.customerId,

        rfqType:
          x.rfq_type,

        rfqNumber:
          x.rfq_number || "",

        /* ================= CUSTOMER ================= */

        customerName: isB2C
          ? x.client_name || "Customer"
          : (
              x.branchCustomerName ||
              x.company ||
              ""
            ),

        clientName:
          x.client_name || "",

        clientPhone:
          x.client_phone || "",

        clientEmail:
          x.client_email || "",

        /* ================= COMPANY ================= */

        company:
          x.company || "",

        branchName:
          x.branchName || "",

        gstin: isB2C
          ? ""
          : (x.gstin || ""),

        /* ================= PROPOSAL ================= */

        place:
          x.place || "",

        proposalId:
          x.proposalId || null,

        proposalNumber:
          x.proposalNumber || "",

        proposalStatus:
          x.proposalStatus || "Pending",
      };
    });

    return Response.json(
      { rfqs },
      { status: 200 }
    );

  } catch (err) {

    console.error(
      "GET /api/proposals/accepted-rfqs error:",
      err
    );

    return Response.json(
      {
        message: "Server error",
      },
      {
        status: 500,
      }
    );
  }
}