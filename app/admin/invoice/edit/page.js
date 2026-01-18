"use client";
import React, { useState,useEffect } from "react";

/* ================= MOCK ACCEPTED RFQs ================= */


const Page = () => {
  /* ================= HEADER ================= */
  const [header, setHeader] = useState({
    quotationNo: "",
    date: "",
    customerName: "",
    company: "",
    gstin: "",
    place: "",
      billingAddress: "",
  shippingAddress: "",
      companyId: null,   // ✅ add
  branchId: null,  
  });

  const [selectedRfq, setSelectedRfq] = useState("");
  const [items, setItems] = useState([]);
    const [acceptedRfqs, setAcceptedRfqs] = useState([]);
const [saving, setSaving] = useState(false);
  /* ================= HANDLERS ================= */
  const handleHeaderChange = (e) => {
    setHeader({ ...header, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };
const handleSaveProposal = async () => {
  if (!selectedRfq) return alert("❌ Please select RFQ first");
  if (!header.companyId || !header.branchId) return alert("❌ companyId / branchId missing");

  try {
    setSaving(true);

    const payload = {
      rfqId: Number(selectedRfq),
      companyId: header.companyId,
      branchId: header.branchId,

      proposal_number: header.quotationNo, // ✅ correct now
      proposal_date: header.date,
      place:header.place,
      billing_address: header.billingAddress,
      shipping_address: header.shippingAddress,

      items: items.map((x) => ({
        productId: x.productId,
        quantity: x.qty,
        rate: x.rate,
        discount: x.discount,
        cgst_rate: x.cgst,
        sgst_rate: x.sgst,
        igst_rate: x.igst,
      })),
    };

    const res = await fetch("/api/proposals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    // ✅ if already exists
    if (res.status === 409) {
      setHeader((prev) => ({ ...prev, quotationNo: data.proposal_number })); // UI same as DB
      return alert("⚠️ Proposal already exists. Proposal No: " + data.proposal_number);
    }

    if (!res.ok) return alert("❌ " + data.message);

    // ✅ use DB returned proposal_number always
    setHeader((prev) => ({ ...prev, quotationNo: data.proposal_number }));

    alert("✅ Proposal saved. ID = " + data.proposalId);
  } finally {
    setSaving(false);
  }
};



 const addItem = () => {
  setItems([
    ...items,
    {
      productId: null, // ✅ important
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
const handleRfqSelect = async (e) => {
  const rfqId = e.target.value;
  setSelectedRfq(rfqId);

  if (!rfqId) return;

  const res = await fetch(`/api/rfqs/${rfqId}/details`);
  const data = await res.json();

  if (!res.ok) return alert("❌ " + data.message);

  const prRes = await fetch(`/api/proposals/by-rfq/${rfqId}`);
  const prData = await prRes.json();
const selected = acceptedRfqs.find(x => x.id == rfqId);
  setHeader((prev) => ({
    ...prev,
  place: selected?.place || "",
  quotationNo: selected?.proposalNumber || "",
        date: new Date().toISOString().slice(0, 10),
    companyId: data.header.companyId,
    branchId: data.header.branchId,

    customerName: data.header.customerName,
    company: data.header.company,
    gstin: data.header.gstin,

 billingAddress: data.header.billing_address,
shippingAddress: data.header.shipping_address,
  }));

  setItems(data.items || []);
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

useEffect(() => {
  fetchAcceptedRfqs();
}, []);

const fetchAcceptedRfqs = async () => {
  const res = await fetch("/api/proposals/accepted-rfqs");
  const data = await res.json();
  if (!res.ok) return alert("❌ " + data.message);

  setAcceptedRfqs(data.rfqs || []);
};



  /* ================= UI ================= */
  return (
    <div className="container-xxl py-4">
      <div className="row g-4">
        {/* MAIN */}
        <div className="col-lg-9">
          <div className="card shadow-sm">
            <div className="card-body">
              <h4 className="mb-4">Proposal Editor</h4>

              {/* RFQ */}
              <div className="mb-4">
                <label className="form-label">Select Accepted RFQ</label>
                <select
                  className="form-select"
                  value={selectedRfq}
                  onChange={handleRfqSelect}
                >
                  <option value="">-- Select RFQ --</option>
                            {acceptedRfqs.map((r) => (
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
      <col style={{ width: "50px" }} />   
      <col style={{ width: "300px" }} />  
      <col style={{ width: "120px" }} />  
      <col style={{ width: "80px" }} />   
      <col style={{ width: "120px" }} />  
      <col style={{ width: "100px" }} />  
      <col style={{ width: "140px" }} />  
      <col style={{ width: "140px" }} />  
      <col style={{ width: "160px" }} />  
      <col style={{ width: "60px" }} />   
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
                className="btn btn-outline-orange mt-2"
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
       <button
  className="btn btn-orange mb-3"
  onClick={handleSaveProposal}
  disabled={saving}
>
  {saving ? "Saving..." : "Save Proposal"}
</button>


         
            {/* <button className="btn btn-outline-secondary">
              Download PDF
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
