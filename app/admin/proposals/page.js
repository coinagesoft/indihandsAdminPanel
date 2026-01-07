"use client";

import React, { useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ProposalPage = () => {
  /* ================= CLIENT (dummy) ================= */
  const [client, setClient] = useState({
    quotationNo: "QTN-2026-001",
    name: "Mr. Naveen Kumar L R",
    company: "Tripeasy Consulting Services Pvt Ltd, Pune",
    gstin: "27ABCDE1234F1Z5",
    placeOfSupply: "Maharashtra (27)",
    date: "05.01.2026",
    email: "naveen.kumar@example.com",
  });

  /* ================= ITEMS (dummy) ================= */
  const [items, setItems] = useState([
    { id: Date.now(), desc: "1021 Sofa/Work Chair - Wood & Fabric", hsn: "41115100", uom: "Nos", qty: 24, cost: 245, discount: 11.11, gst: 18, freight: 0, taxType: "CGST_SGST" },
    { id: Date.now() + 1, desc: "1022 Ceramic Porcelain Tableware - Pack of 6", hsn: "48231000", uom: "Nos", qty: 12, cost: 555.88, discount: 108.18, gst: 18, freight: 0, taxType: "CGST_SGST" },
    { id: Date.now() + 2, desc: "1023 Office Modular Paper Stand", hsn: "48231000", uom: "Nos", qty: 12, cost: 121.11, discount: 21.11, gst: 18, freight: 0, taxType: "CGST_SGST" },
    { id: Date.now() + 3, desc: "Bundle Courier Charges", hsn: "998312", uom: "Nos", qty: 1, cost: 200, discount: 0, gst: 18, freight: 0, taxType: "CGST_SGST" },
  ]);

  /* ================= TERMS (dummy) ================= */
  const [terms, setTerms] = useState([
    "Payment within 15 days from invoice date.",
    "Delivery within 7 working days from order confirmation.",
    "Warranty as per manufacturer terms.",
    "Goods once sold will not be taken back.",
    "All disputes subject to Pune jurisdiction.",
  ]);

  /* ================= SIGN & STAMP ================= */
  const [signImg, setSignImg] = useState(null);
  const [stampImg, setStampImg] = useState(null);
  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => (type === "sign" ? setSignImg(reader.result) : setStampImg(reader.result));
    reader.readAsDataURL(file);
  };

const computed = useMemo(() => {
  return items.map(i => {
    const qty = Number(i.qty) || 0;
    const cost = Number(i.cost) || 0;
    const discount = Number(i.discount) || 0;
    const gst = Number(i.gst) || 0;
    const freight = Number(i.freight) || 0;

    const discountedCost = cost - discount;
    const amount = discountedCost * qty;
    const taxableValue = amount + freight;

    let cgstRate = 0, sgstRate = 0, igstRate = 0;
    let cgstAmt = 0, sgstAmt = 0, igstAmt = 0;

    if (i.taxType === "IGST") {
      igstRate = gst;
      igstAmt = (taxableValue * igstRate) / 100;
    } else {
      cgstRate = gst / 2;
      sgstRate = gst / 2;
      cgstAmt = (taxableValue * cgstRate) / 100;
      sgstAmt = (taxableValue * sgstRate) / 100;
    }

    const total = taxableValue + cgstAmt + sgstAmt + igstAmt;

    return {
      ...i,
      discountedCost,
      amount,
      taxableValue,
      cgstRate,
      sgstRate,
      igstRate,
      cgstAmt,
      sgstAmt,
      igstAmt,
      total,
    };
  });
}, [items]);

  const totalBeforeTax = computed.reduce((s, i) => s + i.taxableValue, 0);
  const cgstTotal = computed.reduce((s, i) => s + i.cgstAmt, 0);
  const sgstTotal = computed.reduce((s, i) => s + i.sgstAmt, 0);
  const igstTotal = computed.reduce((s, i) => s + i.igstAmt, 0);
  const totalTaxAmount = cgstTotal + sgstTotal + igstTotal;
  const grandTotal = totalBeforeTax + totalTaxAmount;
  const reverseChargeApplicable = false;

  /* ================= ITEM HANDLERS ================= */
  const updateItem = (id, field, value) => {
    setItems(prev =>
      prev.map(i =>
        i.id === id
          ? { ...i, [field]: ["qty", "cost", "discount", "gst", "freight"].includes(field) ? Number(value) : value }
          : i
      )
    );
  };

  const addItem = () => setItems(prev => [
    ...prev,
    {
      id: Date.now(),
      desc: "",      // placeholder shows
      hsn: "",       // placeholder shows
      uom: "",       // placeholder shows now
      qty: "",       // placeholder shows now
      cost: "",      // placeholder shows now
      discount: "",  // placeholder shows now
      gst: "",       // placeholder shows now
      freight: "",   // placeholder shows now
      taxType: "CGST_SGST"
    }
  ]);
  const removeItem = id => setItems(prev => prev.filter(i => i.id !== id));

  /* ================= TERMS HANDLERS ================= */
  const addTerm = () => setTerms(prev => [...prev, ""]);
  const updateTerm = (index, value) => { const copy = [...terms]; copy[index] = value; setTerms(copy); };
  const removeTerm = index => setTerms(prev => prev.filter((_, i) => i !== index));

  /* ================= NUMBER TO WORDS ================= */
  const numberToWords = (num) => {
    const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const inWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
      if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + inWords(n % 100) : "");
      if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + inWords(n % 1000) : "");
      if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + inWords(n % 100000) : "");
      return inWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + inWords(n % 10000000) : "");
    };
    const rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);
    let words = inWords(rupees) + " Rupees";
    if (paise > 0) words += " and " + inWords(paise) + " Paise";
    return words + " Only";
  };

  /* ================= PDF GENERATION ================= */
  const generatePDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text("Quotation", 105, 20, { align: "center" });

    // Client info
    doc.setFontSize(10);
    doc.text(`Quotation No: ${client.quotationNo}`, 14, 30);
    doc.text(`Date: ${client.date}`, 160, 30);
    doc.text(`To,`, 14, 40);
    doc.text(client.name, 14, 46);
    doc.text(client.company, 14, 52);
    doc.text(`GSTIN: ${client.gstin}`, 14, 58);
    doc.text(`Place of Supply: ${client.placeOfSupply}`, 14, 64);

    // Items table
  autoTable(doc, {
  startY: 70,

  head: [
    [
      "S.No",
      "Description",
      "HSN/SAC",
      "UOM",
      "Qty",
      "Rate",
      "Disc",
      "Disc Cost",
      "Amount",
      "Freight",
      "Taxable",
      { content: "CGST", colSpan: 2, styles: { halign: "center" } },
      { content: "SGST", colSpan: 2, styles: { halign: "center" } },
      { content: "IGST", colSpan: 2, styles: { halign: "center" } },
      "Total"
    ],
    [
      "", "", "", "", "", "", "", "", "", "", "",
      "%", "Amt",
      "%", "Amt",
      "%", "Amt",
      ""
    ]
  ],

  body: computed.map((i, idx) => [
    idx + 1,
    i.desc,
    i.hsn,
    i.uom,
    i.qty,
    i.cost.toFixed(2),
    i.discount.toFixed(2),
    i.discountedCost.toFixed(2),
    i.amount.toFixed(2),
    i.freight.toFixed(2),
    i.taxableValue.toFixed(2),
    i.cgstRate.toFixed(2),
    i.cgstAmt.toFixed(2),
    i.sgstRate.toFixed(2),
    i.sgstAmt.toFixed(2),
    i.igstRate.toFixed(2),
    i.igstAmt.toFixed(2),
    i.total.toFixed(2)
  ]),

  theme: "grid",

  styles: {
    fontSize: 7.5,
    cellPadding: 1.5,
    valign: "middle",
    overflow: "linebreak"
  },
columnStyles: {
  0: { cellWidth: 6 },    // S.No
  1: { cellWidth: 34 },   // Description
  2: { cellWidth: 13 },   // HSN
  3: { cellWidth: 7 },    // UOM
  4: { cellWidth: 7 },    // Qty
  5: { cellWidth: 11 },   // Rate
  6: { cellWidth: 9 },    // Disc
  7: { cellWidth: 12 },   // Disc Cost
  8: { cellWidth: 12 },   // Amount
  9: { cellWidth: 10 },   // Freight
  10:{ cellWidth: 13 },   // Taxable
  11:{ cellWidth: 6 },    // CGST %
  12:{ cellWidth: 10 },   // CGST Amt
  13:{ cellWidth: 6 },    // SGST %
  14:{ cellWidth: 10 },   // SGST Amt
  15:{ cellWidth: 6 },    // IGST %
  16:{ cellWidth: 10 },   // IGST Amt
  17:{ cellWidth: 13 }    // Total
}
,

  headStyles: {
    fillColor: [22, 119, 255],
    textColor: 255,
    fontSize: 8,
    halign: "center",
    valign: "middle",
    lineWidth: 0.1
  },

  didParseCell(data) {
    if (data.column.index === 1) {
      data.cell.styles.minCellHeight = 12;
    }
  }
});


    let y = doc.lastAutoTable.finalY + 8;

    // Totals
    doc.text(`Total Before Tax : Rs. ${totalBeforeTax.toFixed(2)}`, 14, y); y += 6;
    doc.text(`CGST Total      : Rs. ${cgstTotal.toFixed(2)}`, 14, y); y += 6;
    doc.text(`SGST Total      : Rs. ${sgstTotal.toFixed(2)}`, 14, y); y += 6;
    doc.text(`IGST Total      : Rs. ${igstTotal.toFixed(2)}`, 14, y); y += 6;
    doc.text(`Total Tax       : Rs. ${totalTaxAmount.toFixed(2)}`, 14, y); y += 6;
    doc.setFontSize(11);
    doc.text(`Grand Total     : Rs. ${grandTotal.toFixed(2)}`, 14, y); y += 6;
    doc.setFontSize(10);
    doc.text(`Amount in Words : ${numberToWords(grandTotal)}`, 14, y); y += 6;
    doc.text(`GST on Reverse Charge : ${reverseChargeApplicable ? "Yes" : "No"}`, 14, y); y += 6;

    // Terms
    if (terms.length) {
      y += 6;
      doc.setFontSize(10);
      doc.text("Terms & Conditions:", 14, y);
      y += 6;
      terms.forEach((t, idx) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(`${idx + 1}. ${t}`, 14, y);
        y += 5;
      });
    }

    // Signature & stamp
    if (signImg) doc.addImage(signImg, "PNG", 14, y + 10, 40, 20);
    if (stampImg) doc.addImage(stampImg, "PNG", 160, y + 5, 35, 35);

    doc.save("Quotation.pdf");
  };

  /* ================= SEND PDF ================= */
  const sendPDFToClient = async () => {
    if (!client.email) return alert("Enter client email!");
    const doc = new jsPDF("p", "mm", "a4");
    generatePDF(); // reuse logic or duplicate items for sending
    // convert to blob and send via API
  };

  return (
    <div className="container-xxl container-p-y">
      <h4 className="mb-4">Quotation / Proposal Editor (Admin)</h4>

      {/* Client */}
      <div className="card p-3 mb-3">
        <input className="form-control mb-2" placeholder="Client Name" value={client.name} onChange={e => setClient({ ...client, name: e.target.value })} />
        <input className="form-control mb-2" placeholder="Client Company & Address" value={client.company} onChange={e => setClient({ ...client, company: e.target.value })} />
        <input className="form-control mb-2" placeholder="Client Email" value={client.email} onChange={e => setClient({ ...client, email: e.target.value })} />
        <input className="form-control" placeholder="Quotation Date" value={client.date} onChange={e => setClient({ ...client, date: e.target.value })} />
      </div>

      {/* Items */}
      {items.map((item, idx) => {
        const c = computed[idx];
        return (
          <div key={item.id} className="card p-2 mb-2">
            <input className="form-control mb-1" placeholder="Description" value={item.desc} onChange={e => updateItem(item.id, "desc", e.target.value)} />

            {/* Editable fields */}
            <div className="row g-2 mb-1">
              <div className="col-12 col-md"><input className="form-control" placeholder="HSN/SAC" value={item.hsn} onChange={e => updateItem(item.id, "hsn", e.target.value)} /></div>
              <div className="col-12 col-md"><input className="form-control" placeholder="UOM" value={item.uom} onChange={e => updateItem(item.id, "uom", e.target.value)} /></div>
              <div className="col-12 col-md"><input type="number" className="form-control" placeholder="Qty" value={item.qty ?? ""} onChange={e => updateItem(item.id, "qty", e.target.value ? Number(e.target.value) : null)} /></div>
              <div className="col-12 col-md"><input type="number" className="form-control" placeholder="Cost" value={item.cost ?? ""} onChange={e => updateItem(item.id, "cost", e.target.value ? Number(e.target.value) : null)} /></div>
              <div className="col-12 col-md"><input type="number" className="form-control" placeholder="Discount" value={item.discount ?? ""} onChange={e => updateItem(item.id, "discount", e.target.value ? Number(e.target.value) : null)} /></div>
              <div className="col-12 col-md"><input type="number" className="form-control" placeholder="GST %" value={item.gst ?? ""} onChange={e => updateItem(item.id, "gst", e.target.value ? Number(e.target.value) : null)} /></div>
              <div className="col-12 col-md"><input type="number" className="form-control" placeholder="Freight" value={item.freight ?? ""} onChange={e => updateItem(item.id, "freight", e.target.value ? Number(e.target.value) : 0)} /></div>
              <div className="col-12 col-md"><select className="form-select" value={item.taxType} onChange={e => updateItem(item.id, "taxType", e.target.value)}><option value="CGST_SGST">CGST + SGST</option><option value="IGST">IGST</option></select></div>
              <div className="col-12 col-md-auto"><button className="btn btn-danger w-100 w-md-auto" onClick={() => removeItem(item.id)}>×</button></div>
            </div>

            {/* Computed fields */}
            <div className="row g-2">
              {[
                { label: "Discounted Cost", value: c.discountedCost },
                { label: "Amount", value: c.amount },
                { label: "Taxable Value", value: c.taxableValue },
                { label: "CGST Amt", value: c.cgstAmt },
                { label: "SGST Amt", value: c.sgstAmt },
                { label: "IGST Amt", value: c.igstAmt },
                { label: "Total", value: c.total },
              ].map((f, i) => (
                <div key={i} className="col-12 col-md">
                  <label className="form-label small text-muted">{f.label}</label>
                  <input className="form-control bg-light fw-semibold" value={f.value.toFixed(2)} readOnly />
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <button className="btn btn-secondary mb-4" onClick={addItem}>+ Add Item</button>

      {/* Terms */}
      <div className="card p-3 mb-3">
        <h6>Terms & Conditions</h6>
        {terms.map((t, i) => (
          <div key={i} className="d-flex flex-column flex-md-row gap-2 mb-1">
            <input className="form-control" value={t} onChange={e => updateTerm(i, e.target.value)} />
            <button className="btn btn-outline-danger" onClick={() => removeTerm(i)}>×</button>
          </div>
        ))}
        <button className="btn btn-outline-primary mt-2" onClick={addTerm}>+ Add Term</button>
      </div>

      {/* Sign & Stamp */}
      <div className="card p-3 mb-3">
        <h6>Sign & Stamp</h6>
        <div className="mb-2">
          <label>Upload Signature:</label>
          <input type="file" onChange={e => handleImageUpload(e, "sign")} />
        </div>
        <div className="mb-2">
          <label>Upload Stamp:</label>
          <input type="file" onChange={e => handleImageUpload(e, "stamp")} />
        </div>
      </div>

      <button className="btn btn-primary me-2" onClick={generatePDF}>Generate PDF</button>
      <button className="btn btn-success" onClick={sendPDFToClient}>Send PDF to Client</button>
    </div>
  );

};

export default ProposalPage;
