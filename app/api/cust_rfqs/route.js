import { db } from "../../db";

export async function GET() {

  try {

    /* ================= B2C RFQS ================= */

    const [rfqRows] = await db.query(`
      SELECT

        r.id,
        r.rfq_number,

        r.submitted_at AS submittedAt,

        r.status,
        r.notes,

        r.client_name,
        r.client_phone,
        r.client_email,

        r.billing_address,
        r.shipping_address,

        cust.id AS customerId

      FROM rfqs r

      LEFT JOIN customers cust
        ON cust.id = r.customer_id

      WHERE r.status != 'Draft'
        AND r.rfq_type = 'B2C'

      ORDER BY r.id DESC
    `);

    /* ================= PRODUCTS ================= */

    const [productRows] = await db.query(`
  SELECT

  rp.rfq_id AS rfqId,

  p.id AS productId,

  p.product_name AS name,

  p.barcode,
  p.hsn,

  rp.quoted_price,
  rp.quantity

FROM rfq_products rp

JOIN products p
  ON p.id = rp.product_id

ORDER BY rp.rfq_id DESC
    `);

    /* ================= RESPONSE ================= */

    const rfqs = rfqRows.map((r) => ({

      id: r.id,

      rfqNumber: r.rfq_number || "",

      submittedAt: r.submittedAt,

      status: r.status,
      notes: r.notes || "",

      customerId: r.customerId,

      customerName:
        r.customerName || "",

      clientName:
        r.client_name || "",

      clientPhone:
        r.client_phone || "",

      clientEmail:
        r.client_email || "",

      billingAddress:
        r.billing_address || "",

      shippingAddress:
        r.shipping_address || "",

      products: productRows

        .filter((p) => p.rfqId === r.id)

        .map((p) => ({

          id: p.productId,

          name: p.name,

          hsn: p.hsn,

          code: p.barcode,

          rate: p.quoted_price,

          quantity: p.quantity,

          totalAmount:
            p.quoted_price * p.quantity,
        })),
    }));

    return Response.json(
      { rfqs },
      { status: 200 }
    );

  } catch (err) {

    console.error(
      "GET /api/rfqs error:",
      err
    );

    return Response.json(
      {
        message:
          "Server error while loading RFQs",
      },
      {
        status: 500,
      }
    );
  }
}