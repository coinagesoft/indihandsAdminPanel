import { db } from "../../../../db";



export async function GET(req, { params }) {

  try {

    const { id } = await params;

    const rfqId = Number(id);

    if (!rfqId) {

      return Response.json(
        {
          message: "Invalid rfqId",
        },
        {
          status: 400,
        }
      );
    }

    /* ================= HEADER ================= */

    const [headerRows] = await db.query(
      `
      SELECT

        r.id AS rfqId,

        r.rfq_type,

        r.company_id AS companyId,

        r.branch_id AS branchId,

        r.submitted_at AS submittedAt,

        r.status,

        r.notes,

        r.client_name,

        r.client_phone,

        r.client_email,

        r.billing_type,

        r.billing_address,

        r.shipping_address,

        COALESCE(
          p.company_name,
          c.company_name
        ) AS company,

        c.company_email AS companyEmail,

        cb.gstin,

        cb.sez_type,
        cb.billing_address AS branchBillingAddress,

        cb.shipping_address AS branchShippingAddress,

        cb.branch_name AS branchName,

        cb.contact_person AS customerName

      FROM rfqs r

      LEFT JOIN companies c
        ON c.id = r.company_id

      LEFT JOIN company_branches cb
        ON cb.id = r.branch_id

      LEFT JOIN proposals p
        ON p.rfq_id = r.id

      WHERE r.id = ?

      LIMIT 1
      `,
      [rfqId]
    );

    if (headerRows.length === 0) {

      return Response.json(
        {
          message: "RFQ not found",
        },
        {
          status: 404,
        }
      );
    }

    const header = headerRows[0];

    const isB2C =
      header.rfq_type === "B2C";

    const sezType =
      header.sez_type || "NONE";

    const proposalCompany =
      header.company || "";

    const hasProposalCompany =
      proposalCompany.includes("(");

    /* ================= GST LOGIC ================= */

    let senderStateCode = "";

    let clientStateCode = "";

    if (!isB2C && header.companyId) {

      const [[companyRow]] =
        await db.query(
          `
          SELECT gstin

          FROM company_branches

          WHERE company_id = ?

          ORDER BY id ASC

          LIMIT 1
          `,
          [header.companyId]
        );

      senderStateCode =
        companyRow?.gstin?.substring(0, 2) || "";

      clientStateCode =
        header.gstin?.substring(0, 2) || "";
    }

    const isInterState = isB2C
      ? false
      : senderStateCode !== clientStateCode;

    const isSEZ = isB2C
      ? false
      : sezType === "SEZ";

    /* ================= PROPOSAL ================= */

    const [[proposalRow]] =
      await db.query(
        `
        SELECT id

        FROM proposals

        WHERE rfq_id = ?

        LIMIT 1
        `,
        [rfqId]
      );

    let proposalData = null;

    if (proposalRow) {

      const [[p]] =
        await db.query(
          `
          SELECT

            billing_address,

            shipping_address

          FROM proposals

          WHERE id = ?
          `,
          [proposalRow.id]
        );

      proposalData = p;
    }

    let items = [];

    /* =====================================================
       CASE 1 : PROPOSAL EXISTS
    ===================================================== */

    if (proposalRow) {

      const [pItems] =
        await db.query(
          `
          SELECT

            pi.product_id AS productId,

            CASE

              WHEN r.rfq_type = 'B2B'
               AND cpp.prefix IS NOT NULL
               AND cpp.prefix != ''

              THEN CONCAT(
                cpp.prefix,
                ' | ',
                p.product_name
              )

              ELSE p.product_name

            END AS description,

            p.hsn,

            p.featured_image AS featuredImage,

            p.barcode,

            pi.quantity AS qty,

            pi.rate,

            p.base_price AS basePrice,

            pi.discount,

            pi.cgst_rate,

            pi.sgst_rate,

            pi.igst_rate

          FROM proposal_items pi

          JOIN products p
            ON p.id = pi.product_id

          JOIN proposals pr
            ON pr.id = pi.proposal_id

          JOIN rfqs r
            ON r.id = pr.rfq_id

          LEFT JOIN company_product_pricing cpp
            ON cpp.product_id = p.id
            AND cpp.company_id = r.company_id

          WHERE pi.proposal_id = ?

          ORDER BY pi.id ASC
          `,
          [proposalRow.id]
        );

      items = pItems.map((x) => {

        const qty =
          Number(x.qty || 1);

        const rate =
          Number(x.rate || 0);

        const basePrice =
          Number(x.basePrice || 0);

        const discountPercent =
          Number(x.discount || 0);

        const cgstRate =
          Number(x.cgst_rate ?? 0);

        const sgstRate =
          Number(x.sgst_rate ?? 0);

        const igstRate =
          Number(x.igst_rate ?? 0);

        return {

          productId:
            x.productId,

          description:
            x.description,

          hsn:
            x.hsn,

          featuredImage:
            x.featuredImage,

          barcode:
            x.barcode,

          uom: "No",

          qty,

          rate,

          basePrice,

          discount:
            Number(
              discountPercent.toFixed(2)
            ),

          cgst:
            isSEZ
              ? 0
              : isInterState
                ? 0
                : cgstRate,

          sgst:
            isSEZ
              ? 0
              : isInterState
                ? 0
                : sgstRate,

          igst:
            isSEZ
              ? igstRate
              : isInterState
                ? igstRate
                : 0,
        };
      });
    }

    /* =====================================================
       CASE 2 : RFQ ONLY
    ===================================================== */

    else {

      const [itemRows] =
        await db.query(
          `
          SELECT

            rp.product_id AS productId,

            CASE

              WHEN r.rfq_type = 'B2B'
               AND cpp.prefix IS NOT NULL
               AND cpp.prefix != ''

              THEN CONCAT(
                cpp.prefix,
                ' | ',
                p.product_name
              )

              ELSE p.product_name

            END AS description,

            p.hsn,

            rp.quantity AS qty,

            rp.quoted_price AS quotedPrice,

            CASE

              WHEN r.rfq_type = 'B2B'
                THEN cpp.custom_price

              WHEN r.rfq_type = 'B2C'
                THEN custp.custom_price

              ELSE NULL

            END AS customPrice,

            p.base_price AS basePrice,

            p.cgst_rate,

            p.sgst_rate,

            p.igst_rate

          FROM rfq_products rp

          JOIN products p
            ON p.id = rp.product_id

          JOIN rfqs r
            ON r.id = rp.rfq_id

          LEFT JOIN company_product_pricing cpp
            ON cpp.company_id = r.company_id
            AND cpp.product_id = rp.product_id

          LEFT JOIN customer_product_pricing custp
            ON custp.product_id = rp.product_id

          WHERE rp.rfq_id = ?

          ORDER BY rp.product_id ASC
          `,
          [rfqId]
        );

      items = itemRows.map((x) => {

        const qty =
          Number(x.qty || 1);

        const basePrice =
          Number(x.basePrice || 0);

        const rate =
          x.quotedPrice != null
            ? Number(x.quotedPrice)
            : x.customPrice != null
              ? Number(x.customPrice)
              : basePrice;

        const discountPerUnit =
          basePrice > rate
            ? basePrice - rate
            : 0;

        const discountPercent =
          basePrice > 0
            ? (
                discountPerUnit /
                basePrice
              ) * 100
            : 0;

        const cgstRate =
          Number(x.cgst_rate ?? 0);

        const sgstRate =
          Number(x.sgst_rate ?? 0);

        const igstRate =
          Number(x.igst_rate ?? 0);

        return {

          productId:
            x.productId,

          description:
            x.description,

          hsn:
            x.hsn,

          uom: "No",

          qty,

          rate,

          basePrice,

          discount:
            Number(
              discountPercent.toFixed(2)
            ),

          cgst:
            isSEZ
              ? 0
              : isInterState
                ? 0
                : cgstRate,

          sgst:
            isSEZ
              ? 0
              : isInterState
                ? 0
                : sgstRate,

          igst:
            isSEZ
              ? igstRate
              : isInterState
                ? igstRate
                : 0,
        };
      });
    }

    /* ================= RESPONSE ================= */

    const clientName =
      header.client_name || "";

    const companyName =
      header.company || "";

  const address =
  proposalData?.billing_address ||
  header.billing_address ||
  header.branchBillingAddress ||
  "";

const shippingAddress =
  proposalData?.shipping_address ||
  header.shipping_address ||
  header.branchShippingAddress ||
  "";

    const isSelf =
      header.billing_type === "Self";

    return Response.json(
      {
        header: {

          rfqId:
            header.rfqId,

          rfqType:
            header.rfq_type,

          companyId:
            header.companyId,

          branchId:
            header.branchId,

          customerName:

            isB2C

              ? clientName

              : isSelf

                ? `${clientName} (${companyName})`

                : (
                    header.customerName ||
                    companyName
                  ),

          clientName,

          clientPhone:
            header.client_phone || "",

          clientEmail:
            header.client_email || "",

          company:

            isB2C

              ? companyName

              : isSelf

                ? (
                    hasProposalCompany

                      ? proposalCompany

                      : (
                          clientName
                            ? `${clientName} (${proposalCompany})`
                            : proposalCompany
                        )
                  )

                : proposalCompany,

          gstin:

            isB2C
              ? ""
              : (header.gstin || ""),

          billing_address:
            address,

          shipping_address:
            shippingAddress,

          submittedAt:
            header.submittedAt,

          status:
            header.status,

          notes:
            header.notes || "",
        },

        items,
      },
      {
        status: 200,
      }
    );

  } catch (err) {

    console.error(
      "GET /api/rfqs/[rfqId]/details error:",
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