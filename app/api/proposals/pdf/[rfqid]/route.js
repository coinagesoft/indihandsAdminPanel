export const runtime = "nodejs";

import { db } from "../../../../db";
import { chromium } from "playwright";
import path from "path";
/* ================= NUMBER TO WORDS ================= */
function numberToWords(num){
 if(!num) return "Zero Only";
 const a=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
 const b=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
 const inWords=n=>{
  if(n<20) return a[n];
  if(n<100) return b[Math.floor(n/10)]+" "+a[n%10];
  if(n<1000) return a[Math.floor(n/100)]+" Hundred "+inWords(n%100);
  if(n<100000) return inWords(Math.floor(n/1000))+" Thousand "+inWords(n%1000);
  if(n<10000000) return inWords(Math.floor(n/100000))+" Lakh "+inWords(n%100000);
  return inWords(Math.floor(n/10000000))+" Crore "+inWords(n%10000000);
 };
 return inWords(Math.round(num))+" Only";
}

export async function GET(req,{params}){
try{

const {rfqid}=await params;

/* ================= FETCH ================= */
const [[p]] = await db.query(`
SELECT 
p.id,p.company_id,p.proposal_number,p.proposal_date,
p.billing_address,p.shipping_address,
cb.gstin buyer_gstin,
r.client_name,r.client_phone,
c.company_name,
ci.gstin seller_gstin,
ci.address_line1,ci.address_line2,
ci.city,ci.state,ci.pincode,
ci.phone,ci.website,
ci.bank_name,ci.bank_account,ci.bank_ifsc,ci.bank_branch
FROM proposals p
JOIN rfqs r ON r.id=p.rfq_id
JOIN companies c ON c.id=p.company_id
LEFT JOIN company_branches cb ON cb.id=p.branch_id
LEFT JOIN company_info ci ON ci.id=p.company_id
WHERE p.rfq_id=? LIMIT 1
`,[rfqid]);

/* ================= ITEMS ================= */
const [items]=await db.query(`
SELECT pi.quantity qty,pi.rate,pi.discount,
pi.cgst_rate cgst,pi.sgst_rate sgst,pi.igst_rate igst,
pr.product_name description,pr.hsn
FROM proposal_items pi
JOIN products pr ON pr.id=pi.product_id
WHERE pi.proposal_id=?`,[p.id]);

/* ================= CALC ================= */
let subtotal=0,cgstTotal=0,sgstTotal=0,igstTotal=0;

const rows = items.map(i=>{
  const qty = Number(i.qty||0);
  const rate = Number(i.rate||0);
  const discount = Number(i.discount||0);
  const cgstRate = Number(i.cgst||0);
  const sgstRate = Number(i.sgst||0);
  const igstRate = Number(i.igst||0);

  const amt = qty*rate-(qty*rate*discount)/100;
  const cg = (amt*cgstRate)/100;
  const sg = (amt*sgstRate)/100;
  const ig = (amt*igstRate)/100;
  const tot = amt+cg+sg+ig;

  subtotal+=amt;
  cgstTotal+=cg;
  sgstTotal+=sg;
  igstTotal+=ig;

  return {
    ...i,
    qty,
    rate,
    discount,
    cgst:cg,
    sgst:sg,
    igst:ig,
    amount:amt,
    total:tot
  };
});


const totalTax=cgstTotal+sgstTotal+igstTotal;
const grandTotal=subtotal+totalTax;
const logoPath = path.join(
  process.cwd(),
  "public",
  "trifoley-logo.png"
);

const logoUrl = `file://${logoPath}`;

/* ================= HTML (PPT EXACT) ================= */

const html=`
<html>
<head>
<meta charset="utf-8"/>
<style>
body{font-family:Arial;margin:0;padding:40px;font-size:11px;color:#000}

/* HEADER */
.header{display:flex;justify-content:space-between}
.seller{text-align:right;max-width:260px;line-height:1.35}

/* STRIP */
.strip{
background:#d8c5ad;
text-align:center;
font-weight:bold;
padding:6px 0;
margin:18px 0 10px;
}

/* META BOX */
.meta{
border:1px solid #cfcfcf;
padding:8px;
line-height:1.5;
}

/* TABLE */
table{width:100%;border-collapse:collapse;font-size:10px;margin-top:10px}
th,td{border:1px solid #cfcfcf;padding:4px}
th{font-weight:bold}
.right{text-align:right}

/* TOTAL GRID RIGHT */
.totals{
width:240px;
border-collapse:collapse;
margin-left:auto;
margin-top:10px
}
.totals td{border:1px solid #cfcfcf;padding:4px}

/* WORDS CENTER */
.words{text-align:center;margin-top:8px;font-size:10px}

/* BANK */
.bank{margin-top:14px;font-size:10px}

/* TERMS 2 COL */
.terms{
  margin-top:15px;
  background:#f3f3f3;
  padding:10px;
  font-size:10px;
  line-height:1.4;
}
.main-grid{
width:100%;
border-collapse:collapse;
font-size:10px;
margin-top:10px;
}

.main-grid th,
.main-grid td{
border:1px solid #cfcfcf;
padding:3px;
}

.summary-grid{
width:260px;
border-collapse:collapse;
margin-left:auto;
margin-top:6px;
font-size:10px;
}

.summary-grid td{
border:1px solid #cfcfcf;
padding:3px;
}

.words{
text-align:center;
margin-top:6px;
font-size:10px;
}


.terms-title{text-align:center;font-weight:bold;margin-bottom:6px}
.terms-cols{display:flex;gap:30px}
.terms-cols div{width:50%;font-size:10px;line-height:1.4}

/* SIGN */
.sign{display:flex;justify-content:space-between;margin-top:50px}

/* FOOTER */
.footer{
background:#8aa64f;
color:#000;
font-size:10px;
padding:6px 8px;
margin-top:20px;
display:flex;
justify-content:space-between
}
</style>
</head>

<body>

<!-- HEADER -->
<div class="header">
<div>
<img src="${logoUrl}" width="140"/>

</div>

<div class="seller">
<b>${p.company_name}</b><br>
${p.address_line1||""}<br>
${p.address_line2||""}<br>
${p.city||""}, ${p.state||""} ${p.pincode||""}<br>
${p.phone||""}<br>
${p.website||""}<br>
GSTIN: ${p.seller_gstin||""}
</div>
</div>

<div class="strip">Quotation</div>

<!-- META -->
<div class="meta">
Quotation No: ${p.proposal_number}<br>
Quotation Date: ${p.proposal_date}<br>
Quotation Validity: One month from quotation date<br>
GSTIN: ${p.buyer_gstin||""}<br>
Contact Person: ${p.client_name}<br>
Contact Details: ${p.client_phone}<br>
Company Name: ${p.client_name}<br>
Billing Address: ${p.billing_address||""}<br>
Shipping Address: ${p.shipping_address||""}
</div>

<!-- TABLE -->
<!-- MAIN GRID -->
<!-- ================= MAIN GRID EXACT PPT ================= -->
<table class="main-grid">
  <thead>
    <tr>
      <th style="width:28px">S.</th>
      <th style="width:230px">Product Description</th>
      <th style="width:70px">HSN/SAC</th>
      <th style="width:40px">Qty</th>
      <th style="width:55px">Cost</th>
      <th style="width:55px">Discount</th>
      <th style="width:65px">Disc. Cost</th>
      <th style="width:70px">Amt. Taxable</th>
      <th colspan="2" style="width:80px">SGST</th>
      <th colspan="2" style="width:80px">CGST</th>
      <th colspan="2" style="width:80px">IGST</th>
      <th style="width:70px">Total</th>
    </tr>
    <tr>
      <th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th>
      <th>Rate</th><th>Amt</th>
      <th>Rate</th><th>Amt</th>
      <th>Rate</th><th>Amt</th>
      <th></th>
    </tr>
  </thead>

  <tbody>
  ${rows.map((r,i)=>`
    <tr>
      <td>${i+1}</td>
      <td>${r.description}</td>
      <td>${r.hsn||""}</td>
      <td class="right">${r.qty}</td>
      <td class="right">${r.rate.toFixed(0)}</td>
      <td class="right">${r.discount}</td>
      <td class="right">${(r.rate - (r.rate*r.discount/100)).toFixed(0)}</td>
      <td class="right">${r.amount.toFixed(0)}</td>

      <td class="right">${0}</td>
      <td class="right">${r.sgst.toFixed(0)}</td>

      <td class="right">${0}</td>
      <td class="right">${r.cgst.toFixed(0)}</td>

      <td class="right">${0}</td>
      <td class="right">${r.igst.toFixed(0)}</td>

      <td class="right">${r.total.toFixed(0)}</td>
    </tr>
  `).join("")}

  <!-- Courier row -->
  <tr>
    <td></td>
    <td>Courier Charges</td>
    <td></td><td></td><td></td><td></td><td></td>
    <td class="right">${subtotal.toFixed(0)}</td>
    <td></td><td></td>
    <td></td><td></td>
    <td></td>
    <td class="right">${igstTotal.toFixed(0)}</td>
    <td></td>
  </tr>

  <!-- Total row -->
  <tr>
    <td></td>
    <td><b>Total</b></td>
    <td></td>
    <td class="right">${rows.reduce((a,r)=>a+r.qty,0)}</td>
    <td></td><td></td><td></td>
    <td class="right">${subtotal.toFixed(0)}</td>
    <td></td><td></td>
    <td></td><td></td>
    <td></td>
    <td class="right">${totalTax.toFixed(0)}</td>
    <td class="right">${grandTotal.toFixed(0)}</td>
  </tr>

  </tbody>
</table>

<table class="summary-grid">
<tr><td>Total Amount before Tax</td><td class="right">${subtotal.toFixed(0)}</td></tr>
<tr><td>Add: CGST</td><td class="right">${cgstTotal.toFixed(0)}</td></tr>
<tr><td>Add: SGST</td><td class="right">${sgstTotal.toFixed(0)}</td></tr>
<tr><td>Add: IGST</td><td class="right">${igstTotal.toFixed(0)}</td></tr>
<tr><td>Total Tax Amount</td><td class="right">${totalTax.toFixed(0)}</td></tr>
<tr><td><b>Total Amount After Tax</b></td><td class="right"><b>${grandTotal.toFixed(0)}</b></td></tr>
<tr><td>GST on Reverse</td><td class="right">0</td></tr>
<tr><td>Charge</td><td class="right">0</td></tr>
</table>



<div class="words">
Total quotation amount in words<br>
<b>${numberToWords(grandTotal)}</b>
</div>


<!-- BANK -->
<div class="bank">
<b>Bank Details</b><br>
Bank A/C: ${p.bank_account||""}<br>
Bank: ${p.bank_name||""}<br>
Bank IFSC: ${p.bank_ifsc||""}<br>
Branch: ${p.bank_branch||""}<br>
Interest @ 24% Per Annum will be charged on overdue bills
</div>

<!-- TERMS -->
<div class="terms">
  <div class="terms-title">Terms & Conditions</div>

  <div class="terms-cols">
    
    <div>
      1. Product Description: As per the approved production sample and/or product specification sheet. Although stringent quality guidelines are maintained, most of our products are handmade; therefore, very minor variations may occur in the final product.<br><br>

      2. Price: The price is inclusive of packaging as approved in the product specification sheet.<br><br>

      3. Delivery Charges: At actuals.<br><br>

      4. Taxes: GST applicable as per government norms.<br><br>

      5. Payment: Being a MSME vendor, payment within 45 days.
    </div>

    <div>
      6. Production Time Frame: As per agreement.<br><br>

      7. Order Confirmation: On receipt of a formal Purchase Order on the company letterhead.<br><br>

      8. Changes in Product Specifications: No changes will be accepted once the Purchase Order is signed and sealed.<br><br>

      9. Force Majeure: This quotation is subject to standard Force Majeure terms and conditions.<br><br>

      10. Jurisdiction: All dealings under this quotation are subject to the jurisdiction of Pune courts.<br><br>

      11. Warranty: No warranty or guarantee is provided on this product.
    </div>

  </div>
</div>


<div class="sign">
<div>Customer Sign & Stamp</div>
<div>Authorised Signatory & Stamp</div>
</div>

<div class="footer">
<div>CIN: U47735PN2025PTC244212</div>
<div>Wonders by Hands</div>
</div>

</body>
</html>
`;

/* ================= PDF ================= */
const browser=await chromium.launch();
const page=await browser.newPage();
await page.setContent(html,{waitUntil:"load"});
const pdf=await page.pdf({format:"A4",printBackground:true});
await browser.close();

return new Response(pdf,{
headers:{
"Content-Type":"application/pdf",
"Content-Disposition":`attachment; filename="${p.proposal_number}.pdf"`
}
});

}catch(e){
console.error(e);
return new Response("PDF error",{status:500});
}
}
