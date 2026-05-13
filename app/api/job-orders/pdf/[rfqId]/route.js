export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "../../../../db";

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */

function formatDate(d) {
  if (!d) return "";
  const match = String(d).trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return "";
  const [, y, m, day] = match;
  return `${day}-${m}-${y}`;
}

function todayIN() {
  return new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/* ─────────────────────────────────────────
   HTML TEMPLATE
───────────────────────────────────────── */

function buildJobOrderHTML({ rfq, jobOrder, products, clientNames, sender }) {
  const totalQty = products.reduce((a, b) => a + Number(b.quantity || 0), 0);

  const includeLogo = (jobOrder.include_logo || "no").toLowerCase() === "yes";

  const productRows = products
    .map(
      (p, i) => `
<tr>
  <td style="text-align:center;">${i + 1}</td>
  <td class="left">${p.product_name || ""}</td>
  <td style="text-align:center;">${p.barcode || "-"}</td>
  <td style="text-align:center;">${p.quantity}</td>
</tr>`
    )
    .join("");

  const clientList = clientNames.length
    ? `<div class="cn-inline">
        ${clientNames.map((x) => `<span class="cn-inline-item">&bull; ${x}</span>`).join("")}
       </div>`
    : "<span style='color:#aaa;'>-</span>";

  /* YES / NO boxes — tick whichever matches include_logo */
  const yesBox = `<span class="chk-box">${includeLogo  ? "&#10003;" : "&nbsp;"}</span>`;
  const noBox  = `<span class="chk-box">${!includeLogo ? "&#10003;" : "&nbsp;"}</span>`;

  const logoRow = `
    <div class="logo-row">

      <!-- LOGO IMAGE -->
   

      <!-- YES -->
      <span class="chk-item">
        ${yesBox}
        <span class="chk-label">Yes</span>
      </span>

      <!-- NO -->
      <span class="chk-item">
        ${noBox}
        <span class="chk-label">No</span>
      </span>

    </div>`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
@page { size: A4 portrait; margin: 0; }
body {
  margin: 0;
  padding: 10mm;
  font-family: Segoe UI, Arial, sans-serif;
  font-size: 12px;
  color: #222;
}

.page { width: 100%; }

/* ── HEADER ── */
.hdr {
  position: relative;
  display: flex;
  justify-content: flex-end;
  margin-bottom: 14px;
  min-height: 140px;
  width: 100%;
}
.hdr-motif {
  position: fixed;
  left: 0; top: 0;
  width: 150px; height: auto;
  z-index: 9999;
}
.hdr-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  max-width: 200px;
}
.hdr-right img {
  width: 190px; height: auto;
  margin-bottom: 6px; margin-right: 15px;
}
.hdr-text {
  font-size: 10px;
  line-height: 15px;
  text-align: left;
  width: 100%;
}

/* ── OUTER BOX ── */
.box { border: 1px solid #8c8c8c; }
.strip {
  background: #f2f2f2;
  text-align: center;
  font-weight: 700;
  font-size: 13px;
  padding: 6px 0;
  border-bottom: 1px solid #8c8c8c;
  letter-spacing: 1px;
}

/* ── META TABLE ── */
.meta { width: 100%; border-collapse: collapse; font-size: 10px; }
.meta td { border-bottom: 1px dotted #b7b7b7; padding: 5px 8px; }
.meta td.label { width: 160px; font-weight: 600; color: #444; }
.meta td.value { width: 260px; }

/* ── SECTION HEADERS ── */
.sec-hdr {
  background: #efefef;
  font-weight: 700;
  font-size: 10.5px;
  padding: 5px 8px;
  border-bottom: 1px dotted #b7b7b7;
  border-top: 1px dotted #b7b7b7;
  letter-spacing: 0.5px;
}

/* ── PARTY TABLE ── */
.party { width: 100%; border-collapse: collapse; font-size: 10px; }
.party td { padding: 6px 8px; vertical-align: top; border-bottom: 1px dotted #b7b7b7; }
.party td.label { width: 160px; font-weight: 600; color: #444; }

/* ── PRODUCT ITEMS TABLE ── */
.items { width: 100%; border-collapse: collapse; font-size: 10px; }
.items th, .items td {
  border-right: 1px dotted #b7b7b7;
  border-bottom: 1px dotted #b7b7b7;
  padding: 5px 6px;
  text-align: center;
  vertical-align: middle;
}
.items th:last-child, .items td:last-child { border-right: none; }
.items th { background: #efefef; font-weight: 700; }
.items td.left { text-align: left; }
.items tr.total-row td { font-weight: 700; background: #f9f9f9; }

/* ── CLIENT NAME TAGS ── */
.cn-wrap {
  padding: 6px 10px;
  font-size: 10px;
  border-bottom: 1px dotted #b7b7b7;
  line-height: 1.6;
}
.cn-inline { line-height: 1.8; }
.cn-inline-item {
  display: inline-block;
  margin-right: 18px;
  margin-bottom: 4px;
  font-size: 10px;
}

/* ── COMPANY LOGO SECTION ── */
.logo-wrap {
  padding: 8px 10px;
  border-bottom: 1px dotted #b7b7b7;
}
.logo-row {
  display: flex;
  align-items: center;
  gap: 16px;
}
.logo-thumb {
  height: 32px;
  width: auto;
  object-fit: contain;
}
.chk-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
}
.chk-box {
  display: inline-block;
  width: 13px;
  height: 13px;
  border: 1.5px solid #444;
  border-radius: 2px;
  text-align: center;
  line-height: 12px;
  font-size: 11px;
  font-weight: 700;
  color: #111;
  flex-shrink: 0;
}
.chk-label { font-size: 10px; }

/* ── APPROVAL ── */
.approval { width: 100%; border-collapse: collapse; font-size: 10px; }
.approval th {
  background: #efefef; font-weight: 700;
  padding: 5px 8px; text-align: center;
  border-right: 1px dotted #b7b7b7;
  border-bottom: 1px dotted #b7b7b7;
}
.approval th:last-child { border-right: none; }
.approval td {
  height: 30px; padding: 6px 8px;
  vertical-align: bottom; text-align: center;
  border-right: 1px dotted #b7b7b7;
}
.approval td:last-child { border-right: none; }

/* ── COMPUTER NOTE ── */
.computer-note {
  text-align: center;
  font-size: 10px;
  color: #666;
  margin: 8px 0;
}

/* ── FOOTER ── */
.footer {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: #cfd84e;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  font-size: 10px;
}
</style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div class="hdr">
 
    <div class="hdr-right">
      <img src="https://res.cloudinary.com/dxb1whlam/image/upload/v1771752355/manik_trifaley_logo_white_bgdbsp.png">
      <div class="hdr-text">
        <b>Registered Office</b><br>
        ${sender.address_line1 || ""}<br>
        ${sender.city || ""}, ${sender.state || ""} - ${sender.pincode || ""}<br>
        ${sender.email || ""} | ${sender.phone || ""}<br>
        ${sender.website || ""}
      </div>
    </div>
  </div>

  <!-- OUTER BOX -->
  <div class="box">

    <div class="strip">Job Sheet</div>

    <!-- Meta -->
    <table class="meta">
      <tr>
        <td class="label">Job Order No :</td>
        <td class="value">${rfq.rfq_number || "-"}</td>
        <td class="label">Date :</td>
        <td class="value">${todayIN()}</td>
      </tr>
      <tr>
        <td class="label">Delivery Date :</td>
        <td class="value" colspan="3">${formatDate(jobOrder.delivery_date)}</td>
      </tr>
    </table>

    <!-- Client Details -->
    <div class="sec-hdr">Client Details</div>
    <table class="party">
      <tr>
        <td class="label">Contact Person :</td>
        <td>${rfq.client_name || "-"}</td>
      </tr>
      <tr>
        <td class="label">Company Name :</td>
        <td>${jobOrder.company_name || "-"}</td>
      </tr>
      <tr>
        <td class="label">Location :</td>
        <td>${jobOrder.location || "-"}</td>
      </tr>
      <tr>
        <td class="label">Delivery Instructions :</td>
        <td>${jobOrder.delivery_instructions || "-"}</td>
      </tr>
    </table>

    <!-- Product Details -->
    <div class="sec-hdr">Product Details</div>
    <table class="items">
      <thead>
        <tr>
          <th style="width:30px;">Sr</th>
          <th class="left">Product Name</th>
          <th style="width:90px;">Code</th>
          <th style="width:40px;">Qty</th>
        </tr>
      </thead>
      <tbody>
        ${productRows}
        <tr class="total-row">
          <td colspan="3" style="text-align:right;">Total Quantity</td>
          <td style="text-align:center;">${totalQty}</td>
        </tr>
      </tbody>
    </table>

    <!-- Client Names -->
    <div class="sec-hdr">Client Names</div>
${clientList &&
  clientList.trim() !== "-" &&
  clientList.trim() !== ""
  ? `
      <div class="cn-wrap" style="height:40px;">
        ${clientList}
      </div>
    `
  : `
      <div style="height:40px;"></div>
      
    `
}

    <!-- Company Logo -->
    <div class="sec-hdr">Company Logo</div>
    <div class="logo-wrap">${logoRow}</div>

    <!-- Approval -->
    <div class="sec-hdr">Approval</div>
    <table class="approval">
      <thead>
        <tr>
          <th>Prepared By</th>
          <th>Checked By</th>
          <th>Approved By</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${jobOrder.prepared_by || ""}</td>
          <td>${jobOrder.checked_by || ""}</td>
          <td>${jobOrder.approved_by || ""}</td>
        </tr>
      </tbody>
    </table>

  </div><!-- /.box -->

  <div class="computer-note">
    This is a computer-generated document.
  </div>

  <div class="footer">
    <span>Internal Job Order &bull; Indihands</span>
    <span>JO Ref: ${rfq.rfq_number || ""}</span>
  </div>

</div>
</body>
</html>`;
}

/* ─────────────────────────────────────────
   ROUTE HANDLER
───────────────────────────────────────── */

export async function GET(req, { params }) {
  try {
    const { rfqId } =await params;

    /* FETCH JOB ORDER */
    const [[jobOrder]] = await db.query(
      `SELECT *, DATE_FORMAT(delivery_date, '%Y-%m-%d') AS delivery_date
       FROM job_orders WHERE rfq_id = ?`,
      [rfqId]
    );

    if (!jobOrder) {
      return NextResponse.json(
        { message: "Job order not found" },
        { status: 404 }
      );
    }

    /* FETCH RFQ */
    const [[rfq]] = await db.query(
      `SELECT * FROM rfqs WHERE id = ?`,
      [rfqId]
    );

    if (!rfq) {
      return NextResponse.json(
        { message: "RFQ not found" },
        { status: 404 }
      );
    }

    /* FETCH SENDER */
    const [[sender]] = await db.query(`SELECT * FROM company_info LIMIT 1`);

    /* FETCH PRODUCTS */
    const [products] = await db.query(
      `SELECT
         rp.quantity,
         p.product_name,
         p.barcode,
         p.featured_image
       FROM rfq_products rp
       JOIN products p ON p.id = rp.product_id
       WHERE rp.rfq_id = ?`,
      [rfqId]
    );

    /* CLIENT NAMES */
    const clientNames = JSON.parse(jobOrder.client_names || "[]");

    /* GENERATE HTML */
    const html = buildJobOrderHTML({ rfq, jobOrder, products, clientNames, sender });

    /* PDFSHIFT */
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
        landscape: false,
        margin: {
          top: "10mm",
          bottom: "14mm",
          left: "10mm",
          right: "10mm",
        },
      }),
    });

    const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=JOB-${rfq.rfq_number}.pdf`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}