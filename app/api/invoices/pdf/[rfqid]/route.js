export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { db } from "../../../../db";

/* ================= NUMBER TO WORDS ================= */
function numberToWords(num) {
  if (!num) return "Zero Only";

  const a = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
             "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen",
             "Seventeen","Eighteen","Nineteen"];
  const b = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];

  const inWords = (n) => {
    if (n < 20)       return a[n];
    if (n < 100)      return b[Math.floor(n/10)] + " " + a[n%10];
    if (n < 1000)     return a[Math.floor(n/100)] + " Hundred " + inWords(n%100);
    if (n < 100000)   return inWords(Math.floor(n/1000)) + " Thousand " + inWords(n%1000);
    if (n < 10000000) return inWords(Math.floor(n/100000)) + " Lakh " + inWords(n%100000);
    return inWords(Math.floor(n/10000000)) + " Crore " + inWords(n%10000000);
  };

  return inWords(Math.round(num)) + " Only";
}

/* ================= HTML TEMPLATE ================= */
function buildHTML({ proposal, computedItems, charges,
                     subtotal, cgstTotal, sgstTotal, igstTotal,
                     totalTax, grandTotal, formattedDate }) {

  const itemRows = computedItems.map((x, i) => `
    <tr>
      <td>${i + 1}</td>
      <td class="tdl">${x.description}</td>
      <td>${x.hsn}</td>
      <td>${x.qty.toFixed(0)}</td>
      <td>${x.rate.toFixed(2)}</td>
      <td>${x.discount.toFixed(2)}%</td>
      <td>${(x.rate * x.qty * x.discount / 100).toFixed(2)}</td>
      <td>${x.amount.toFixed(2)}</td>
      <td>${x.amount.toFixed(2)}</td>
      <td>${x.sgst_rate ? x.sgst_rate + "%" : ""}</td>
      <td>${x.sgst ? x.sgst.toFixed(2) : ""}</td>
      <td>${x.cgst_rate ? x.cgst_rate + "%" : ""}</td>
      <td>${x.cgst ? x.cgst.toFixed(2) : ""}</td>
      <td>${x.igst_rate ? x.igst_rate + "%" : ""}</td>
      <td>${x.igst ? x.igst.toFixed(2) : ""}</td>
      <td>${x.total.toFixed(2)}</td>
    </tr>`).join("");

  const chargeRows = charges.map(c => `
    <tr>
      <td></td>
      <td class="tdl">${c.label}</td>
      <td></td><td></td><td></td><td></td><td></td>
      <td>${Number(c.amount).toFixed(2)}</td>
      <td>${Number(c.amount).toFixed(2)}</td>
      <td></td><td></td><td></td><td></td>
      <td>${c.taxPercent ?? 0}%</td>
      <td>${((c.amount * (c.taxPercent || 0)) / 100).toFixed(2)}</td>
      <td>${(Number(c.amount) + (c.amount * (c.taxPercent || 0)) / 100).toFixed(2)}</td>
    </tr>`).join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>Quotation – ${proposal.company}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Segoe UI',Arial,sans-serif;font-size:11px;color:#000;background:#fff;}
.page{width:100%;padding:24px 28px 20px 28px;}

/* HEADER */
.hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px;}
.hdr-left img{width:110px;height:auto;object-fit:contain;}
.hdr-right{text-align:left;font-size:10px;line-height:16px;}

/* BOX */
.box{border:1px solid #999;width:100%;}

/* STRIP */
.strip{background:#d9c9b0;text-align:center;font-weight:700;font-size:12px;
       padding:4px 0;letter-spacing:.5px;border-bottom:1px solid #999;}

/* SECTIONS */
.sec{padding:5px 8px;font-size:10px;line-height:16px;border-bottom:1px dotted #aaa;}

/* TABLE */
table{width:100%;border-collapse:collapse;font-size:8.5px;}
th,td{border:1px dotted #aaa;padding:2.5px 3px;text-align:center;vertical-align:middle;}
table.main tr th:first-child,table.main tr td:first-child{border-left:none;}
table.main tr th:last-child,table.main tr td:last-child{border-right:none;}
table.main thead tr:first-child th{border-top:none;}
table.main tbody tr:last-child td{border-bottom:none;}
th{background:#f0efee;font-weight:700;font-size:8px;}
.tdl{text-align:left;padding-left:5px;}
.tbold{font-weight:700;}

/* AMOUNT ROW */
.amt-row{display:flex;border-bottom:1px dotted #aaa;}
.amt-words{flex:0 0 48%;border-right:1px dotted #aaa;padding:5px 8px;
           font-size:9.5px;line-height:16px;display:flex;flex-direction:column;
           justify-content:center;text-align:center;}
.amt-words u{font-weight:700;}
.tax-table{flex:1;}
.tax-table table{height:100%;}
.tax-table td{border:none;border-bottom:1px dotted #aaa;text-align:right;
              padding:2px 6px;font-size:9.5px;}
.tax-table td:first-child{text-align:left;}
.tax-table tr:last-child td{border-bottom:none;}

/* BANK ROW */
.bank-row{display:grid;grid-template-columns:1fr 1fr;font-size:9.5px;line-height:16px;}
.bank-left{padding:5px 8px;border-right:1px dotted #aaa;line-height:17px;}
.bank-two-col{display:flex;justify-content:space-between;margin-bottom:2px;}
.bank-right{padding:5px 8px;display:flex;flex-direction:column;
            justify-content:space-between;min-height:80px;}
.sig-top{font-size:9.5px;font-weight:700;text-align:center;}
.sig-stamp{flex:1;min-height:44px;}
.sig-bottom{font-size:9.5px;border-top:1px dotted #aaa;padding-top:3px;text-align:center;}

/* TERMS */
.terms{background:#f4f4f4;padding:10px 12px;margin-top:12px;}
.terms h3{text-align:center;font-size:10.5px;font-weight:700;margin-bottom:6px;}
.terms-cols{display:flex;gap:14px;font-size:9px;line-height:15px;}
.terms-cols>div{flex:1;}
.terms-cta{text-align:center;font-style:italic;font-weight:700;margin-top:8px;font-size:9.5px;}

/* FOOTER */
.footer{background:#8aaa4a;display:flex;justify-content:space-between;align-items:center;
        padding:5px 12px;margin-top:10px;font-size:10px;}
.footer .wonders{font-family:Georgia,serif;font-style:italic;font-size:14px;color:#1e3a00;}
</style>
</head>
<body>
<div class="page">

<!-- HEADER -->
<div class="hdr">
  <div class="hdr-left">
    <img src="https://res.cloudinary.com/dxb1whlam/image/upload/v1700000000/Indihands/MTDS_Logo_Transparent_bg.png" alt="Logo"/>
  </div>
  <div class="hdr-right">
    <b>Registered Office</b><br>
    301, Meghna, Ranwara,<br>
    Tal. Mulshi, Bavdhan, Haveli,<br>
    Pune- 411021, Maharashtra<br>
    www.mtds.co.in | manik@mtds.co.in<br>
    +91.9822.513.937
  </div>
</div>

<div class="box">

  <div class="strip">Quotation</div>

  <div class="sec">
    Quotation No: ${proposal.proposal_number}<br>
    Quotation Date: ${formattedDate}<br>
    Quotation Validity: One month from quotation date<br>
    <b>GSTIN: ${proposal.gstin}</b><br>
    State: Maharashtra &nbsp;|&nbsp; State code 27
  </div>

  <div class="sec">
    Contact Person: ${proposal.client_name}<br>
    Contact Details: ${proposal.client_phone}<br>
    Company name: ${proposal.company}<br>
    Address: ${proposal.billing_address}
  </div>

  <div style="border-bottom:1px dotted #aaa;">
    <table class="main">
      <thead>
        <tr>
          <th rowspan="2" style="width:22px;">S.No.</th>
          <th rowspan="2">Product Description</th>
          <th rowspan="2" style="width:44px;">HSN/SAC</th>
          <th rowspan="2" style="width:22px;">Qty</th>
          <th rowspan="2" style="width:30px;">Cost</th>
          <th rowspan="2" style="width:34px;">Discount</th>
          <th rowspan="2" style="width:34px;">Disc. Cost</th>
          <th rowspan="2" style="width:34px;">Amt.</th>
          <th rowspan="2" style="width:38px;">Taxable Value</th>
          <th colspan="2">SGST</th>
          <th colspan="2">CGST</th>
          <th colspan="2">IGST</th>
          <th rowspan="2" style="width:44px;">Total</th>
        </tr>
        <tr>
          <th>Rate</th><th>Amt.</th>
          <th>Rate</th><th>Amt.</th>
          <th>Rate</th><th>Amt.</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
        ${chargeRows}
        <tr class="tbold">
          <td colspan="3" style="text-align:center;">Total</td>
          <td></td><td></td><td></td><td></td>
          <td>${subtotal.toFixed(2)}</td>
          <td>${subtotal.toFixed(2)}</td>
          <td></td><td>${cgstTotal.toFixed(2)}</td>
          <td></td><td>${sgstTotal.toFixed(2)}</td>
          <td></td><td>${igstTotal.toFixed(2)}</td>
          <td>${grandTotal.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Amount in words + Tax grid -->
  <div class="amt-row">
    <div class="amt-words">
      Total quotation amount in words<br><br>
      <u>${numberToWords(grandTotal)}</u>
    </div>
    <div class="tax-table">
      <table>
        <tr><td>Total Amount before Tax</td><td>${subtotal.toFixed(2)}</td></tr>
        <tr><td>Add: CGST</td><td>${cgstTotal.toFixed(2)}</td></tr>
        <tr><td>Add: SGST</td><td>${sgstTotal.toFixed(2)}</td></tr>
        <tr><td>Add: IGST</td><td>${igstTotal.toFixed(2)}</td></tr>
        <tr><td>Total Tax Amount</td><td>${totalTax.toFixed(2)}</td></tr>
        <tr><td>Total Amount after Tax</td><td>${grandTotal.toFixed(2)}</td></tr>
        <tr><td>GST on Reverse Charge</td><td>0</td></tr>
      </table>
    </div>
  </div>

  <!-- Bank + Signatory -->
  <div class="bank-row">
    <div class="bank-left">
      <b>Bank Details</b><br>
      <div class="bank-two-col">
        <div>
          Bank A/C: 0653102000020013<br>
          Bank IFSC: IBKL0000653
        </div>
        <div style="text-align:right;">
          Bank: IDBI Bank<br>
          Branch: Gujrat Colony
        </div>
      </div>
      Interest @ 24% Per Annum will be charged on overdue bills<br>
      MTDS contact details: Ms. Manik Trifaley | 9822513937 | manik@mtds.co.in
    </div>
    <div class="bank-right">
      <div class="sig-top">For Manik Trifaley Design Studio Pvt Ltd</div>
      <div class="sig-stamp"></div>
      <div class="sig-bottom">Authorised Signatory &amp; Stamp</div>
    </div>
  </div>

</div><!-- /box -->

<div class="terms">
  <h3>Terms &amp; Conditions</h3>
  <div class="terms-cols">
    <div>
      1. <b>Product Description:</b> As per the approved production sample and/or product specification sheet. Although stringent quality guidelines are maintained, most of our products are handmade; therefore, very minor variations may occur in the final product.<br><br>
      2. <b>Price:</b> The price is inclusive of packaging as approved in the product specification sheet.<br><br>
      3. <b>Delivery Charges:</b> At actuals.<br><br>
      4. <b>Taxes:</b> GST applicable as per government norms.<br><br>
      5. <b>Payment:</b> Being a MSME vendor, payment within 45 days.
    </div>
    <div>
      6. <b>Production Time Frame:</b> As per agreement.<br><br>
      7. <b>Order Confirmation:</b> On receipt of a formal Purchase Order on the company letterhead.<br><br>
      8. <b>Changes in Product Specifications:</b> No changes will be accepted once the Purchase Order is signed and sealed.<br><br>
      9. <b>Force Majeure:</b> This quotation is subject to standard Force Majeure terms and conditions.<br><br>
      10. <b>Jurisdiction:</b> All dealings under this quotation are subject to the jurisdiction of Pune courts.<br><br>
      11. <b>Warranty:</b> No warranty or guarantee is provided on this product.
    </div>
  </div>
  <div class="terms-cta"><i>We look forward to your positive response.</i></div>
</div>

<div class="footer">
  <span>CIN: U47735PN2025PTC244212</span>
  <span class="wonders">Wonders by Hands</span>
</div>

</div><!-- /page -->
</body>
</html>`;
}

/* ================= GET HANDLER ================= */
export async function GET(req, { params }) {
  try {
    const { rfqid } = await params;
    const rfqId = Number(rfqid);
    if (!rfqid || isNaN(rfqId))
      return Response.json({ message: "Invalid rfqId" }, { status: 400 });

    /* ── FETCH PROPOSAL ── */
    const [[proposal]] = await db.query(`
      SELECT p.id, p.company_id, p.proposal_number, p.proposal_date,
             p.billing_address, c.company_name AS company,
             cb.gstin, r.client_name, r.client_phone
      FROM proposals p
      JOIN rfqs r              ON r.id  = p.rfq_id
      JOIN companies c         ON c.id  = r.company_id
      JOIN company_branches cb ON cb.id = r.branch_id
      WHERE p.rfq_id = ? LIMIT 1`, [rfqId]);

    if (!proposal)
      return Response.json({ message: "Not found" }, { status: 404 });

    /* ── FETCH ITEMS ── */
    const [items] = await db.query(`
      SELECT pi.quantity qty, pi.rate, pi.discount,
             pi.cgst_rate, pi.sgst_rate, pi.igst_rate,
             pr.product_name description, pr.hsn
      FROM proposal_items pi
      JOIN products pr ON pr.id = pi.product_id
      WHERE pi.proposal_id = ? ORDER BY pi.id`, [proposal.id]);

    /* ── FETCH CHARGES ── */
    const [charges] = await db.query(`
      SELECT label, amount, tax_percent taxPercent
      FROM company_charges WHERE company_id = ?`, [proposal.company_id]);

    /* ── CALCULATIONS ── */
    let subtotal = 0, cgstTotal = 0, sgstTotal = 0, igstTotal = 0;

    const computedItems = items.map(i => {
      const qty      = Number(i.qty       || 0);
      const rate     = Number(i.rate      || 0);
      const discount = Number(i.discount  || 0);
      const cgstRate = Number(i.cgst_rate || 0);
      const sgstRate = Number(i.sgst_rate || 0);
      const igstRate = Number(i.igst_rate || 0);

      const amt  = qty * rate - (qty * rate * discount) / 100;
      const cg   = (amt * cgstRate) / 100;
      const sg   = (amt * sgstRate) / 100;
      const ig   = (amt * igstRate) / 100;

      subtotal  += amt;
      cgstTotal += cg;
      sgstTotal += sg;
      igstTotal += ig;

      return { ...i, qty, rate, discount,
               cgst_rate: cgstRate, sgst_rate: sgstRate, igst_rate: igstRate,
               cgst: cg, sgst: sg, igst: ig,
               amount: amt, total: amt + cg + sg + ig };
    });

    let chargesAmount = 0, chargesTax = 0;
    charges.forEach(c => {
      chargesAmount += Number(c.amount || 0);
      chargesTax    += (Number(c.amount || 0) * (c.taxPercent || 0)) / 100;
    });

    const totalTax   = cgstTotal + sgstTotal + igstTotal + chargesTax;
    const grandTotal = subtotal + totalTax + chargesAmount;

    const formattedDate = new Date(proposal.proposal_date)
      .toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });

    /* ── BUILD HTML ── */
    const html = buildHTML({
      proposal, computedItems, charges,
      subtotal, cgstTotal, sgstTotal, igstTotal,
      totalTax, grandTotal, formattedDate
    });

 

   /* ── LAUNCH BROWSER (LOCAL + VERCEL READY) ── */
let browser;

if (process.env.VERCEL) {
  // Vercel / serverless environment
  const chromium = (await import("@sparticuz/chromium")).default;
  const puppeteerCore = (await import("puppeteer-core")).default;

 const browser = await puppeteer.launch({
  args: chromium.args,
  executablePath: await chromium.executablePath(),
  headless: chromium.headless,
});


} else {
  // Local / Node server environment
  const puppeteer = (await import("puppeteer")).default;

  browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
}


    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format:          "A4",
      printBackground: true,
      margin: { top: "10mm", bottom: "10mm", left: "8mm", right: "8mm" }
    });

    await browser.close();
console.log("VERCEL:", process.env.VERCEL);

    /* ── RETURN PDF ── */
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type":        "application/pdf",
        "Content-Disposition": `attachment; filename="${proposal.proposal_number}.pdf"`
      }
    });

  } catch (err) {
    console.error(err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}