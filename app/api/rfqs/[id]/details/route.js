import { db } from "../../../../db";

export async function GET(req, { params }) {
  try {
const { id } = await params; 
    const rfqId = Number(id);

    if (!rfqId) {
      return Response.json({ message: "Invalid rfqId" }, { status: 400 });
    }

    // ✅ RFQ + Company + Branch header
    const [headerRows] = await db.query(
      `
      SELECT
        r.id AS rfqId,
        r.company_id AS companyId,
        r.branch_id AS branchId,
        r.submitted_at AS submittedAt,
        r.status,
        r.notes,
        r.client_name,
  r.client_phone,
  r.client_email,
        c.company_name AS company,
        c.company_email AS companyEmail,
        cb.gstin,
        cb.branch_name AS branchName,
        cb.contact_person AS customerName,
        cb.billing_address,
        cb.shipping_address
        
      FROM rfqs r
      JOIN companies c ON c.id = r.company_id
      JOIN company_branches cb ON cb.id = r.branch_id
      WHERE r.id = ?
      LIMIT 1
      `,
      [rfqId]
    );

    if (headerRows.length === 0) {
      return Response.json({ message: "RFQ not found" }, { status: 404 });
    }

    const header = headerRows[0];

    // ✅ RFQ items
    // ✅ rate priority:
    // 1) rfq_products.quoted_price (if filled)
    // 2) company_product_pricing.custom_price (if exists)
    // 3) products.base_price
    const [itemRows] = await db.query(
      `
      SELECT
        rp.product_id AS productId,
        p.product_name AS description,
        p.sku AS code,
         p.hsn,
        rp.quantity AS qty,
        rp.quoted_price AS quotedPrice,
        cpp.custom_price AS customPrice,
        p.base_price AS basePrice
      FROM rfq_products rp
      JOIN products p ON p.id = rp.product_id
      LEFT JOIN company_product_pricing cpp
        ON cpp.company_id = ? AND cpp.product_id = rp.product_id
      WHERE rp.rfq_id = ?
      ORDER BY rp.product_id ASC
      `,
      [header.companyId, rfqId]
    );

    const items = itemRows.map((x) => {
      const finalRate =
        x.quotedPrice != null
          ? Number(x.quotedPrice)
          : x.customPrice != null
          ? Number(x.customPrice)
          : Number(x.basePrice);

      return {
        productId: x.productId,
        description: x.description,
        hsn: x.hsn, // optional: if you don't have HSN table yet
        uom: "No",
        qty: Number(x.qty || 1),
        rate: finalRate,
        discount: 0,
        cgst: 9,
        sgst: 9,
        igst: 0,
      };
    });

    return Response.json(
      {
        header: {
          rfqId: header.rfqId,
          companyId: header.companyId,
          branchId: header.branchId,
          customerName: header.customerName || header.company,
            clientName: header.client_name || "",
  clientPhone: header.client_phone || "",
  clientEmail: header.client_email || "",
          company: header.company,
          gstin: header.gstin || "",
          place: header.place, // optional
          billing_address: header.billing_address || "",
          shipping_address: header.shipping_address || "",
          submittedAt: header.submittedAt,
          status: header.status,
          notes: header.notes || "",
        },
        items,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/rfqs/[rfqId]/details error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
