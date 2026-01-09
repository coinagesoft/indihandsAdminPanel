"use client";
import React, { useState } from "react";

/* ================= MOCK ACCEPTED RFQs ================= */
const ACCEPTED_RFQS = [
  {
    id: 201,
    customerName: "Mr. Naveen Kumar L R",
    company: "Tripseay Consulting Services Pvt Ltd, Pune",
    gstin: "27ABCDE1234F1Z5",
    place: "Maharashtra (27)",
    items: [
      {
        description: "Madhubani Foldable Lamp",
        hsn: "44209090",
        uom: "No",
        qty: 2,
        rate: 1800,
        discount: 0,
        cgst: 9,
        sgst: 9,
        igst: 0,
      },
      {
        description: "Phad Foldable Lamp",
        hsn: "44209090",
        uom: "No",
        qty: 2,
        rate: 1900,
        discount: 0,
        cgst: 9,
        sgst: 9,
        igst: 0,
      },
    ],
  },
  {
    id: 203,
    customerName: "Kekin Artworks",
    company: "Kekin Artworks, Jaipur",
    gstin: "08ABCDE4321F1Z9",
    place: "Rajasthan (08)",
    items: [
      {
        description: "Hand-painted Wooden Lamp",
        hsn: "44209090",
        uom: "No",
        qty: 1,
        rate: 2500,
        discount: 0,
        cgst: 9,
        sgst: 9,
        igst: 0,
      },
    ],
  },
];

const Page = () => {
  /* ================= HEADER ================= */
  const [header, setHeader] = useState({
    quotationNo: "QTN-2026-001",
    date: "2026-01-05",
    customerName: "",
    company: "",
    gstin: "",
    place: "",
  });

  const [selectedRfq, setSelectedRfq] = useState("");
  const [items, setItems] = useState([]);

  /* ================= HANDLERS ================= */
  const handleHeaderChange = (e) => {
    setHeader({ ...header, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        description: "",
        hsn: "",
        uom: "No",
        qty: 1,
        rate: 0,
        discount: 0,
        cgst: 9,
        sgst: 9,
        igst: 0,
      },
    ]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  /* ================= RFQ SELECT ================= */
  const handleRfqSelect = (e) => {
    const rfqId = e.target.value;
    setSelectedRfq(rfqId);

    const rfq = ACCEPTED_RFQS.find((r) => r.id === Number(rfqId));
    if (!rfq) return;

    setHeader((prev) => ({
      ...prev,
      customerName: rfq.customerName,
      company: rfq.company,
      gstin: rfq.gstin,
      place: rfq.place,
    }));

    setItems(rfq.items);
  };

  /* ================= CALCULATIONS ================= */
  const calcAmount = (item) => {
    const base = item.qty * item.rate;
    const discount = (base * item.discount) / 100;
    return base - discount;
  };

  const calcTax = (amount, percent) => (amount * percent) / 100;

  const totals = items.reduce(
    (acc, item) => {
      const amount = calcAmount(item);
      acc.subtotal += amount;
      acc.cgst += calcTax(amount, item.cgst);
      acc.sgst += calcTax(amount, item.sgst);
      acc.igst += calcTax(amount, item.igst);
      return acc;
    },
    { subtotal: 0, cgst: 0, sgst: 0, igst: 0 }
  );

  const grandTotal =
    totals.subtotal + totals.cgst + totals.sgst + totals.igst;

  /* ================= UI ================= */
  return (
    <div className="container-xxl py-4">
      <div className="row g-4">
        {/* MAIN */}
        <div className="col-lg-9">
          <div className="card shadow-sm">
            <div className="card-body">
              <h4 className="mb-4">Quotation / Invoice (Admin Edit)</h4>

              {/* RFQ */}
              <div className="mb-4">
                <label className="form-label">Select Accepted RFQ</label>
                <select
                  className="form-select"
                  value={selectedRfq}
                  onChange={handleRfqSelect}
                >
                  <option value="">-- Select RFQ --</option>
                  {ACCEPTED_RFQS.map((r) => (
                    <option key={r.id} value={r.id}>
                      RFQ #{r.id} — {r.company}
                    </option>
                  ))}
                </select>
              </div>

              {/* HEADER */}
              <div className="row g-3 mb-4">
                {[
                  ["quotationNo", "Quotation No"],
                  ["date", "Date", "date"],
                  ["customerName", "Customer Name"],
                  ["company", "Company"],
                  ["gstin", "GSTIN"],
                  ["place", "Place of Supply"],
                ].map(([name, label, type = "text"]) => (
                  <div className="col-md-6" key={name}>
                    <label className="form-label">{label}</label>
                    <input
                      type={type}
                      className="form-control"
                      name={name}
                      value={header[name]}
                      onChange={handleHeaderChange}
                    />
                  </div>
                ))}
              </div>

              {/* ITEMS TABLE */}
<div className="table-responsive">
  <table className="table table-bordered align-middle" style={{ tableLayout: "fixed" }}>
    <colgroup>
      <col style={{ width: "50px" }} />   {/* # */}
      <col style={{ width: "300px" }} />  {/* Description */}
      <col style={{ width: "120px" }} />  {/* HSN */}
      <col style={{ width: "80px" }} />   {/* Qty */}
      <col style={{ width: "120px" }} />  {/* Rate */}
      <col style={{ width: "100px" }} />  {/* Discount */}
      <col style={{ width: "140px" }} />  {/* Amount */}
      <col style={{ width: "140px" }} />  {/* Tax */}
      <col style={{ width: "160px" }} />  {/* Total */}
      <col style={{ width: "60px" }} />   {/* Remove */}
    </colgroup>

    <thead className="table-primary text-nowrap">
      <tr>
        <th>#</th>
        <th>Description</th>
        <th>HSN</th>
        <th>Qty</th>
        <th>Rate</th>
        <th>Disc %</th>
        <th>Amount</th>
        <th>Tax</th>
        <th>Total</th>
        <th></th>
      </tr>
    </thead>

    <tbody>
      {items.map((item, i) => {
        const amount = calcAmount(item);
        const tax =
          calcTax(amount, item.cgst) +
          calcTax(amount, item.sgst) +
          calcTax(amount, item.igst);

        return (
          <tr key={i}>
            <td className="text-center">{i + 1}</td>
            <td>
              <input
                className="form-control"
                style={{ width: "100%", minWidth: "250px" }}
                value={item.description}
                onChange={(e) => handleItemChange(i, "description", e.target.value)}
              />
            </td>
            <td>
              <input
                className="form-control"
                style={{ width: "100%", minWidth: "100px" }}
                value={item.hsn}
                onChange={(e) => handleItemChange(i, "hsn", e.target.value)}
              />
            </td>
            <td>
              <input
                type="number"
                className="form-control"
                style={{ width: "100%", minWidth: "60px" }}
                value={item.qty}
                onChange={(e) => handleItemChange(i, "qty", +e.target.value)}
              />
            </td>
            <td>
              <input
                type="number"
                className="form-control"
                style={{ width: "100%", minWidth: "100px" }}
                value={item.rate}
                onChange={(e) => handleItemChange(i, "rate", +e.target.value)}
              />
            </td>
            <td>
              <input
                type="number"
                className="form-control"
                style={{ width: "100%", minWidth: "80px" }}
                value={item.discount}
                onChange={(e) => handleItemChange(i, "discount", +e.target.value)}
              />
            </td>
            <td className="text-end">₹ {amount.toFixed(2)}</td>
            <td className="text-end">₹ {tax.toFixed(2)}</td>
            <td className="text-end fw-semibold">₹ {(amount + tax).toFixed(2)}</td>
            <td className="text-center">
              <button
                className="btn btn-danger btn-sm"
                onClick={() => removeItem(i)}
              >
                ✕
              </button>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>



              <button
                className="btn btn-outline-primary mt-2"
                onClick={addItem}
              >
                + Add Item
              </button>

              {/* TOTALS */}
              <div className="row justify-content-end mt-4">
                <div className="col-md-4">
                  <table className="table">
                    <tbody>
                      <tr>
                        <td>Subtotal</td>
                        <td className="text-end">
                          ₹ {totals.subtotal.toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td>CGST</td>
                        <td className="text-end">
                          ₹ {totals.cgst.toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td>SGST</td>
                        <td className="text-end">
                          ₹ {totals.sgst.toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td>IGST</td>
                        <td className="text-end">
                          ₹ {totals.igst.toFixed(2)}
                        </td>
                      </tr>
                      <tr className="fw-bold">
                        <td>Grand Total</td>
                        <td className="text-end">
                          ₹ {grandTotal.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="col-lg-3">
          <div className="card shadow-sm p-3">
            <button className="btn btn-success mb-3">
              Save Quotation
            </button>
            <button className="btn btn-primary mb-3">
              Convert to Invoice
            </button>
            <button className="btn btn-outline-secondary">
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
