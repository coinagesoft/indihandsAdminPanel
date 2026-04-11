import { db } from "../../../db";

// export async function POST(req, { params }) {
//   try {
//     // ✅ params is Promise in Next.js 15 → await it
//     const { companyId } = await params;
//     const companyIdNum = Number(companyId);

//     if (!companyIdNum) {
//       return Response.json({ message: "Invalid companyId" }, { status: 400 });
//     }

//     const body = await req.json();
//     const { pricing = [] } = body;

//     if (!Array.isArray(pricing) || pricing.length === 0) {
//       return Response.json({ message: "Pricing array required" }, { status: 400 });
//     }

//   for (const p of pricing) {
//   const productId = Number(p.productId);

//   // 🔴 REMOVE custom price
//   if (p.price === null) {
//     await db.query(
//       `
//       DELETE FROM company_product_pricing
//       WHERE company_id = ? AND product_id = ?
//       `,
//       [companyIdNum, productId]
//     );
//     continue;
//   }

//   const price = Number(p.price);
//   if (isNaN(price)) continue;

//   // ✅ ADD / UPDATE custom price
//   await db.query(
//     `
//     INSERT INTO company_product_pricing (company_id, product_id, custom_price)
//     VALUES (?, ?, ?)
//     ON DUPLICATE KEY UPDATE
//       custom_price = ?,
//       updated_at = CURRENT_TIMESTAMP
//     `,
//     [companyIdNum, productId, price, price]
//   );
// }


//     return Response.json({ message: "Pricing saved successfully" }, { status: 200 });
//   } catch (err) {
//     console.error("POST /api/org-pricing/[companyId] error:", err);
//     return Response.json({ message: "Server error" }, { status: 500 });
//   }
// }



export async function POST(req, { params }) {
  try {
    const { companyId } = await params;
    const companyIdNum = Number(companyId);

    if (!companyIdNum) {
      return Response.json({ message: "Invalid companyId" }, { status: 400 });
    }

    const body = await req.json();
    const { pricing = [] } = body;

    if (!Array.isArray(pricing) || pricing.length === 0) {
      return Response.json({ message: "Pricing array required" }, { status: 400 });
    }

    for (const p of pricing) {
      const productId = Number(p.productId);
      if (!productId) continue;

     let price = null;

if (p.price !== "" && p.price !== null && p.price !== undefined) {
  const parsed = Number(p.price);

  if (!isNaN(parsed)) {
    price = parsed;
  }
}
   const prefix = p.prefix?.trim() || null;

// ✅ अगर prefix आहे पण price empty आहे
if (prefix && (p.price === "" || p.price === null || p.price === undefined)) {
  price = null;
}

      // ✅ DELETE only if BOTH null
      if (price === null && prefix === null) {
        await db.query(
          `
          DELETE FROM company_product_pricing
          WHERE company_id = ? AND product_id = ?
          `,
          [companyIdNum, productId]
        );
        continue;
      }

      // ✅ INSERT / UPDATE
      await db.query(
        `
        INSERT INTO company_product_pricing 
          (company_id, product_id, custom_price, prefix)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          custom_price = VALUES(custom_price),
          prefix = VALUES(prefix),
          updated_at = CURRENT_TIMESTAMP
        `,
        [companyIdNum, productId, price, prefix]
      );
    }

    return Response.json(
      { message: "Pricing & prefix saved successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("POST /api/org-pricing/[companyId] error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
