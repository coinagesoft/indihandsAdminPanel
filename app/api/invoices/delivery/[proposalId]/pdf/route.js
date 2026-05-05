// app/api/invoices/delivery/[proposalId]/pdf/route.js

import PDFDocument from "pdfkit";
import db from "../../../../../db";
import path from "path";
import fs from "fs";

export const runtime = "nodejs";

export async function GET(req, { params }) {
  try {
    const { proposalId } = await params;

    /* ================= FETCH LABEL ================= */
    const [saved] = await db.query(
      `SELECT * FROM delivery_labels WHERE proposal_id = ? ORDER BY updated_at DESC LIMIT 1`,
      [proposalId]
    );

    let labelData;

    if (saved.length) {
      const s = saved[0];
      labelData = {
        attn_name:        s.attn_name,
        contact_no:       s.contact_no,
        to_address:       s.to_address,
        from_name:        s.from_name,
        from_address:     s.from_address,
        from_contact:     s.from_contact,
        handle_with_care: !!s.handle_with_care,
      };
    } else {
      const [proposals] = await db.query(
        `SELECT shipping_address FROM proposals WHERE id = ?`,
        [proposalId]
      );
      const [rfqs] = await db.query(
        `SELECT client_name, client_phone FROM rfqs
         WHERE branch_id IN (SELECT branch_id FROM proposals WHERE id = ?)
         ORDER BY submitted_at DESC LIMIT 1`,
        [proposalId]
      );
      const p = proposals[0] || {};
      const r = rfqs[0] || {};
      labelData = {
        attn_name:        r.client_name  || "",
        contact_no:       r.client_phone || "",
        to_address:       p.shipping_address || "",
        from_name:        "MTDS",
        from_address:     "303, Meghana Apartment,\nD.S.K. Ranawara\nN.D.A. \u2013 Pashan Road, Bavdhan\nPune 411021",
        from_contact:     "9822513937 / 9026311152",
        handle_with_care: true,
      };
    }

    /* ================= FONTS ================= */
    const fontBold = path.join(process.cwd(), "public/fonts/Philosopher/Philosopher-Bold.ttf");

    if (!fs.existsSync(fontBold)) {
      return Response.json(
        { message: "Font file missing", error: "Ensure public/fonts/Philosopher/Philosopher-Bold.ttf exists" },
        { status: 500 }
      );
    }

    /* ================= LAYOUT CONSTANTS ================= */
    const PAGE_W    = 595.28;
    const MARGIN    = 60;
    const CONTENT_W = PAGE_W - MARGIN * 2;
    const SIZE      = 20;       // ← 20pt, bold for ALL text
    const LINE_GAP  = 10;

    /* ================= DOC ================= */
    const doc = new PDFDocument({
      size:          "A4",
      margin:        0,
      autoFirstPage: true,
      font:          fontBold,  // ← always bold, fixes Windows Helvetica.afm crash
    });

    const buffers = [];
    doc.on("data", (chunk) => buffers.push(chunk));

    doc.registerFont("Bold", fontBold);

    // Everything is Bold 20pt — single helper
    const B = () => doc.font("Bold").fontSize(SIZE).fillColor("black");

    /* ── underlined bold heading ── */
    const heading = (text, x, y) => {
      B();
      doc.text(text, x, y, { lineBreak: false });
      const w = doc.widthOfString(text);
      doc.moveTo(x, y + SIZE + 1).lineTo(x + w, y + SIZE + 1).lineWidth(1).stroke();
      return y + SIZE + LINE_GAP + 4;
    };

    /* ── bold label (no underline) ── */
    const labelLine = (text, x, y) => {
      B();
      doc.text(text, x, y, { lineBreak: false });
      return y + SIZE + LINE_GAP;
    };

    /* ── bold value, multi-line, uses doc.y after wrap ── */
    const valueLine = (text, x, y) => {
      B();
      doc.text(text || "-", x, y, { width: CONTENT_W });
      return doc.y + LINE_GAP;
    };

    /* ================= DRAW CONTENT ================= */
    let y = 70;
    const x = MARGIN;

    // Kind Attn:  ← bold + underlined
    y = heading("Kind Attn:", x, y);
    y = valueLine(labelData.attn_name, x, y);
    y += 8;

    // Contact no : ← bold only
    y = labelLine("Contact no :", x, y);
    y = valueLine(labelData.contact_no, x, y);
    y += 8;

    // Address: ← bold only
    y = labelLine("Address:", x, y);
    B();
    doc.text(labelData.to_address || "-", x, y, { width: CONTENT_W });
    y = doc.y + 22;

    // ── thin divider ──
    doc
      .moveTo(x, y)
      .lineTo(PAGE_W - MARGIN, y)
      .lineWidth(0.5)
      .strokeColor("#bbbbbb")
      .stroke()
      .strokeColor("black");
    y += 20;

    // From: ← bold + underlined
    y = heading("From:", x, y);
    y += 4;

    // From values — all bold
    B();
    doc.text(labelData.from_name, x, y, { width: CONTENT_W });
    y = doc.y + 6;

    doc.text(labelData.from_address, x, y, { width: CONTENT_W });
    y = doc.y + 6;

    doc.text("Contact no.: " + labelData.from_contact, x, y, { width: CONTENT_W });
    y = doc.y + 100;

    // Handle with Care ← bold + underlined
    if (labelData.handle_with_care) {
      heading("Handle with Care", x, y);
    }

    doc.end();

    const pdfBuffer = await new Promise((resolve) =>
      doc.on("end", () => resolve(Buffer.concat(buffers)))
    );

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type":        "application/pdf",
        "Content-Disposition": `attachment; filename="delivery_label_${proposalId}.pdf"`,
      },
    });

  } catch (err) {
    console.error("Delivery Label PDF Error:", err);
    return Response.json({ message: "Server error", error: err.message }, { status: 500 });
  }
}