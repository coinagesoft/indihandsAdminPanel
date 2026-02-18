import { db } from "../../db";

// ✅ GET Settings
export async function GET() {
  try {
    // ✅ users
    const [users] = await db.query(`
      SELECT id, email, role, active, created_at
      FROM users
      ORDER BY id DESC
    `);

    // ✅ company_info (only one row expected)
  const [companyRows] = await db.query(`
  SELECT 
    id,
    company_name,
    gstin,
    email,
    logo_url,
    currency,
    address_line1,
    address_line2,
    city,
    state,
    pincode,
    phone,
    website,
    bank_name,
    bank_account,
    bank_ifsc,
    bank_branch
  FROM company_info
  ORDER BY id DESC
  LIMIT 1
`);


    // ✅ pricing_defaults (only one row expected)
    const [pricingRows] = await db.query(`
      SELECT id, sgst_rate, cgst_rate, igst_rate, delivery_charges, branding_charges
      FROM pricing_defaults
      ORDER BY id DESC
      LIMIT 1
    `);

    return Response.json(
      {
        users,
        companyInfo: companyRows[0] || null,
        pricingDefaults: pricingRows[0] || null,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/settings error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}

// ✅ POST Save All Settings (companyInfo + pricingDefaults)
export async function POST(req) {
  try {
    const body = await req.json();
    const { companyInfo, pricingDefaults } = body;

    /* ================= COMPANY INFO ================= */
    if (companyInfo) {

      const [existingCompany] = await db.query(
        `SELECT id FROM company_info ORDER BY id DESC LIMIT 1`
      );

      if (existingCompany.length > 0) {

        await db.query(`
          UPDATE company_info SET
            company_name=?,
            gstin=?,
            email=?,
            logo_url=?,
            currency=?,
            address_line1=?,
            address_line2=?,
            city=?,
            state=?,
            pincode=?,
            phone=?,
            website=?,
            bank_name=?,
            bank_account=?,
            bank_ifsc=?,
            bank_branch=?
          WHERE id=?
        `,[
          companyInfo.companyName,
          companyInfo.gstin,
          companyInfo.email,
          companyInfo.logoUrl,
          companyInfo.currency,
          companyInfo.addressLine1,
          companyInfo.addressLine2,
          companyInfo.city,
          companyInfo.state,
          companyInfo.pincode,
          companyInfo.phone,
          companyInfo.website,
          companyInfo.bankName,
          companyInfo.bankAccount,
          companyInfo.bankIfsc,
          companyInfo.bankBranch,
          existingCompany[0].id
        ]);

      } else {

        await db.query(`
          INSERT INTO company_info (
            company_name,
            gstin,
            email,
            logo_url,
            currency,
            address_line1,
            address_line2,
            city,
            state,
            pincode,
            phone,
            website,
            bank_name,
            bank_account,
            bank_ifsc,
            bank_branch
          )
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `,[
          companyInfo.companyName,
          companyInfo.gstin,
          companyInfo.email,
          companyInfo.logoUrl,
          companyInfo.currency,
          companyInfo.addressLine1,
          companyInfo.addressLine2,
          companyInfo.city,
          companyInfo.state,
          companyInfo.pincode,
          companyInfo.phone,
          companyInfo.website,
          companyInfo.bankName,
          companyInfo.bankAccount,
          companyInfo.bankIfsc,
          companyInfo.bankBranch
        ]);

      }
    }

    /* ================= PRICING ================= */
    if (pricingDefaults) {

      const [existingPricing] = await db.query(
        `SELECT id FROM pricing_defaults ORDER BY id DESC LIMIT 1`
      );

      if (existingPricing.length > 0) {
        await db.query(`
          UPDATE pricing_defaults SET
            sgst_rate=?,
            cgst_rate=?,
            igst_rate=?,
            delivery_charges=?,
            branding_charges=?
          WHERE id=?
        `,[
          Number(pricingDefaults.sgstRate||0),
          Number(pricingDefaults.cgstRate||0),
          Number(pricingDefaults.igstRate||0),
          Number(pricingDefaults.deliveryCharges||0),
          Number(pricingDefaults.brandingCharges||0),
          existingPricing[0].id
        ]);
      } else {
        await db.query(`
          INSERT INTO pricing_defaults
          (sgst_rate,cgst_rate,igst_rate,delivery_charges,branding_charges)
          VALUES (?,?,?,?,?)
        `,[
          Number(pricingDefaults.sgstRate||0),
          Number(pricingDefaults.cgstRate||0),
          Number(pricingDefaults.igstRate||0),
          Number(pricingDefaults.deliveryCharges||0),
          Number(pricingDefaults.brandingCharges||0)
        ]);
      }
    }

    return Response.json({ message:"Settings saved successfully" });

  } catch (err) {
    console.error("POST /api/settings error:", err);
    return Response.json({ message:"Server error" },{status:500});
  }
}

