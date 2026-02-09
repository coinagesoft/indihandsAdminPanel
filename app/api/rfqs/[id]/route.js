import { db } from "../../../db";

export async function PATCH(req, { params }) {
  const connection = await db.getConnection();

  try {
    const { id } = await params;
    const rfqId = Number(id);

    if (!rfqId) {
      return Response.json({ message: "Invalid RFQ id" }, { status: 400 });
    }

    const { status } = await req.json();

    const allowed = ["Submitted", "Under Review", "Accepted", "Rejected"];
    if (!allowed.includes(status)) {
      return Response.json({ message: "Invalid status" }, { status: 400 });
    }

    await connection.beginTransaction();

    /* 1️⃣ Fetch current RFQ status */
    const [[rfq]] = await connection.query(
      `SELECT status FROM rfqs WHERE id = ? FOR UPDATE`,
      [rfqId]
    );

    if (!rfq) {
      await connection.rollback();
      return Response.json({ message: "RFQ not found" }, { status: 404 });
    }

    const prevStatus = rfq.status;

    /* 2️⃣ Reduce stock ONLY if moving to Accepted */
    if (prevStatus !== "Accepted" && status === "Accepted") {
      const [items] = await connection.query(
        `
        SELECT product_id, quantity
        FROM rfq_products
        WHERE rfq_id = ?
        `,
        [rfqId]
      );

      for (const item of items) {
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
          throw new Error(`Product ${item.product_id} not found`);
        }

        if (product.stock_qty < item.quantity) {
          throw new Error(
            `Insufficient stock for product ID ${item.product_id}`
          );
        }

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

    /* 3️⃣ Update RFQ status */
    await connection.query(
      `UPDATE rfqs SET status = ? WHERE id = ?`,
      [status, rfqId]
    );

    await connection.commit();

    return Response.json(
      { message: "RFQ status updated successfully" },
      { status: 200 }
    );

  } catch (err) {
    await connection.rollback();
    console.error("PATCH /api/rfqs/[id] error:", err);

    return Response.json(
      { message: err.message || "Server error" },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
