export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { db } from "../../../../db";

/* ================= NUMBER TO WORDS ================= */
function numberToWords(num) {
  if (!num) return "Zero Only";
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const inWords = n => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + " " + a[n % 10];
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred " + inWords(n % 100);
    if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand " + inWords(n % 1000);
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh " + inWords(n % 100000);
    return inWords(Math.floor(n / 10000000)) + " Crore " + inWords(n % 10000000);
  };
  return inWords(Math.round(num)) + " Only";
}

/* ================= HTML TEMPLATE ================= */
function buildHTML(data) {

  const {
    proposal, sender, computedItems, charges: allCharges,
    subtotal, cgstTotal, sgstTotal, igstTotal,
    totalTax, grandTotal, formattedDate
  } = data;

  const itemRows = computedItems.map((x, i) => `
<tr>
<td>${i + 1}</td>
<td class="tdl">${x.description}</td>
<td>${x.hsn}</td>
<td>${x.qty}</td>
<td>${x.rate.toFixed(2)}</td>
<td>${x.discount.toFixed(2)}%</td>
<td>${(x.rate * x.qty * x.discount / 100).toFixed(2)}</td>
<td>${x.amount.toFixed(2)}</td>
<td>${x.amount.toFixed(2)}</td>
<td>${x.sgst_rate || ""}</td>
<td>${x.sgst?.toFixed(2) || ""}</td>
<td>${x.cgst_rate || ""}</td>
<td>${x.cgst?.toFixed(2) || ""}</td>
<td>${x.igst_rate || ""}</td>
<td>${x.igst?.toFixed(2) || ""}</td>
<td>${x.total.toFixed(2)}</td>
</tr>`).join("");

  const chargeRows = allCharges.map(c => `
<tr>
<td></td>
<td class="tdl">${c.label}</td>
<td></td><td></td><td></td><td></td><td></td>
<td>${Number(c.amount).toFixed(2)}</td>
<td>${Number(c.amount).toFixed(2)}</td>
<td></td><td></td><td></td><td></td>
<td>${c.taxPercent || 0}%</td>
<td>${((c.amount * (c.taxPercent || 0)) / 100).toFixed(2)}</td>
<td>${(Number(c.amount) + (c.amount * (c.taxPercent || 0)) / 100).toFixed(2)}</td>
</tr>`).join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>

@page{ size:A4; margin:10mm }

body{
font-family:Segoe UI,Arial,sans-serif;
font-size:11px;
color:#000;
}

.page{ width:100% }

/* HEADER */
/* HEADER */
.hdr{
  position:relative;
  display:flex;
  justify-content:flex-end;
  margin-bottom:14px;
  min-height:140px;
  width:100%;
}

/* LEFT MOTIF */
.hdr-motif{
  position:absolute;
  left:-10mm;   /* escape page margin */
  top:-6mm;
  width:140px;
  height:auto;
}



.hdr-right{
  display:flex;
  flex-direction:column;
  align-items:flex-end; /* logo + text right */
  max-width:220px; /* control width */
}

.hdr-right img{
  width:180px;
  height:auto;
  margin-end:20px;
  margin-bottom:6px; /* gap logo→text */
}

.hdr-text{
  font-size:10px;
  line-height:15px;
  text-align:left; /* text normal */
  width:100%;
}



/* MAIN BOX */
.box{
  border:1px solid #999;
}

.strip{
  background:#d9c9b0;
  text-align:center;
  font-weight:700;
  font-size:12px;
  padding:4px 0;
  border-bottom:1px solid #999;
  letter-spacing:.5px;
}

.sec{
  padding:6px 8px;
  font-size:10px;
  line-height:15px;
  border-bottom:1px dotted #b5b5b5;
}

/* ================= TABLE ================= */

:root{
  --grid:#b7b7b7;
}

table{
  width:100%;
  border-collapse:collapse;   
  font-size:8.5px;
}

/* HEADER + CELL */
th, td{
  padding:3px 3px;
  border-right:1px dotted var(--grid);
  border-bottom:1px dotted var(--grid);
}

/* REMOVE OUTER DOUBLE */
th:last-child,
td:last-child{
  border-right:none;
}

tr:last-child td{
  border-bottom:none;
}

/* HEADER STYLE */
th{
  background:#efefef;
  font-size:8px;
  font-weight:700;
}

/* TOTAL ROW */
.tbold td{
  font-weight:700;
  border-top:1px dotted var(--grid);
}

/* LEFT ALIGN */
.tdl{
  text-align:left;
  padding-left:4px;
}

/* ================= AMOUNT ================= */

.amt-row{
  display:flex;
  border-top:1px dotted #b5b5b5;
}

.amt-words{
  flex:0 0 48%;
  padding:8px;
  font-size:9.5px;
  text-align:center;
  border-right:1px dotted #b5b5b5;
}

.tax-table{
  flex:1;
}

.tax-table table{
  border-collapse:collapse;
}

.tax-table td{
  border:none;
  border-bottom:1px dotted #b5b5b5;
  padding:3px 6px;
  font-size:9.5px;
  text-align:right;
}

.tax-table td:first-child{
  text-align:left;
}

/* ================= BANK ================= */

.bank-row{
  display:grid;
  grid-template-columns:1fr 1fr;
  border-top:1px dotted #b5b5b5;
}

.bank-left{
  padding:8px;
  border-right:1px dotted #b5b5b5;
  font-size:9.5px;
  line-height:15px;
}

.bank-right{
  padding:8px;
  font-size:9.5px;
  text-align:center;
  line-height:15px;
}

/* TERMS */
.terms{
  background:#f2f2f2;
  padding:12px 14px;
  margin-top:12px;
}

.terms h3{
  text-align:center;
  font-size:10.5px;
  margin-bottom:6px;
  font-weight:700;
}

.terms-cols{
  display:flex;
  gap:18px;
  font-size:9px;
  line-height:14px;
}

/* FOOTER */
.footer{
  background:#8aa63f;
  display:flex;
  justify-content:space-between;
  padding:6px 12px;
  margin-top:10px;
  font-size:10px;
}

</style>
</head>

<body>
<div class="page">

<!-- HEADER -->
<div class="hdr">

  <!-- LEFT MOTIF -->
<img 
  class="hdr-motif"
  width="140"
  src="https://res.cloudinary.com/dxb1whlam/image/upload/v1771496761/motif_300x400_hahbf7.png"
>


  <!-- RIGHT BLOCK -->
  <div class="hdr-right">
    <img 
      src="https://res.cloudinary.com/dxb1whlam/image/upload/v1771481107/design-studio_jm1fm9.png"
    >

  <div class="hdr-text">
<b>${sender.company_name}</b><br>
${sender.address_line1 || ""}<br>
${sender.city || ""}, ${sender.state || ""} - ${sender.pincode || ""}<br>
${sender.email || ""} | ${sender.phone || ""}<br>
${sender.website || ""}
</div>
  </div>

</div>





<div class="box">

<div class="strip">Quotation</div>

<div class="sec">
Quotation No: ${proposal.proposal_number}<br>
Quotation Date: ${formattedDate}<br>
Quotation Validity: One month from quotation date<br>
<b>GSTIN: ${sender.gstin || ""}</b><br>
State: ${sender.state || ""} | State code 27
</div>

<div class="sec">
Contact Person: ${proposal.client_name}<br>
Contact Details: ${proposal.client_phone}<br>
Company name: ${proposal.company}<br>
Address: ${proposal.billing_address}<br>
<b>GSTIN: ${proposal.gstin || ""}</b>
</div>

<table>
<thead>
<tr>
<th>S.No</th>
<th>Product Description</th>
<th>HSN</th>
<th>Qty</th>
<th>Cost</th>
<th>Disc</th>
<th>Disc Amt</th>
<th>Amt</th>
<th>Taxable</th>
<th>SGST</th>
<th>Amt</th>
<th>CGST</th>
<th>Amt</th>
<th>IGST</th>
<th>Amt</th>
<th>Total</th>
</tr>
</thead>
<tbody>
${itemRows}
${chargeRows}
<tr class="tbold">
<td colspan="7">Total</td>
<td>${subtotal.toFixed(2)}</td>
<td>${subtotal.toFixed(2)}</td>
<td></td><td>${cgstTotal.toFixed(2)}</td>
<td></td><td>${sgstTotal.toFixed(2)}</td>
<td></td><td>${igstTotal.toFixed(2)}</td>
<td>${grandTotal.toFixed(2)}</td>
</tr>
</tbody>
</table>

<div class="amt-row">

<div class="amt-words">
Total quotation amount in words<br><br>
<b>${numberToWords(grandTotal)}</b>
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

<div class="bank-row">

<div class="bank-left">
<b>Bank Details</b><br>
Bank Name: ${sender.bank_name || "-"}<br>
A/C No: ${sender.bank_account || "-"}<br>
IFSC: ${sender.bank_ifsc || "-"}<br>
Branch: ${sender.bank_branch || "-"}<br>
<br>
Interest @24% Per Annum will be charged on overdue bills<br>
Contact: ${sender.phone || ""} | ${sender.email || ""}
</div>


<div class="bank-right">
<b>For Manik Trifaley Design Studio Pvt Ltd</b><br><br><br>
Authorised Signatory & Stamp
</div>

</div>

</div>

<div class="terms">
<h3>Terms & Conditions</h3>
<div class="terms-cols">
<div>
1. <b>Product Description:</b> As per the approved production sample and/or product specification sheet. Although stringent quality guidelines are maintained, most of our products are handmade; therefore, very minor variations may occur in the final product.<br>

2. <b>Price:</b> The price is inclusive of packaging as approved in the product specification sheet.<br>

3. <b>Delivery Charges:</b> At actuals.<br>

4. <b>Taxes:</b> GST applicable as per government norms.<br>

5. <b>Payment:</b> Being a MSME vendor, payment within 45 days.
</div>

<div>
6. <b>Production Time Frame:</b> As per agreement.<br>

7. <b>Order Confirmation:</b> On receipt of a formal Purchase Order on the company letterhead.<br>

8. <b>Changes in Product Specifications:</b> No changes will be accepted once the Purchase Order is signed and sealed.<br>

9. <b>Force Majeure:</b> This quotation is subject to standard Force Majeure terms and conditions.<br>

10. <b>Jurisdiction:</b> All dealings under this quotation are subject to the jurisdiction of Pune courts.<br>

11. <b>Warranty:</b> No warranty or guarantee is provided on this product.
</div>

</div>
</div>

<div class="footer">
<span>CIN: U47735PN2025PTC244212</span>
<span>Wonders by Hands</span>
</div>

</div>
</body>
</html>`;
}

/* ================= API ================= */
export async function GET(req, { params }) {
  try {

    const { rfqid } = await params;
    const rfqId = Number(rfqid);

    const [[proposal]] = await db.query(`
SELECT 
  p.id,
  p.company_id,
  p.proposal_number,
  p.proposal_date,
  p.billing_address,
  p.subtotal,
  p.cgst_total,
  p.sgst_total,
  p.igst_total,
  p.grand_total,
  c.company_name AS company,
  cb.gstin,
  r.client_name,
  r.client_phone
FROM proposals p
JOIN rfqs r ON r.id = p.rfq_id
JOIN companies c ON c.id = r.company_id
JOIN company_branches cb ON cb.id = r.branch_id
WHERE p.id = ?
`, [rfqId]);

    const [[sender]] = await db.query(`
  SELECT *
  FROM company_info
  LIMIT 1
`);
    if (!sender) {
      return Response.json(
        { message: "Sender company not configured" },
        { status: 500 }
      );
    }

    if (!proposal) {
      return Response.json({ message: "Proposal not found" }, { status: 404 });
    }

    const [items] = await db.query(`
SELECT 
  pi.quantity qty,
  pi.rate,
  pi.discount,
  pi.cgst_rate,
  pi.sgst_rate,
  pi.igst_rate,
  pi.line_total,
  pr.product_name description,
  pr.hsn
FROM proposal_items pi
JOIN products pr ON pr.id = pi.product_id
WHERE pi.proposal_id = ?
ORDER BY pi.id
`, [proposal.id]);

    const [charges] = await db.query(`
SELECT label,amount,tax_percent taxPercent
FROM company_charges WHERE company_id=?`, [proposal.company_id]);

    const [proposalCharges] = await db.query(`
SELECT label, amount, tax_percent taxPercent
FROM proposal_charges
WHERE proposal_id = ?
`, [proposal.id]);

    const subtotal = Number(proposal.subtotal || 0);
    const cgstTotal = Number(proposal.cgst_total || 0);
    const sgstTotal = Number(proposal.sgst_total || 0);
    const igstTotal = Number(proposal.igst_total || 0);

    const totalTax = cgstTotal + sgstTotal + igstTotal;
    const grandTotal = Number(proposal.grand_total || 0);

    const computedItems = items.map(i => {
      const qty = +i.qty || 0, rate = +i.rate || 0, disc = +i.discount || 0;
      const amt = qty * rate - (qty * rate * disc) / 100;
      const cg = amt * (+i.cgst_rate || 0) / 100;
      const sg = amt * (+i.sgst_rate || 0) / 100;
      const ig = amt * (+i.igst_rate || 0) / 100;
      return { ...i, qty, rate, discount: disc, cgst: cg, sgst: sg, igst: ig, amount: amt, total: amt + cg + sg + ig };
    });

    let allCharges = [];

    if (proposalCharges.length > 0) {
      allCharges = proposalCharges;
    } else {
      allCharges = charges;
    }
    let chargesAmount = 0;
    let chargesTax = 0;

    allCharges.forEach(c => {
      const amt = +c.amount || 0;
      const tax = (amt * (+c.taxPercent || 0)) / 100;
      chargesAmount += amt;
      chargesTax += tax;
    });



    const formattedDate = new Date(proposal.proposal_date)
      .toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });

    const html = buildHTML({
      proposal,
      sender,
      computedItems,
      charges: allCharges,
      subtotal,
      cgstTotal,
      sgstTotal,
      igstTotal,
      totalTax,
      grandTotal,
      formattedDate
    });

    /* PDFSHIFT */
    const pdfRes = await fetch("https://api.pdfshift.io/v3/convert/pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + Buffer.from("api:" + process.env.PDFSHIFT_API_KEY).toString("base64")
      },
      body: JSON.stringify({
        source: html,
        format: "A4",
        use_print: true
      })
    });

    const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${proposal.proposal_number}.pdf"`
      }
    });

  } catch (e) {
    console.error(e);
    return Response.json({ message: "PDF error" }, { status: 500 });
  }
}
