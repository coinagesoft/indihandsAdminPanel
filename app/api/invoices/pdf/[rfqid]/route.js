export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { db } from "../../../../db";

/* ================= NUMBER TO WORDS ================= */
function numberToWords(num){
  if(!num) return "Zero Only";
  const a=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
  "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen",
  "Seventeen","Eighteen","Nineteen"];
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

/* ================= HTML TEMPLATE ================= */
function buildHTML(data){

 const {
    proposal, sender, computedItems, charges: computedCharges,
    subtotal, cgstTotal, sgstTotal, igstTotal,
    totalTax, grandTotal, formattedDate
  } = data;


/* ================= STATE LOGIC ================= */

  const stateMap = {
    "01":"Jammu and Kashmir",
    "02":"Himachal Pradesh",
    "03":"Punjab",
    "04":"Chandigarh",
    "05":"Uttarakhand",
    "06":"Haryana",
    "07":"Delhi",
    "08":"Rajasthan",
    "09":"Uttar Pradesh",
    "10":"Bihar",
    "11":"Sikkim",
    "12":"Arunachal Pradesh",
    "13":"Nagaland",
    "14":"Manipur",
    "15":"Mizoram",
    "16":"Tripura",
    "17":"Meghalaya",
    "18":"Assam",
    "19":"West Bengal",
    "20":"Jharkhand",
    "21":"Odisha",
    "22":"Chhattisgarh",
    "23":"Madhya Pradesh",
    "24":"Gujarat",
    "25":"Daman and Diu",
    "26":"Dadra and Nagar Haveli",
    "27":"Maharashtra",
    "28":"Andhra Pradesh",
    "29":"Karnataka",
    "30":"Goa",
    "31":"Lakshadweep",
    "32":"Kerala",
    "33":"Tamil Nadu",
    "34":"Puducherry",
    "35":"Andaman and Nicobar Islands",
    "36":"Telangana",
    "37":"Andhra Pradesh (New)",
    "38":"Ladakh"
  };

  const clientStateCode = proposal.gstin
    ? proposal.gstin.substring(0, 2)
    : "";

  const senderStateCode = sender.gstin
    ? sender.gstin.substring(0, 2)
    : "";

  const clientStateName = stateMap[clientStateCode] || "";
  const senderStateName = stateMap[senderStateCode] || "";
const itemRows = computedItems.map((x,i)=>`
<tr>
<td>${i+1}</td>
<td class="left">${x.description||""}</td>
<td>${x.hsn||""}</td>
<td>${x.qty}</td>
<td>${x.rate.toFixed(2)}</td>
<td>${x.amount.toFixed(2)}</td>
<td>${x.amount.toFixed(2)}</td>

<td>${x.sgst>0 ? (x.sgst_rate||0) : ""}</td>
<td>${x.sgst.toFixed(2)}</td>

<td>${x.cgst>0 ? (x.cgst_rate||0) : ""}</td>
<td>${x.cgst.toFixed(2)}</td>

<td>${x.igst>0 ? (x.igstRate||0) : ""}</td>
<td>${x.igst.toFixed(2)}</td>

<td>${x.total.toFixed(2)}</td>
</tr>
`).join("");

const chargeRows = computedCharges.map(c=>`
<tr>
<td></td>
<td class="left">${c.label}</td>
<td></td>
<td></td>
<td></td>
<td>${c.amount.toFixed(2)}</td>
<td>${c.amount.toFixed(2)}</td>

<td></td>
<td>${c.sgst.toFixed(2)}</td>

<td></td>
<td>${c.cgst.toFixed(2)}</td>

<td></td>
<td>${c.igst.toFixed(2)}</td>

<td>${c.total.toFixed(2)}</td>
</tr>
`).join("");

return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>

<style>
@page{
  size:A4;
  margin:0;   /* ⭐ KEY */
}

body{
  margin:0;
  padding:10mm;  /* content margin */
  font-family:Segoe UI,Arial,sans-serif;
}

.page{
  width:100%;
  min-height:277mm;   
  display:flex;
  flex-direction:column;
}

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
  position:fixed;
  left:0;
  top:0;
  width:150px;
  height:auto;
  z-index:9999;
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

/* ===== MAIN BOX ===== */
.box{
  border:1px solid #8c8c8c;
}

/* title strip */
.strip{
  background:#d8c7ad;
  text-align:center;
  font-weight:700;
  font-size:12px;
  padding:5px 0;
  border-bottom:1px solid #8c8c8c;
}

/* ===== META GRID ===== */
.meta{
  width:100%;
  border-collapse:collapse;
  font-size:10px;
}

.meta td{
  border-bottom:1px dotted #b7b7b7;
  padding:4px 6px;
}

.meta td.label{
  width:160px;
  font-weight:600;
}

.meta td.value{
  width:260px;
}

/* ===== PARTY GRID ===== */
.party{
  width:100%;
  border-collapse:collapse;
  font-size:10px;
}

.party td{
  border-top:1px dotted #b7b7b7;
  padding:6px;
  vertical-align:top;
}

.party .title{
  font-weight:700;
  margin-bottom:2px;
}

/* ===== ITEM TABLE ===== */
.items{
  width:100%;
  border-collapse:collapse;
  font-size:8.5px;
}

.items th,
.items td{
  border-right:1px dotted #b7b7b7;
  border-bottom:1px dotted #b7b7b7;
  padding:3px 4px;
}

.items th:last-child,
.items td:last-child{
  border-right:none;
}

.items th{
  background:#efefef;
  font-weight:700;
}

.items td{
  text-align:center;
}

.items td.left{
  text-align:left;
}

/* total row */
.items tr.total td{
  font-weight:700;
}

/* ===== AMOUNT GRID ===== */
.amt{
  display:grid;
  grid-template-columns:1fr 320px;
  border-top:1px dotted #b7b7b7;
}

.words{
  padding:8px;
  border-right:1px dotted #b7b7b7;
  text-align:center;
}

.totals{
  padding:0;
}

.totals table{
  width:100%;
  border-collapse:collapse;
  font-size:10px;
}

.totals td{
  border-bottom:1px dotted #b7b7b7;
  padding:4px 6px;
  text-align:right;
}

.totals td:first-child{
  text-align:left;
}

/* ===== BANK GRID ===== */
.bank{
  display:grid;
  grid-template-columns:1fr 1fr;
  border-top:1px dotted #b7b7b7;
}

.bank-left{
  padding:8px;
  border-right:1px dotted #b7b7b7;
  font-size:10px;
  line-height:15px;
}

.bank-right{
  padding:8px;
  text-align:center;
  font-size:10px;
}

/* ===== FOOT ===== */
/* FOOTER */
.footer-wrap{
  margin-top:auto;
}

.thankyou{
  text-align:center;
  margin:10px 0 4px 0;
  font-size:16px;
  font-weight:bold;
}

.footer{
  background:#cfd84e;
  display:flex;
  justify-content:space-between;
  padding:6px 12px;
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
  <b>Registered Office</b><br>
  ${sender.address_line1 || ""}<br>
${sender.city || ""}, ${sender.state || ""} - ${sender.pincode || ""}<br>
${sender.email || ""} | ${sender.phone || ""}<br>
${sender.website || ""}
</div>
  </div>

</div>

<div class="box">

<div class="strip">Challan cum Tax Invoice</div>

<!-- META -->
<table class="meta">
<tr>
<td class="label">Invoice No</td>
<td class="value">${proposal.proposal_number}</td>
<td class="label">Invoice Date</td>
<td>${formattedDate}</td>
</tr>

<tr>
<td class="label">GSTIN</td>
<td>${proposal.gstin}</td>
<td class="label">State</td>
<td>Maharashtra</td>
</tr>

<tr>
<td class="label">Contact Person</td>
<td>${proposal.client_name}</td>
<td class="label">Contact Details</td>
<td>${proposal.client_phone}</td>
</tr>
</table>

<!-- PARTY -->
<table class="party">
<tr>
<td>
<div class="title">Bill to Party</div>
${proposal.company}<br>
${proposal.billing_address}
</td>

<td>
<div class="title">Ship to Party</div>
${proposal.company}<br>
${proposal.billing_address}
</td>
</tr>
</table>

<!-- ITEMS -->
<table class="items">
<thead>
<tr>
<th>S.No</th>
<th class="left">Product Description</th>
<th>HSN</th>
<th>Qty</th>
<th>Rate</th>
<th>Amount</th>
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

<tr class="total">
<td colspan="5">Total</td>
<td>${subtotal.toFixed(2)}</td>
<td>${subtotal.toFixed(2)}</td>
<td></td>
<td>${sgstTotal.toFixed(2)}</td>
<td></td>
<td>${cgstTotal.toFixed(2)}</td>
<td></td>
<td>${igstTotal.toFixed(2)}</td>
<td>${grandTotal.toFixed(2)}</td>
</tr>
</tbody>
</table>

<!-- AMOUNT -->
<div class="amt">

<div class="words">
Total invoice amount in words<br><br>
<b>${numberToWords(grandTotal)}</b>
</div>

<div class="totals">
<table>
<tr><td>Total Amount before Tax</td><td>${subtotal.toFixed(2)}</td></tr>
<tr><td>Add CGST</td><td>${cgstTotal.toFixed(2)}</td></tr>
<tr><td>Add SGST</td><td>${sgstTotal.toFixed(2)}</td></tr>
<tr><td>Add IGST</td><td>${igstTotal.toFixed(2)}</td></tr>
<tr><td>Total Tax</td><td>${totalTax.toFixed(2)}</td></tr>
<tr><td>Total after Tax</td><td>${grandTotal.toFixed(2)}</td></tr>
<tr><td>GST on Reverse Charge</td><td>0</td></tr>
</table>
</div>

</div>

<!-- BANK -->
<div class="bank">

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

  <div style="text-align:center; font-weight:600; margin-bottom:15px;">
    For Manik Trifaley Design Studio Pvt Ltd
  </div>

  <div style="text-align:center;">
    <img 
      src="https://res.cloudinary.com/dxb1whlam/image/upload/v1771567348/stamp_wcltx2.jpg"
      style="width:120px; display:block; margin:0 auto 8px auto;"
    />
  </div>

  <div style="text-align:center;">
    Authorised Signatory & Stamp
  </div>

</div>

</div>

</div>

<div class="footer-wrap">

  <div class="thankyou">
    We look forward to your positive response.
  </div>

  <div class="footer">
    <span>CIN: U47735PN2025PTC244212</span>
    <span>Wonders by Hands</span>
  </div>

</div>

</div>
</body>
</html>
`;
}

/* ================= API ================= */
// export async function GET(req,{params}){
// try{

//   const { rfqid } =await params;
//   const rfqId = Number(rfqid);

//   if(!rfqId){
//     return Response.json({message:"Invalid rfqId"},{status:400});
//   }

//   /* PROPOSAL */
//   const [[proposal]] = await db.query(`
//     SELECT p.id,p.company_id,p.proposal_number,p.proposal_date,
//     p.billing_address,c.company_name AS company,
//     cb.gstin,r.client_name,r.client_phone
//     FROM proposals p
//     JOIN rfqs r ON r.id=p.rfq_id
//     JOIN companies c ON c.id=r.company_id
//     JOIN company_branches cb ON cb.id=r.branch_id
//     WHERE p.rfq_id=? LIMIT 1`,[rfqId]);

//   if(!proposal){
//     return Response.json({message:"Proposal not found"},{status:404});
//   }

//   /* ITEMS */
//   const [items] = await db.query(`
//     SELECT pi.quantity qty,pi.rate,pi.discount,
//     pi.cgst_rate,pi.sgst_rate,pi.igst_rate,
//     pr.product_name description,pr.hsn
//     FROM proposal_items pi
//     JOIN products pr ON pr.id=pi.product_id
//     WHERE pi.proposal_id=? ORDER BY pi.id`,[proposal.id]);

//   /* CHARGES */
//   const [charges] = await db.query(`
//     SELECT label,amount,tax_percent taxPercent
//     FROM company_charges WHERE company_id=?`,[proposal.company_id]);

//   /* CALC */
//   let subtotal=0,cgstTotal=0,sgstTotal=0,igstTotal=0;

//   const computedItems = items.map(i=>{
//     const qty=+i.qty||0,rate=+i.rate||0,disc=+i.discount||0;
//     const amt=qty*rate-(qty*rate*disc)/100;
//     const cg=amt*(+i.cgst_rate||0)/100;
//     const sg=amt*(+i.sgst_rate||0)/100;
//     const ig=amt*(+i.igst_rate||0)/100;
//     subtotal+=amt;cgstTotal+=cg;sgstTotal+=sg;igstTotal+=ig;
//     return {...i,qty,rate,discount:disc,cgst:cg,sgst:sg,igst:ig,amount:amt,total:amt+cg+sg+ig};
//   });

//   let chargesAmount=0,chargesTax=0;
//   charges.forEach(c=>{
//     chargesAmount+=+c.amount||0;
//     chargesTax+=(+c.amount||0)*(c.taxPercent||0)/100;
//   });

//   const totalTax=cgstTotal+sgstTotal+igstTotal+chargesTax;
//   const grandTotal=subtotal+totalTax+chargesAmount;

//   const formattedDate=new Date(proposal.proposal_date)
//     .toLocaleDateString("en-IN",{day:"2-digit",month:"2-digit",year:"numeric"});

//   const html = buildHTML({
//     proposal,computedItems,charges,
//     subtotal,cgstTotal,sgstTotal,igstTotal,
//     totalTax,grandTotal,formattedDate
//   });

//   /* PDFSHIFT */
//   const pdfRes = await fetch("https://api.pdfshift.io/v3/convert/pdf",{
//     method:"POST",
//     headers:{
//       "Content-Type":"application/json",
//       Authorization:"Basic "+Buffer.from("api:"+process.env.PDFSHIFT_API_KEY).toString("base64")
//     },
//     body:JSON.stringify({
//       source:html,
//       format:"A4",
//       use_print:true
//     })
//   });

//   if(!pdfRes.ok){
//     const txt = await pdfRes.text();
//     console.error("PDFShift error:", txt);
//     return Response.json({message:"PDFShift failed"},{status:500});
//   }

//   const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());

//   return new Response(pdfBuffer,{
//     headers:{
//       "Content-Type":"application/pdf",
//       "Content-Disposition":`attachment; filename="${proposal.proposal_number}.pdf"`
//     }
//   });

// }catch(e){
//   console.error("PDF ERROR:",e);
//   return Response.json({message:"PDF error"},{status:500});
// }
// }
























// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// import { db } from "../../../../db";


// /* ================= NUMBER TO WORDS ================= */
// function numberToWords(num) {
//   if (!num) return "Zero Only";

//   const a = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
//              "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen",
//              "Seventeen","Eighteen","Nineteen"];
//   const b = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];

//   const inWords = (n) => {
//     if (n < 20)       return a[n];
//     if (n < 100)      return b[Math.floor(n/10)] + " " + a[n%10];
//     if (n < 1000)     return a[Math.floor(n/100)] + " Hundred " + inWords(n%100);
//     if (n < 100000)   return inWords(Math.floor(n/1000)) + " Thousand " + inWords(n%1000);
//     if (n < 10000000) return inWords(Math.floor(n/100000)) + " Lakh " + inWords(n%100000);
//     return inWords(Math.floor(n/10000000)) + " Crore " + inWords(n%10000000);
//   };

//   return inWords(Math.round(num)) + " Only";
// }

// /* ================= HTML TEMPLATE ================= */
// function buildHTML({ proposal, computedItems, charges,
//                      subtotal, cgstTotal, sgstTotal, igstTotal,
//                      totalTax, grandTotal, formattedDate }) {

//   const itemRows = computedItems.map((x, i) => `
//     <tr>
//       <td>${i + 1}</td>
//       <td class="tdl">${x.description}</td>
//       <td>${x.hsn}</td>
//       <td>${x.qty.toFixed(0)}</td>
//       <td>${x.rate.toFixed(2)}</td>
//       <td>${x.discount.toFixed(2)}%</td>
//       <td>${(x.rate * x.qty * x.discount / 100).toFixed(2)}</td>
//       <td>${x.amount.toFixed(2)}</td>
//       <td>${x.amount.toFixed(2)}</td>
//       <td>${x.sgst_rate ? x.sgst_rate + "%" : ""}</td>
//       <td>${x.sgst ? x.sgst.toFixed(2) : ""}</td>
//       <td>${x.cgst_rate ? x.cgst_rate + "%" : ""}</td>
//       <td>${x.cgst ? x.cgst.toFixed(2) : ""}</td>
//       <td>${x.igst_rate ? x.igst_rate + "%" : ""}</td>
//       <td>${x.igst ? x.igst.toFixed(2) : ""}</td>
//       <td>${x.total.toFixed(2)}</td>
//     </tr>`).join("");

//   const chargeRows = charges.map(c => `
//     <tr>
//       <td></td>
//       <td class="tdl">${c.label}</td>
//       <td></td><td></td><td></td><td></td><td></td>
//       <td>${Number(c.amount).toFixed(2)}</td>
//       <td>${Number(c.amount).toFixed(2)}</td>
//       <td></td><td></td><td></td><td></td>
//       <td>${c.taxPercent ?? 0}%</td>
//       <td>${((c.amount * (c.taxPercent || 0)) / 100).toFixed(2)}</td>
//       <td>${(Number(c.amount) + (c.amount * (c.taxPercent || 0)) / 100).toFixed(2)}</td>
//     </tr>`).join("");

//   return `<!DOCTYPE html>
// <html>
// <head>
// <meta charset="UTF-8"/>
// <title>Quotation – ${proposal.company}</title>
// <style>
// *{box-sizing:border-box;margin:0;padding:0;}
// body{font-family:'Segoe UI',Arial,sans-serif;font-size:11px;color:#000;background:#fff;}
// .page{width:100%;padding:24px 28px 20px 28px;}

// /* HEADER */
// .hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px;}
// .hdr-left img{width:110px;height:auto;object-fit:contain;}
// .hdr-right{text-align:left;font-size:10px;line-height:16px;}

// /* BOX */
// .box{border:1px solid #999;width:100%;}

// /* STRIP */
// .strip{background:#d9c9b0;text-align:center;font-weight:700;font-size:12px;
//        padding:4px 0;letter-spacing:.5px;border-bottom:1px solid #999;}

// /* SECTIONS */
// .sec{padding:5px 8px;font-size:10px;line-height:16px;border-bottom:1px dotted #aaa;}

// /* TABLE */
// table{width:100%;border-collapse:collapse;font-size:8.5px;}
// th,td{border:1px dotted #aaa;padding:2.5px 3px;text-align:center;vertical-align:middle;}
// table.main tr th:first-child,table.main tr td:first-child{border-left:none;}
// table.main tr th:last-child,table.main tr td:last-child{border-right:none;}
// table.main thead tr:first-child th{border-top:none;}
// table.main tbody tr:last-child td{border-bottom:none;}
// th{background:#f0efee;font-weight:700;font-size:8px;}
// .tdl{text-align:left;padding-left:5px;}
// .tbold{font-weight:700;}

// /* AMOUNT ROW */
// .amt-row{display:flex;border-bottom:1px dotted #aaa;}
// .amt-words{flex:0 0 48%;border-right:1px dotted #aaa;padding:5px 8px;
//            font-size:9.5px;line-height:16px;display:flex;flex-direction:column;
//            justify-content:center;text-align:center;}
// .amt-words u{font-weight:700;}
// .tax-table{flex:1;}
// .tax-table table{height:100%;}
// .tax-table td{border:none;border-bottom:1px dotted #aaa;text-align:right;
//               padding:2px 6px;font-size:9.5px;}
// .tax-table td:first-child{text-align:left;}
// .tax-table tr:last-child td{border-bottom:none;}

// /* BANK ROW */
// .bank-row{display:grid;grid-template-columns:1fr 1fr;font-size:9.5px;line-height:16px;}
// .bank-left{padding:5px 8px;border-right:1px dotted #aaa;line-height:17px;}
// .bank-two-col{display:flex;justify-content:space-between;margin-bottom:2px;}
// .bank-right{padding:5px 8px;display:flex;flex-direction:column;
//             justify-content:space-between;min-height:80px;}
// .sig-top{font-size:9.5px;font-weight:700;text-align:center;}
// .sig-stamp{flex:1;min-height:44px;}
// .sig-bottom{font-size:9.5px;border-top:1px dotted #aaa;padding-top:3px;text-align:center;}

// /* TERMS */
// .terms{background:#f4f4f4;padding:10px 12px;margin-top:12px;}
// .terms h3{text-align:center;font-size:10.5px;font-weight:700;margin-bottom:6px;}
// .terms-cols{display:flex;gap:14px;font-size:9px;line-height:15px;}
// .terms-cols>div{flex:1;}
// .terms-cta{text-align:center;font-style:italic;font-weight:700;margin-top:8px;font-size:9.5px;}

// /* FOOTER */
// .footer{background:#8aaa4a;display:flex;justify-content:space-between;align-items:center;
//         padding:5px 12px;margin-top:10px;font-size:10px;}
// .footer .wonders{font-family:Georgia,serif;font-style:italic;font-size:14px;color:#1e3a00;}
// </style>
// </head>
// <body>
// <div class="page">

// <!-- HEADER -->
// <div class="hdr">
//   <div class="hdr-left">
//     <img src="https://res.cloudinary.com/dxb1whlam/image/upload/v1700000000/Indihands/MTDS_Logo_Transparent_bg.png" alt="Logo"/>
//   </div>
//   <div class="hdr-right">
//     <b>Registered Office</b><br>
//     301, Meghna, Ranwara,<br>
//     Tal. Mulshi, Bavdhan, Haveli,<br>
//     Pune- 411021, Maharashtra<br>
//     www.mtds.co.in | manik@mtds.co.in<br>
//     +91.9822.513.937
//   </div>
// </div>

// <div class="box">

//   <div class="strip">Quotation</div>

//   <div class="sec">
//     Quotation No: ${proposal.proposal_number}<br>
//     Quotation Date: ${formattedDate}<br>
//     Quotation Validity: One month from quotation date<br>
//     <b>GSTIN: ${proposal.gstin}</b><br>
//     State: Maharashtra &nbsp;|&nbsp; State code 27
//   </div>

//   <div class="sec">
//     Contact Person: ${proposal.client_name}<br>
//     Contact Details: ${proposal.client_phone}<br>
//     Company name: ${proposal.company}<br>
//     Address: ${proposal.billing_address}
//   </div>

//   <div style="border-bottom:1px dotted #aaa;">
//     <table class="main">
//       <thead>
//         <tr>
//           <th rowspan="2" style="width:22px;">S.No.</th>
//           <th rowspan="2">Product Description</th>
//           <th rowspan="2" style="width:44px;">HSN/SAC</th>
//           <th rowspan="2" style="width:22px;">Qty</th>
//           <th rowspan="2" style="width:30px;">Cost</th>
//           <th rowspan="2" style="width:34px;">Discount</th>
//           <th rowspan="2" style="width:34px;">Disc. Cost</th>
//           <th rowspan="2" style="width:34px;">Amt.</th>
//           <th rowspan="2" style="width:38px;">Taxable Value</th>
//           <th colspan="2">SGST</th>
//           <th colspan="2">CGST</th>
//           <th colspan="2">IGST</th>
//           <th rowspan="2" style="width:44px;">Total</th>
//         </tr>
//         <tr>
//           <th>Rate</th><th>Amt.</th>
//           <th>Rate</th><th>Amt.</th>
//           <th>Rate</th><th>Amt.</th>
//         </tr>
//       </thead>
//       <tbody>
//         ${itemRows}
//         ${chargeRows}
//         <tr class="tbold">
//           <td colspan="3" style="text-align:center;">Total</td>
//           <td></td><td></td><td></td><td></td>
//           <td>${subtotal.toFixed(2)}</td>
//           <td>${subtotal.toFixed(2)}</td>
//           <td></td><td>${cgstTotal.toFixed(2)}</td>
//           <td></td><td>${sgstTotal.toFixed(2)}</td>
//           <td></td><td>${igstTotal.toFixed(2)}</td>
//           <td>${grandTotal.toFixed(2)}</td>
//         </tr>
//       </tbody>
//     </table>
//   </div>

//   <!-- Amount in words + Tax grid -->
//   <div class="amt-row">
//     <div class="amt-words">
//       Total quotation amount in words<br><br>
//       <u>${numberToWords(grandTotal)}</u>
//     </div>
//     <div class="tax-table">
//       <table>
//         <tr><td>Total Amount before Tax</td><td>${subtotal.toFixed(2)}</td></tr>
//         <tr><td>Add: CGST</td><td>${cgstTotal.toFixed(2)}</td></tr>
//         <tr><td>Add: SGST</td><td>${sgstTotal.toFixed(2)}</td></tr>
//         <tr><td>Add: IGST</td><td>${igstTotal.toFixed(2)}</td></tr>
//         <tr><td>Total Tax Amount</td><td>${totalTax.toFixed(2)}</td></tr>
//         <tr><td>Total Amount after Tax</td><td>${grandTotal.toFixed(2)}</td></tr>
//         <tr><td>GST on Reverse Charge</td><td>0</td></tr>
//       </table>
//     </div>
//   </div>

//   <!-- Bank + Signatory -->
//   <div class="bank-row">
//     <div class="bank-left">
//       <b>Bank Details</b><br>
//       <div class="bank-two-col">
//         <div>
//           Bank A/C: 0653102000020013<br>
//           Bank IFSC: IBKL0000653
//         </div>
//         <div style="text-align:right;">
//           Bank: IDBI Bank<br>
//           Branch: Gujrat Colony
//         </div>
//       </div>
//       Interest @ 24% Per Annum will be charged on overdue bills<br>
//       MTDS contact details: Ms. Manik Trifaley | 9822513937 | manik@mtds.co.in
//     </div>
//     <div class="bank-right">
//       <div class="sig-top">For Manik Trifaley Design Studio Pvt Ltd</div>
//       <div class="sig-stamp"></div>
//       <div class="sig-bottom">Authorised Signatory & Stamp</div>
//     </div>
//   </div>

// </div><!-- /box -->

// <div class="terms">
//   <h3>Terms & Conditions</h3>
//   <div class="terms-cols">
//     <div>
//       1. <b>Product Description:</b> As per the approved production sample and/or product specification sheet. Although stringent quality guidelines are maintained, most of our products are handmade; therefore, very minor variations may occur in the final product.<br><br>
//       2. <b>Price:</b> The price is inclusive of packaging as approved in the product specification sheet.<br><br>
//       3. <b>Delivery Charges:</b> At actuals.<br><br>
//       4. <b>Taxes:</b> GST applicable as per government norms.<br><br>
//       5. <b>Payment:</b> Being a MSME vendor, payment within 45 days.
//     </div>
//     <div>
//       6. <b>Production Time Frame:</b> As per agreement.<br><br>
//       7. <b>Order Confirmation:</b> On receipt of a formal Purchase Order on the company letterhead.<br><br>
//       8. <b>Changes in Product Specifications:</b> No changes will be accepted once the Purchase Order is signed and sealed.<br><br>
//       9. <b>Force Majeure:</b> This quotation is subject to standard Force Majeure terms and conditions.<br><br>
//       10. <b>Jurisdiction:</b> All dealings under this quotation are subject to the jurisdiction of Pune courts.<br><br>
//       11. <b>Warranty:</b> No warranty or guarantee is provided on this product.
//     </div>
//   </div>
//   <div class="terms-cta"><i>We look forward to your positive response.</i></div>
// </div>

// <div class="footer">
//   <span>CIN: U47735PN2025PTC244212</span>
//   <span class="wonders">Wonders by Hands</span>
// </div>

// </div><!-- /page -->
// </body>
// </html>`;
// }

// /* ================= GET HANDLER ================= */
// export async function GET(req, { params }) {
//   try {
//     const { rfqid } = await params;
//     const rfqId = Number(rfqid);
//     if (!rfqid || isNaN(rfqId))
//       return Response.json({ message: "Invalid rfqId" }, { status: 400 });

//     /* ── FETCH PROPOSAL ── */
//     const [[proposal]] = await db.query(`
//       SELECT p.id, p.company_id, p.proposal_number, p.proposal_date,
//              p.billing_address, c.company_name AS company,
//              cb.gstin, r.client_name, r.client_phone
//       FROM proposals p
//       JOIN rfqs r              ON r.id  = p.rfq_id
//       JOIN companies c         ON c.id  = r.company_id
//       JOIN company_branches cb ON cb.id = r.branch_id
//       WHERE p.rfq_id = ? LIMIT 1`, [rfqId]);

//     if (!proposal)
//       return Response.json({ message: "Not found" }, { status: 404 });

//     /* ── FETCH ITEMS ── */
//     const [items] = await db.query(`
//       SELECT pi.quantity qty, pi.rate, pi.discount,
//              pi.cgst_rate, pi.sgst_rate, pi.igst_rate,
//              pr.product_name description, pr.hsn
//       FROM proposal_items pi
//       JOIN products pr ON pr.id = pi.product_id
//       WHERE pi.proposal_id = ? ORDER BY pi.id`, [proposal.id]);

//     /* ── FETCH CHARGES ── */
//     const [charges] = await db.query(`
//       SELECT label, amount, tax_percent taxPercent
//       FROM company_charges WHERE company_id = ?`, [proposal.company_id]);

//     /* ── CALCULATIONS ── */
//     let subtotal = 0, cgstTotal = 0, sgstTotal = 0, igstTotal = 0;

//     const computedItems = items.map(i => {
//       const qty      = Number(i.qty       || 0);
//       const rate     = Number(i.rate      || 0);
//       const discount = Number(i.discount  || 0);
//       const cgstRate = Number(i.cgst_rate || 0);
//       const sgstRate = Number(i.sgst_rate || 0);
//       const igstRate = Number(i.igst_rate || 0);

//       const amt  = qty * rate - (qty * rate * discount) / 100;
//       const cg   = (amt * cgstRate) / 100;
//       const sg   = (amt * sgstRate) / 100;
//       const ig   = (amt * igstRate) / 100;

//       subtotal  += amt;
//       cgstTotal += cg;
//       sgstTotal += sg;
//       igstTotal += ig;

//       return { ...i, qty, rate, discount,
//                cgst_rate: cgstRate, sgst_rate: sgstRate, igst_rate: igstRate,
//                cgst: cg, sgst: sg, igst: ig,
//                amount: amt, total: amt + cg + sg + ig };
//     });

//     let chargesAmount = 0, chargesTax = 0;
//     charges.forEach(c => {
//       chargesAmount += Number(c.amount || 0);
//       chargesTax    += (Number(c.amount || 0) * (c.taxPercent || 0)) / 100;
//     });

//     const totalTax   = cgstTotal + sgstTotal + igstTotal + chargesTax;
//     const grandTotal = subtotal + totalTax + chargesAmount;

//     const formattedDate = new Date(proposal.proposal_date)
//       .toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });

//     /* ── BUILD HTML ── */
//     const html = buildHTML({
//       proposal, computedItems, charges,
//       subtotal, cgstTotal, sgstTotal, igstTotal,
//       totalTax, grandTotal, formattedDate
//     });

//     /* ── LAUNCH BROWSER ── */
//     let browser;
//     const isVercel = !!process.env.VERCEL || process.env.NODE_ENV === "production";

//     if (isVercel) {
//       // ===== VERCEL (LINUX SERVERLESS) =====
//       const chromium = (await import("@sparticuz/chromium")).default;
//       const puppeteer = (await import("puppeteer-core")).default;

//       browser = await puppeteer.launch({
//         args: chromium.args,
//         executablePath: await chromium.executablePath(),
//         headless: true,
//         defaultViewport: chromium.defaultViewport,
//       });

//     } else {
//       // ===== LOCAL WINDOWS DEV =====
//       const puppeteer = (await import("puppeteer")).default;

//       browser = await puppeteer.launch({
//         headless: "new",
//       });
//     }

//     /* ── GENERATE PDF ── */
//     const page = await browser.newPage();
//     await page.setContent(html, { waitUntil: "networkidle0" });

//     const pdfBuffer = await page.pdf({
//       format:          "A4",
//       printBackground: true,
//       margin: { top: "10mm", bottom: "10mm", left: "8mm", right: "8mm" }
//     });

//     await browser.close();

//     console.log("VERCEL env:", process.env.VERCEL);
//     console.log("PDF generated successfully for proposal:", proposal.proposal_number);

//     /* ── RETURN PDF ── */
//     return new Response(pdfBuffer, {
//       status: 200,
//       headers: {
//         "Content-Type":        "application/pdf",
//         "Content-Disposition": `attachment; filename="${proposal.proposal_number}.pdf"`
//       }
//     });

//   } catch (err) {
//     console.error("PDF generation error:", err);
//     return Response.json({ message: "Server error" }, { status: 500 });
//   }
// }


export async function GET(req, { params }) {
  try {
    const { rfqid } = await params;
    const proposalId = Number(rfqid);

    /* ================= FETCH DATA ================= */
    const [[proposal]] = await db.query(`
      SELECT 
        p.id,
        p.company_id,
        p.proposal_number,
        p.proposal_date,
        p.billing_address,
        c.company_name AS company,
        cb.gstin,
        r.client_name,
        r.client_phone
      FROM proposals p
      JOIN rfqs r ON r.id = p.rfq_id
      JOIN companies c ON c.id = r.company_id
      JOIN company_branches cb ON cb.id = r.branch_id
      WHERE p.id = ?
    `, [proposalId]);

    if (!proposal)
      return Response.json({ message: "Proposal not found" }, { status: 404 });

    const formattedDate = new Date(proposal.proposal_date)
  .toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
    const [[sender]] = await db.query(`SELECT * FROM company_info LIMIT 1`);

    /* ================= STATE LOGIC ================= */
    const clientStateCode = proposal.gstin?.substring(0, 2) || "";
    const senderStateCode = sender.gstin?.substring(0, 2) || "";
    const isInterState = clientStateCode !== senderStateCode;

    /* ================= ITEMS ================= */
    const [items] = await db.query(`
      SELECT 
        pi.quantity qty,
        pi.rate,
        pi.discount,
        pi.cgst_rate,
        pi.sgst_rate,
        pi.igst_rate,
        pr.product_name description,
        pr.hsn
      FROM proposal_items pi
      JOIN products pr ON pr.id = pi.product_id
      WHERE pi.proposal_id = ?
      ORDER BY pi.id
    `, [proposal.id]);

    /* ================= CHARGES ================= */
    const [companyCharges] = await db.query(`
      SELECT label,amount,tax_percent taxPercent
      FROM company_charges
      WHERE company_id=?
    `, [proposal.company_id]);

    const [proposalCharges] = await db.query(`
      SELECT label,amount,tax_percent taxPercent
      FROM proposal_charges
      WHERE proposal_id=?
    `, [proposal.id]);

    const allCharges = proposalCharges.length ? proposalCharges : companyCharges;

    /* ================= CALCULATE ITEMS ================= */
    let itemSubtotal = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    let igstTotal = 0;

const computedItems = items.map(i => {
  const qty = +i.qty || 0;
  const rate = +i.rate || 0;
  const disc = +i.discount || 0;

  const taxable = qty * rate - (qty * rate * disc) / 100;

  let cg = 0, sg = 0, ig = 0;

  const igstRate =
    (+i.igst_rate || 0) ||
    ((+i.cgst_rate || 0) + (+i.sgst_rate || 0));

  if (isInterState) {
    ig = taxable * igstRate / 100;
  } else {
    cg = taxable * (+i.cgst_rate || 0) / 100;
    sg = taxable * (+i.sgst_rate || 0) / 100;
  }

  itemSubtotal += taxable;
  cgstTotal += cg;
  sgstTotal += sg;
  igstTotal += ig;

  return {
    ...i,
    qty,
    rate,
    discount: disc,
    amount: taxable,
    cgst: cg,
    sgst: sg,
    igst: ig,
    igstRate,   // ⭐ ADD
    total: taxable + cg + sg + ig
  };
});
    /* ================= CALCULATE CHARGES ================= */
    let chargeSubtotal = 0;

    const computedCharges = allCharges.map(c => {
  const amt = +c.amount || 0;
  const taxRate = +c.taxPercent || 0;

  let cg = 0, sg = 0, ig = 0;

  if (isInterState) {
    ig = amt * taxRate / 100;
  } else {
    cg = amt * (taxRate / 2) / 100;
    sg = amt * (taxRate / 2) / 100;
  }

  chargeSubtotal += amt;
  cgstTotal += cg;
  sgstTotal += sg;
  igstTotal += ig;

  return {
    label: c.label,
    amount: amt,
     taxPercent: taxRate, 
    cgst: cg,
    sgst: sg,
    igst: ig,
    total: amt + cg + sg + ig
  };
});

    const subtotal = itemSubtotal + chargeSubtotal;
    const totalTax = cgstTotal + sgstTotal + igstTotal;
    const grandTotal = subtotal + totalTax;

    /* ================= TABLE ROWS ================= */
    const itemRows = computedItems.map((x, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${x.description}</td>
        <td>${x.hsn}</td>
        <td>${x.qty}</td>
        <td>${x.rate.toFixed(2)}</td>
        <td>${x.discount}%</td>
        <td>${x.amount.toFixed(2)}</td>
        <td>${x.cgst.toFixed(2)}</td>
        <td>${x.sgst.toFixed(2)}</td>
        <td>${x.igst.toFixed(2)}</td>
        <td>${x.total.toFixed(2)}</td>
      </tr>
    `).join("");

    const chargeRows = computedCharges.map(c => `
      <tr>
        <td></td>
        <td>${c.label}</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td>${c.amount.toFixed(2)}</td>
        <td>${c.cgst.toFixed(2)}</td>
        <td>${c.sgst.toFixed(2)}</td>
        <td>${c.igst.toFixed(2)}</td>
        <td>${c.total.toFixed(2)}</td>
      </tr>
    `).join("");

    /* ================= HTML ================= */
     const html = buildHTML({
      proposal,
      sender,
      computedItems,
      charges: computedCharges,
      subtotal,
      cgstTotal,
      sgstTotal,
      igstTotal,
      totalTax,
      grandTotal,
      formattedDate
    });

    /* ================= PDFSHIFT ================= */
    const pdfRes = await fetch("https://api.pdfshift.io/v3/convert/pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from("api:" + process.env.PDFSHIFT_API_KEY).toString("base64"),
      },
      body: JSON.stringify({
        source: html,
        format: "A4",
        use_print: true,
      }),
    });

    const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${proposal.proposal_number}.pdf"`,
      },
    });
  } catch (e) {
    console.error(e);
    return Response.json({ message: "PDF error" }, { status: 500 });
  }
}