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

function getCopyLabel(type) {
  switch (type) {
    case "duplicate":  return "Duplicate Copy";
    case "triplicate": return "Triplicate Copy";
    case "transport":  return "Transport Copy";
    default:           return "Original for Recipient";
  }
}

function formatDate(d) {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}-${m}-${y}`;
}

// ✅ Only THIS branch gets the two-invoice SEZ split (Product + Charges)
const SEZ_SPLIT_BRANCH_ID = 27;

/* ================= HTML TEMPLATE ================= */
function buildHTML(data) {
  const {
    invoice, proposal, sender, computedItems, charges: computedCharges,
    subtotal, cgstTotal, sgstTotal, igstTotal,
    totalTax, grandTotal, isSEZ, copyLabel,
  } = data;

  const stateMap = {
    "01": "Jammu and Kashmir", "02": "Himachal Pradesh", "03": "Punjab",
    "04": "Chandigarh", "05": "Uttarakhand", "06": "Haryana", "07": "Delhi",
    "08": "Rajasthan", "09": "Uttar Pradesh", "10": "Bihar", "11": "Sikkim",
    "12": "Arunachal Pradesh", "13": "Nagaland", "14": "Manipur", "15": "Mizoram",
    "16": "Tripura", "17": "Meghalaya", "18": "Assam", "19": "West Bengal",
    "20": "Jharkhand", "21": "Odisha", "22": "Chhattisgarh", "23": "Madhya Pradesh",
    "24": "Gujarat", "25": "Daman and Diu", "26": "Dadra and Nagar Haveli",
    "27": "Maharashtra", "28": "Andhra Pradesh", "29": "Karnataka", "30": "Goa",
    "31": "Lakshadweep", "32": "Kerala", "33": "Tamil Nadu", "34": "Puducherry",
    "35": "Andaman and Nicobar Islands", "36": "Telangana",
    "37": "Andhra Pradesh (New)", "38": "Ladakh"
  };

  const clientStateCode = (invoice.buyer_gstin || proposal.gstin || "").substring(0, 2);
  const senderStateCode = (invoice.seller_gstin || sender.gstin || "").substring(0, 2);
  const isSelf = proposal.billing_type === "self";

  const companyName = proposal.company || "";
  const pureCompany = companyName.includes("(")
    ? companyName.split("(").pop().replace(")", "").trim()
    : companyName;

  const billingAddress  = proposal.billing_address  || "";
  const shippingAddress = proposal.shipping_address || billingAddress;

  const clientStateName = stateMap[clientStateCode] || "";
  const senderStateName = stateMap[senderStateCode] || "";
  const isIGST = isSEZ || (clientStateCode !== senderStateCode);

  const itemRows = computedItems.map((x, i) => `
<tr>
<td>${i + 1}</td>
<td class="left">${x.description || ""}</td>
<td>${x.hsn || ""}</td>
<td>${x.qty}</td>
<td>${x.rate.toFixed(2)}</td>
<td>${x.amount.toFixed(2)}</td>
<td>${x.amount.toFixed(2)}</td>
<td>${isIGST ? "0" : (x.sgst_rate || 0)}</td>
<td>${isIGST ? "0.00" : x.sgst.toFixed(2)}</td>
<td>${isIGST ? "0" : (x.cgst_rate || 0)}</td>
<td>${isIGST ? "0.00" : x.cgst.toFixed(2)}</td>
<td>${isIGST ? (x.igstRate || 0) : "0"}</td>
<td>${isIGST ? x.igst.toFixed(2) : "0.00"}</td>
<td>${x.total.toFixed(2)}</td>
</tr>`).join("");

  const chargeRows = computedCharges.map(c => `
<tr>
<td></td>
<td class="left">${c.label}</td>
<td>${c.hsnCode || ""}</td>
<td></td><td></td>
<td>${c.amount.toFixed(2)}</td>
<td>${c.amount.toFixed(2)}</td>
<td>${(c.sgst > 0 ? (c.taxPercent / 2).toFixed(2) : "0")}</td>
<td>${c.sgst.toFixed(2)}</td>
<td>${(c.cgst > 0 ? (c.taxPercent / 2).toFixed(2) : "0")}</td>
<td>${c.cgst.toFixed(2)}</td>
<td>${(c.igst > 0 ? c.taxPercent.toFixed(2) : "0")}</td>
<td>${c.igst.toFixed(2)}</td>
<td>${c.total.toFixed(2)}</td>
</tr>`).join("");

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
@page{ size:A4; margin:0; }
body{ margin:0; padding:10mm; font-family:Segoe UI,Arial,sans-serif; }
.page{ width:100%; min-height:277mm; display:flex; flex-direction:column; }
.hdr{ position:relative; display:flex; justify-content:flex-end; margin-bottom:14px; min-height:140px; width:100%; }
.hdr-motif{ position:fixed; left:0; top:0; width:150px; height:auto; z-index:9999; }
.hdr-right{ display:flex; flex-direction:column; align-items:flex-end; max-width:220px; }
.hdr-right img{ width:190px; height:60px; object-fit:contain; margin-bottom:6px; margin-right:35px; }
.hdr-text{ font-size:10px; line-height:15px; text-align:left; width:100%; }
.box{ margin-top:60px; border:1px solid #8c8c8c; }
.strip{ background:#f2f2f2; text-align:center; font-weight:700; font-size:12px; padding:5px 0; border-bottom:1px solid #8c8c8c; }
.meta{ width:100%; border-collapse:collapse; font-size:10px; }
.meta td{ border-bottom:1px dotted #b7b7b7; padding:4px 6px; }
.meta td.label{ width:160px; font-weight:600; }
.meta td.value{ width:260px; }
.party{ width:100%; border-collapse:collapse; font-size:10px; }
.party td{ border-top:1px dotted #b7b7b7; padding:6px; vertical-align:top; }
.party .title{ font-weight:700; margin-bottom:2px; }
.items{ width:100%; border-collapse:collapse; font-size:8.5px; }
.items th,.items td{ border-right:1px dotted #b7b7b7; border-bottom:1px dotted #b7b7b7; padding:3px 4px; }
.items th:last-child,.items td:last-child{ border-right:none; }
.items th{ background:#efefef; font-weight:700; }
.items td{ text-align:center; }
.items td.left{ text-align:left; }
.items tr.total td{ font-weight:700; }
.amt{ display:grid; grid-template-columns:1fr 320px; border-top:1px dotted #b7b7b7; }
.amt-words{ flex:0 0 48%; padding:8px; font-size:9.5px; text-align:center; border-right:1px dotted #b5b5b5; }
.totals{ padding:0; }
.totals table{ width:100%; border-collapse:collapse; font-size:10px; }
.totals td{ border-bottom:1px dotted #b7b7b7; padding:4px 6px; text-align:right; }
.totals td:first-child{ text-align:left; }
.bank{ display:grid; grid-template-columns:1fr 1fr; border-top:1px dotted #b7b7b7; }
.bank-left{ padding:8px; border-right:1px dotted #b7b7b7; font-size:10px; line-height:15px; }
.bank-right{ padding:8px; text-align:center; font-size:10px; }
.footer-wrap{ margin-top:auto; }
.thankyou{ text-align:center; margin:10px 0 4px 0; font-size:16px; font-weight:bold; }
.copy-row{ text-align:right; font-size:10px; font-weight:600; padding:4px 8px; font-style:italic; border-bottom:1px solid #8c8c8c; }
.footer{ background:#cfd84e; display:flex; align-items:center; justify-content:space-between; padding:15px 12px; font-size:10px; margin-left:-10mm; margin-right:-10mm; margin-bottom:-10mm; }
</style>
</head>
<body>
<div class="page">
<div class="hdr">
  <div class="hdr-right">
    ${sender.logo ? `<img src="${sender.logo}">` : `<div style="height:60px;"></div>`}
    <div class="hdr-text"></div>
  </div>
</div>
<div class="box">
<div class="strip">Challan cum Tax Invoice</div>
<div class="copy-row">${copyLabel}</div>
<table class="meta">
<tr>
  <td class="label">Invoice No:</td><td class="value">${invoice.invoice_number}</td>
  <td class="label">Transport Mode:</td><td class="value">${invoice.transport_mode || ""}</td>
</tr>
<tr>
  <td class="label">Invoice Date:</td><td class="value">${formatDate(invoice.invoice_date)}</td>
  <td class="label">Vehicle number:</td><td class="value">${invoice.vehicle_number || ""}</td>
</tr>
<tr>
  <td class="label">Challan No:</td><td class="value">${invoice.challan_number || ""}</td>
  <td class="label">Challan Date:</td><td class="value">${formatDate(invoice.challan_date)}</td>
</tr>
<tr>
  <td class="label">Purchase Order No:</td><td class="value">${invoice.po_number || ""}</td>
  <td class="label">Date of Supply:</td><td class="value">${formatDate(invoice.supply_date || "")}</td>
</tr>
<tr>
  <td class="label">Purchase Order Date:</td><td class="value">${formatDate(invoice.po_date)}</td>
  <td class="label">Place of Supply:</td><td class="value">${invoice.place_of_supply || ""}</td>
</tr>
<tr>
  <td class="label">GSTIN:</td><td class="value">${sender.gstin || ""}</td>
  <td class="label">Contact Person:</td><td class="value">${proposal.client_name || ""}</td>
</tr>
<tr>
  <td class="label">State:</td><td class="value">${senderStateName}</td>
  <td class="label">Contact Number:</td><td class="value">${proposal.client_phone || ""}</td>
</tr>
</table>
<table class="party">
<td>
  <div class="title">Bill to Party</div>
  Name: ${companyName}<br>
  Address: ${billingAddress}<br>
  GSTIN: ${isSelf ? "" : (proposal.gstin || "")}<br>
  State: ${clientStateName} &nbsp;&nbsp;&nbsp; Code: ${clientStateCode}
</td>
<td>
  <div class="title">Ship to Party</div>
  Name: ${companyName}<br>
  Address: ${shippingAddress}<br>
  GSTIN: ${isSelf ? "" : (proposal.gstin || "")}<br>
  State: ${clientStateName} &nbsp;&nbsp;&nbsp; Code: ${clientStateCode}
</td>
</table>
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
  <td>${subtotal.toFixed(2)}</td><td>${subtotal.toFixed(2)}</td>
  <td></td><td>${sgstTotal.toFixed(2)}</td>
  <td></td><td>${cgstTotal.toFixed(2)}</td>
  <td></td><td>${igstTotal.toFixed(2)}</td>
  <td>${grandTotal.toFixed(2)}</td>
</tr>
</tbody>
</table>
<div class="amt">
  <div class="amt-words">
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
<div class="bank">
  <div class="bank-left">
    <b>Bank Details</b><br>
    Bank Name: ${sender.bank_name || "-"}<br>
    A/C No: ${sender.bank_account || "-"}<br>
    IFSC: ${sender.bank_ifsc || "-"}<br>
    Branch: ${sender.bank_branch || "-"}<br><br>
    Interest @24% Per Annum will be charged on overdue bills<br>
    Contact: ${sender.phone || ""} | ${sender.email || ""}
  </div>
  <div class="bank-right" style="position:relative;">
    <div style="text-align:center; font-weight:600;">For Manik Trifaley Design Studio Pvt Ltd</div>
    <div style="text-align:center; position:absolute; bottom:10px; width:100%;">Authorised Signatory & Stamp</div>
  </div>
</div>
</div>
<div style="text-align:center; font-size:10px; margin-top:6px;">
  This is a computer-generated invoice.
</div>
</div>
</body>
</html>`;
}

export async function GET(req, { params }) {
  try {
    const { rfqid } = await params;
    const proposalId = Number(rfqid);
    const { searchParams } = new URL(req.url);
    const copyType    = searchParams.get("copyType") || "original";
    const invoiceType = searchParams.get("type"); // "product" or "charges"

    /* ================= FETCH PROPOSAL ================= */
    const [[proposal]] = await db.query(`
      SELECT 
        p.id,
        p.company_id,
        p.proposal_number,
        p.proposal_date,
        p.billing_address,
        p.shipping_address,
        CASE 
          WHEN r.billing_type = 'self' THEN p.company_name
          ELSE c.company_name
        END AS company,
        cb.gstin,
        cb.sez_type,
        cb.id AS branch_id,
        r.client_name,
        r.client_phone,
        r.billing_type
      FROM proposals p
      JOIN rfqs r        ON r.id = p.rfq_id
      JOIN companies c   ON c.id = r.company_id
      JOIN company_branches cb ON cb.id = r.branch_id
      WHERE p.id = ?
    `, [proposalId]);

    if (!proposal)
      return Response.json({ message: "Proposal not found" }, { status: 404 });

    /* ================= SEZ SPLIT LOGIC ================= */
    // ✅ Only branch_id = 27 gets the two-invoice split (Product + Charges)
    // All other SEZ branches generate a single combined invoice
    const isSEZSplit = Number(proposal.branch_id) === SEZ_SPLIT_BRANCH_ID;
    const isSEZ      = proposal.sez_type?.toLowerCase() === "sez";

    /* ================= FETCH INVOICE ================= */
    const [rows] = await db.query(`
      SELECT 
        id,
        invoice_number,
        invoice_type,
        DATE_FORMAT(invoice_date,  '%Y-%m-%d') AS invoice_date,
        DATE_FORMAT(supply_date,   '%Y-%m-%d') AS supply_date,
        place_of_supply,
        po_number,
        DATE_FORMAT(po_date,       '%Y-%m-%d') AS po_date,
        transport_mode,
        vehicle_number,
        challan_number,
        DATE_FORMAT(challan_date,  '%Y-%m-%d') AS challan_date,
        buyer_gstin,
        seller_gstin
      FROM invoices
      WHERE proposal_id = ?
      ${isSEZSplit && invoiceType ? "AND invoice_type = ?" : ""}
      ORDER BY id DESC
      LIMIT 1
    `, isSEZSplit && invoiceType ? [proposalId, invoiceType] : [proposalId]);

    const invoice = rows[0];
    if (!invoice)
      return Response.json({ message: "Invoice not found" }, { status: 404 });

    const [[sender]] = await db.query(`SELECT * FROM company_info LIMIT 1`);

    /* ================= STATE / TAX LOGIC ================= */
    const clientStateCode = invoice.buyer_gstin?.substring(0, 2) || "";
    const senderStateCode = invoice.seller_gstin?.substring(0, 2) || "";
    const isInterState    = clientStateCode !== senderStateCode;

    /* ================= ITEMS ================= */
    const [items] = await db.query(`
      SELECT 
        pi.quantity qty,
        pi.rate,
        pi.discount,
        pi.cgst_rate,
        pi.sgst_rate,
        pi.igst_rate,
        CASE 
          WHEN cpp.prefix IS NOT NULL AND cpp.prefix != ''
          THEN CONCAT(cpp.prefix, ' | ', pr.product_name)
          ELSE pr.product_name
        END AS description,
        pr.hsn
      FROM proposal_items pi
      JOIN products pr ON pr.id = pi.product_id
      LEFT JOIN company_product_pricing cpp
        ON cpp.product_id = pr.id AND cpp.company_id = ?
      WHERE pi.proposal_id = ?
      ORDER BY pi.id
    `, [proposal.company_id, proposal.id]);

    /* ================= CHARGES ================= */
    const [companyCharges]  = await db.query(`
      SELECT label, amount, tax_percent taxPercent
      FROM company_charges WHERE company_id = ?
    `, [proposal.company_id]);

    const [proposalCharges] = await db.query(`
      SELECT label, amount, tax_percent AS taxPercent, hsn_code AS hsnCode
      FROM proposal_charges WHERE proposal_id = ?
    `, [proposal.id]);

    const allCharges = proposalCharges.length ? proposalCharges : companyCharges;

    /* ================= CALCULATE ================= */
    let cgstTotal = 0, sgstTotal = 0, igstTotal = 0;

    const computedItems = items.map(i => {
      const qty      = +i.qty  || 0;
      const rate     = +i.rate || 0;
      const disc     = +i.discount || 0;
      const taxable  = qty * rate;
      const igstRate = (+i.igst_rate || 0) || ((+i.cgst_rate || 0) + (+i.sgst_rate || 0));
      let cg = 0, sg = 0, ig = 0;

      if (isInterState || isSEZ) {
        ig = taxable * igstRate / 100;
      } else {
        cg = taxable * (+i.cgst_rate || 0) / 100;
        sg = taxable * (+i.sgst_rate || 0) / 100;
      }
      cgstTotal += cg; sgstTotal += sg; igstTotal += ig;

      return { ...i, qty, rate, discount: disc, amount: taxable, cgst: cg, sgst: sg, igst: ig, igstRate, total: taxable + cg + sg + ig };
    });

    const computedCharges = allCharges.map(c => {
      const amt     = +c.amount     || 0;
      const taxRate = +c.taxPercent || 0;
      let cg = 0, sg = 0, ig = 0;

      if (isInterState || isSEZ) {
        ig = amt * taxRate / 100;
      } else {
        cg = amt * (taxRate / 2) / 100;
        sg = amt * (taxRate / 2) / 100;
      }
      cgstTotal += cg; sgstTotal += sg; igstTotal += ig;

      return { label: c.label, hsnCode: c.hsnCode || "", amount: amt, taxPercent: taxRate, cgst: cg, sgst: sg, igst: ig, total: amt + cg + sg + ig };
    });

    /* ================= FILTER FOR SEZ SPLIT ================= */
    // ✅ Only split items/charges if this is branch_id = 27
    // Other SEZ branches always get a single combined invoice
    let finalItems   = computedItems;
    let finalCharges = computedCharges;

    if (isSEZSplit) {
      if (invoice.invoice_type === "product")  finalCharges = [];
      if (invoice.invoice_type === "charges")  finalItems   = [];
    }

    /* ================= TOTALS ================= */
    let subtotal = 0, finalCgst = 0, finalSgst = 0, finalIgst = 0;

    finalItems.forEach(i => {
      subtotal   += i.amount;
      finalCgst  += i.cgst;
      finalSgst  += i.sgst;
      finalIgst  += i.igst;
    });
    finalCharges.forEach(c => {
      subtotal   += c.amount;
      finalCgst  += c.cgst;
      finalSgst  += c.sgst;
      finalIgst  += c.igst;
    });

    const totalTax   = finalCgst + finalSgst + finalIgst;
    const grandTotal = subtotal + totalTax;

    /* ================= RENDER ================= */
    const html = buildHTML({
      invoice, proposal, sender,
      computedItems:  finalItems,
      charges:        finalCharges,
      subtotal,
      cgstTotal:  finalCgst,
      sgstTotal:  finalSgst,
      igstTotal:  finalIgst,
      totalTax,
      grandTotal,
      isSEZ,
      copyLabel: getCopyLabel(copyType),
    });

    /* ================= PDF ================= */
    const pdfRes = await fetch("https://api.pdfshift.io/v3/convert/pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + Buffer.from("api:" + process.env.PDFSHIFT_API_KEY).toString("base64"),
      },
      body: JSON.stringify({ source: html, format: "A4", use_print: true }),
    });

    const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());
    const invoiceNo = invoice.invoice_number || `INV-${invoice.id}`;
    const copyShortMap = { original: "OR", duplicate: "DUP", triplicate: "TRI", transport: "TRANS" };
    const copyShort = copyShortMap[copyType] || "OR";

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type":        "application/pdf",
        "Content-Disposition": `attachment; filename="${invoiceNo}_${copyShort}.pdf"`,
      },
    });

  } catch (e) {
    console.error(e);
    return Response.json({ message: "PDF error" }, { status: 500 });
  }
}