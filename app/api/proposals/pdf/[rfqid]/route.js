import PDFDocument from "pdfkit";
import { db } from "../../../../db";
import fs from "fs";
import path from "path";

/* ================= NUMBER TO WORDS ================= */
function numberToWords(num) {
  if (!num) return "Zero Only";

  const a = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const b = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];

  const inWords = (n)=>{
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
const rfqId=Number(rfqid);
if(!rfqid||isNaN(rfqId)) return Response.json({message:"Invalid rfqId"},{status:400});

/* ================= FETCH ================= */
const [[proposal]]=await db.query(`
SELECT p.id,p.company_id,p.proposal_number,p.proposal_date,
p.billing_address,c.company_name AS company,
cb.gstin,r.client_name,r.client_phone
FROM proposals p
JOIN rfqs r ON r.id=p.rfq_id
JOIN companies c ON c.id=r.company_id
JOIN company_branches cb ON cb.id=r.branch_id
WHERE p.rfq_id=? LIMIT 1`,[rfqId]);

if(!proposal) return Response.json({message:"Not found"},{status:404});

/* ================= ITEMS ================= */
const [items]=await db.query(`
SELECT pi.quantity qty,pi.rate,pi.discount,
pi.cgst_rate cgst,pi.sgst_rate sgst,pi.igst_rate igst,
pr.product_name description,pr.hsn
FROM proposal_items pi
JOIN products pr ON pr.id=pi.product_id
WHERE pi.proposal_id=? ORDER BY pi.id`,[proposal.id]);

/* ================= CHARGES ================= */
const [charges]=await db.query(`
SELECT label,amount,tax_percent taxPercent
FROM company_charges WHERE company_id=?`,[proposal.company_id]);

/* ================= CALC ================= */
let subtotal=0,cgstTotal=0,sgstTotal=0,igstTotal=0;

const computedItems = items.map(i => {

  const qty = Number(i.qty || 0);
  const rate = Number(i.rate || 0);
  const discount = Number(i.discount || 0);
  const cgstRate = Number(i.cgst || 0);
  const sgstRate = Number(i.sgst || 0);
  const igstRate = Number(i.igst || 0);

  const amt = qty * rate - (qty * rate * discount) / 100;
  const cg = (amt * cgstRate) / 100;
  const sg = (amt * sgstRate) / 100;
  const ig = (amt * igstRate) / 100;
  const tot = amt + cg + sg + ig;

  subtotal += amt;
  cgstTotal += cg;
  sgstTotal += sg;
  igstTotal += ig;

  return {
    ...i,
    qty,
    rate,
    discount,
    cgst: cg,
    sgst: sg,
    igst: ig,
    amount: amt,
    total: tot
  };
});


let chargesAmount=0,chargesTax=0;
charges.forEach(c=>{
chargesAmount+=Number(c.amount||0);
chargesTax+=(Number(c.amount||0)*(c.taxPercent||0))/100;
});

const totalTax=cgstTotal+sgstTotal+igstTotal+chargesTax;
const grandTotal=subtotal+totalTax+chargesAmount;

const seller={
name:proposal.company,
gstin:proposal.gstin,
bankName:"HDFC Bank",
bankAcc:"50200012345678",
bankIfsc:"HDFC0001234",
bankBranch:"Pune",
phone:"+91 98765 43210",
email:"support@indihands.com"
};

const formattedDate=new Date(proposal.proposal_date).toISOString().slice(0,10);

/* ================= PDF ================= */
const logoPath=path.join(process.cwd(),"public/materialize/assets/img/favicon/favicon.png");
const openSansRegular=path.join(process.cwd(),"public/fonts/OpenSans_Condensed-Regular.ttf");
const openSansBold=path.join(process.cwd(),"public/fonts/OpenSans_Condensed-Bold.ttf");

const doc=new PDFDocument({size:"A4",margin:40,font:openSansRegular});
const buffers=[];doc.on("data",buffers.push.bind(buffers));

doc.registerFont("regular",openSansRegular);
doc.registerFont("bold",openSansBold);

/* ===== HEADER PPT PERFECT ===== */

const motifPath = path.join(process.cwd(), "public/ppt/motif.png");
const logoPath1 = path.join(process.cwd(), "public/ppt/logo.png");

/* LEFT MOTIF */
if (fs.existsSync(motifPath)) {
  doc.image(motifPath, 40, 30, { width: 150 });
}

/* RIGHT LOGO */
if (fs.existsSync(logoPath1)) {
  doc.image(logoPath1, 380, 30, { width: 130 });
}

/* RIGHT ADDRESS */
doc.font("regular").fontSize(9).fillColor("#333");

let hy = 85;
doc.text("Registered Office", 380, hy);
hy += 12;
doc.text("301, Meghna, Ranwara,", 380, hy);
hy += 11;
doc.text("Tal. Mulshi, Bavdhan, Haveli,", 380, hy);
hy += 11;
doc.text("Pune- 411021, Maharashtra", 380, hy);
hy += 11;
doc.text("www.mtds.co.in | manik@mtds.co.in", 380, hy);
hy += 11;
doc.text("+91.9822.513.937", 380, hy);

/* BEIGE STRIP (ONLY ONE) */
const stripY = 160;

doc.rect(40, stripY, 515, 14).fill("#d8c5ad");

doc.fillColor("black")
  .font("bold")
  .fontSize(11)
  .text("Quotation", 40, stripY + 4, {
    width: 515,
    align: "center"
  });
const stripH = 12;

doc.rect(40, stripY, 515, stripH).fill("#d8c5ad");

doc.fillColor("black")
  .font("bold")
  .fontSize(11)
  .text("Quotation", 40, stripY + (stripH/2) - 4, {   // PERFECT CENTER
    width: 515,
    align: "center"
  });

/* start content BELOW strip */
let y = stripY + 26;

/* ===== META BOX PERFECT ===== */
y += 18;

doc.font("regular").fontSize(8.8);

const startX = 46;
const maxWidth = 500;
const lineGap = 2;

let lines = [
  `Quotation No: ${proposal.proposal_number}`,
  `Quotation Date: ${formattedDate}`,
  `Quotation Validity: One month from quotation date`,
  `GSTIN: ${proposal.gstin}`,
  `State: Maharashtra | State code 27`,
  `Contact Person: ${proposal.client_name}`,
  `Contact Details: ${proposal.client_phone}`,
  `Company name: ${proposal.company}`,
  `Address: ${proposal.billing_address}`
];

/* --- calculate total height --- */
let contentHeight = 0;

lines.forEach(t => {
  contentHeight += doc.heightOfString(t, { width: maxWidth }) + lineGap;
});

/* padding top+bottom */
const padding = 6;
const boxHeight = contentHeight + padding * 2;

/* draw box */
doc.rect(40, y, 515, boxHeight).stroke("#cfcfcf");

/* print text */
let cy = y + padding;

lines.forEach((t, i) => {
  doc.text(t, startX, cy, { width: maxWidth });
  cy += doc.heightOfString(t, { width: maxWidth }) + lineGap;
});

/* move cursor below box */
y += boxHeight + 12;


/* ===== TABLE ===== */
const colX=[40,60,230,270,300,335,370,410,445,480,515];
const colW=[20,170,40,30,35,35,40,35,35,35,40];

doc.font("bold").fontSize(8.6);
const headers=["S.","Product Description","HSN/SAC","Qty","Cost","Disc","Amt.","SGST","CGST","IGST","Total"];
headers.forEach((h,i)=>{
doc.rect(colX[i],y,colW[i],18).stroke("#cfcfcf");
doc.text(h,colX[i]+2,y+4,{width:colW[i]-4,align:"center"});
});
y+=18;

doc.font("regular").fontSize(8.5);

computedItems.forEach((x,i)=>{
colX.forEach((cx,idx)=>doc.rect(cx,y,colW[idx],20).stroke("#e0e0e0"));

doc.text(i+1,colX[0]+2,y+5,{width:colW[0]-4,align:"center"});
doc.text(x.description,colX[1]+2,y+5,{width:colW[1]-4});
doc.text(x.hsn,colX[2]+2,y+5,{width:colW[2]-4,align:"center"});
doc.text(x.qty.toFixed(0),colX[3]+2,y+5,{width:colW[3]-4,align:"right"});
doc.text(x.rate.toFixed(0),colX[4]+2,y+5,{width:colW[4]-4,align:"right"});
doc.text(x.discount.toFixed(0),colX[5]+2,y+5,{width:colW[5]-4,align:"right"});
doc.text(x.amount.toFixed(0),colX[6]+2,y+5,{width:colW[6]-4,align:"right"});
doc.text("",colX[7]+2,y+5,{width:colW[7]-4});
doc.text("",colX[8]+2,y+5,{width:colW[8]-4});
doc.text(x.igst.toFixed(0),colX[9]+2,y+5,{width:colW[9]-4,align:"right"});
doc.text(x.total.toFixed(0),colX[10]+2,y+5,{width:colW[10]-4,align:"right"});

y+=20;
});

/* ===== TOTAL ROW ===== */
doc.font("bold");
colX.forEach((cx,idx)=>doc.rect(cx,y,colW[idx],18).stroke("#cfcfcf"));
doc.text("Total",colX[1]+2,y+4);
doc.text(grandTotal.toFixed(0),colX[10]+2,y+4,{width:colW[10]-4,align:"right"});
y+=24;

/* ===== AMOUNT WORDS ===== */
doc.font("regular").fontSize(9)
.text("Total quotation amount in words",40,y,{width:515,align:"center"});
y+=12;
doc.font("bold").text(numberToWords(grandTotal),40,y,{width:515,align:"center"});

/* ===== RIGHT TOTAL GRID (PPT PERFECT, NO OVERLAP) ===== */

/* start BELOW amount words */
let tx = 350;
let ty = y + 10;   // always below previous content

const labelW = 140;
const valueW = 65;
const rowH = 18;

doc.font("regular").fontSize(8.6);

const totals = [
  ["Total Amount before Tax", subtotal],
  ["Add: CGST", cgstTotal],
  ["Add: SGST", sgstTotal],
  ["Add: IGST", igstTotal],
  ["Total Tax Amount", totalTax],
  ["Total Amount after Tax", grandTotal],
  ["GST on Reverse", 0],
  ["Charge", 0]
];

totals.forEach(([label, val]) => {
  doc.rect(tx, ty, labelW, rowH).stroke("#cfcfcf");
  doc.rect(tx + labelW, ty, valueW, rowH).stroke("#cfcfcf");

  doc.text(label, tx + 4, ty + 4, { width: labelW - 8 });
  doc.text(Number(val).toFixed(0), tx + labelW + 4, ty + 4, {
    width: valueW - 8,
    align: "right"
  });

  ty += rowH;
});

/* move main cursor BELOW totals block */
y = Math.max(y, ty) + 12;


/* ===== BANK ===== */
y+=5;
doc.font("bold").text("Bank Details",40,y);
doc.font("regular");
y+=12;
doc.text(`Bank A/C: ${seller.bankAcc}`,40,y);
doc.text(`Bank: ${seller.bankName}`,300,y);
y+=12;
doc.text(`Bank IFSC: ${seller.bankIfsc}`,40,y);
doc.text(`Branch: ${seller.bankBranch}`,300,y);
y+=12;
doc.text(`Interest @ 24% Per Annum will be charged on overdue bills`,40,y);

/* ===== TERMS BOX ===== */
/* ===== TERMS BOX FIXED ===== */

y += 20;

doc.font("regular").fontSize(8.2);

const leftTerms = [
"1. Product Description: As per the approved production sample and/or product specification sheet. Although stringent quality guidelines are maintained, most of our products are handmade; therefore, very minor variations may occur in the final product.",
"2. Price: The price is inclusive of packaging as approved in the product specification sheet.",
"3. Delivery Charges: At actuals.",
"4. Taxes: GST applicable as per government norms.",
"5. Payment: Being a MSME vendor, payment within 45 days."
];

const rightTerms = [
"6. Production Time Frame: As per agreement.",
"7. Order Confirmation: On receipt of a formal Purchase Order on the company letterhead.",
"8. Changes in Product Specifications: No changes will be accepted once the Purchase Order is signed and sealed.",
"9. Force Majeure: This quotation is subject to standard Force Majeure terms and conditions.",
"10. Jurisdiction: All dealings under this quotation are subject to the jurisdiction of Pune courts.",
"11. Warranty: No warranty or guarantee is provided on this product."
];

const colWidth = 255;
const startY = y + 22;

/* measure heights */
let ly = startY;
leftTerms.forEach(t=>{
  doc.text(t, 46, ly, { width: colWidth });
  ly = doc.y + 4;
});
const leftEnd = ly;

doc.y = startY;

let ry = startY;
rightTerms.forEach(t=>{
  doc.text(t, 300, ry, { width: colWidth });
  ry = doc.y + 4;
});
const rightEnd = ry;

/* box height */
const boxH = Math.max(leftEnd, rightEnd) - y + 10;

/* draw box aligned */
doc.rect(40, y, 515, boxH)
   .fillAndStroke("#f3f3f3", "#cfcfcf");

/* title */
doc.fillColor("black");
doc.font("bold").fontSize(9)
  .text("Terms & Conditions", 40, y + 6, {
    width: 515,
    align: "center"
  });

doc.font("regular").fontSize(8.2);

/* left render */
ly = startY;
leftTerms.forEach(t=>{
  doc.text(t, 46, ly, { width: colWidth });
  ly = doc.y + 4;
});

/* right render */
ry = startY;
rightTerms.forEach(t=>{
  doc.text(t, 300, ry, { width: colWidth });
  ry = doc.y + 4;
});

y += boxH + 12;

/* ===== SIGN ===== */
y+=80;
doc.text("Customer Sign & Stamp",40,y);
doc.text("Authorised signatory & Stamp",380,y);

/* ===== FOOTER ===== */
doc.rect(40,790,515,20).fill("#8aa64f");
doc.fillColor("black").fontSize(9)
.text("CIN: U47735PN2025PTC244212",46,795);
doc.text("Wonders by Hands",420,795);

doc.end();

const pdfBuffer=await new Promise(r=>doc.on("end",()=>r(Buffer.concat(buffers))));

return new Response(pdfBuffer,{
status:200,
headers:{
"Content-Type":"application/pdf",
"Content-Disposition":`attachment; filename="${proposal.proposal_number}.pdf"`
}
});

}catch(err){
console.error(err);
return Response.json({message:"Server error"},{status:500});
}
}
