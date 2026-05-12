import { db } from "../../../../db";

export async function PATCH(req, { params }) {

  const connection = await db.getConnection();

  try {

    const { id } = await params;
    const rfqId = Number(id);

    const body = await req.json();

    const {
      client_name,
      client_phone,
      client_email,
      products
    } = body;

    await connection.beginTransaction();

    /* ================= GET RFQ ================= */

    const [[rfq]] = await connection.query(
      `
      SELECT status
      FROM rfqs
      WHERE id = ?
      FOR UPDATE
      `,
      [rfqId]
    );

    if (!rfq) {
      throw new Error("RFQ not found");
    }

    /* ================= RESTORE OLD STOCK ================= */

    if (rfq.status === "Accepted") {

      const [oldItems] = await connection.query(
        `
        SELECT product_id, quantity
        FROM rfq_products
        WHERE rfq_id = ?
        `,
        [rfqId]
      );

      for (const item of oldItems) {

        await connection.query(
          `
          UPDATE products
          SET stock_qty = stock_qty + ?
          WHERE id = ?
          `,
          [item.quantity, item.product_id]
        );
      }
    }

    /* ================= UPDATE CLIENT INFO ================= */

    await connection.query(
      `
      UPDATE rfqs
      SET
        client_name = ?,
        client_phone = ?,
        client_email = ?
      WHERE id = ?
      `,
      [
        client_name,
        client_phone,
        client_email,
        rfqId
      ]
    );

    /* ================= DELETE OLD PRODUCTS ================= */

    await connection.query(
      `
      DELETE FROM rfq_products
      WHERE rfq_id = ?
      `,
      [rfqId]
    );

    /* ================= INSERT NEW PRODUCTS ================= */

    for (const item of products) {

      /* CHECK STOCK */

      const [[product]] = await connection.query(
        `
        SELECT stock_qty
        FROM products
        WHERE id = ?
        FOR UPDATE
        `,
        [item.product_id]
      );

      if (!product) {
        throw new Error("Product not found");
      }

      if (
        rfq.status === "Accepted" &&
        product.stock_qty < item.quantity
      ) {
        throw new Error(
          `Insufficient stock for product ${item.product_id}`
        );
      }

      /* INSERT */

      await connection.query(
        `
        INSERT INTO rfq_products
        (
          rfq_id,
          product_id,
          quantity,
          quoted_price
        )
        VALUES (?, ?, ?, ?)
        `,
        [
          rfqId,
          item.product_id,
          item.quantity,
          item.quoted_price
        ]
      );

      /* REDUCE STOCK AGAIN */

      if (rfq.status === "Accepted") {

        await connection.query(
          `
          UPDATE products
          SET stock_qty = stock_qty - ?
          WHERE id = ?
          `,
          [item.quantity, item.product_id]
        );
      }
    }

    /* ================= SYNC PROPOSAL ITEMS IF EXISTS ================= */

const [[existingProposal]] = await connection.query(
  `SELECT id FROM proposals WHERE rfq_id = ? LIMIT 1`,
  [rfqId]
);

if (existingProposal) {

  // delete old proposal items
  await connection.query(
    `DELETE FROM proposal_items WHERE proposal_id = ?`,
    [existingProposal.id]
  );

  // re-insert from updated products
  for (const item of products) {

    const [[prod]] = await connection.query(
      `SELECT cgst_rate, sgst_rate, igst_rate, base_price FROM products WHERE id = ?`,
      [item.product_id]
    );

    if (!prod) continue;

    const rate = item.quoted_price ?? prod.base_price;

    const basePrice = Number(prod.base_price || 0);

    const discountPercent = basePrice > rate
      ? ((basePrice - rate) / basePrice) * 100
      : 0;

    await connection.query(
      `INSERT INTO proposal_items
        (proposal_id, product_id, quantity, rate, discount, cgst_rate, sgst_rate, igst_rate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        existingProposal.id,
        item.product_id,
        item.quantity,
        rate,
        Number(discountPercent.toFixed(2)),
        prod.cgst_rate,
        prod.sgst_rate,
        prod.igst_rate
      ]
    );
  }
}

    await connection.commit();

    return Response.json({
      message: "RFQ updated successfully"
    });

  } catch (err) {

    await connection.rollback();

    return Response.json(
      {
        message: err.message
      },
      {
        status: 500
      }
    );

  } finally {

    connection.release();
  }
}