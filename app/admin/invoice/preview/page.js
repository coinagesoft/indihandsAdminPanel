"use client";
import React, { useState, useEffect } from "react";

const Page = () => {

const [selectedRfq, setSelectedRfq] = useState("");
const [acceptedRfqs, setAcceptedRfqs] = useState([]);
const [sendingProposal, setSendingProposal] = useState(false);
const [sendingInvoice, setSendingInvoice] = useState(false);
const [proposalId, setProposalId] = useState(null);

  const [header, setHeader] = useState({
    quotationNo: "",
    date: "",
    clientName: "",
    clientPhone: "",   
    clientEmail: "",  
    company: "",
    gstin: "",
    place: "",
    billingAddress: "",
    shippingAddress: "",
    companyId: null,   
    branchId: null,
  });


  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [charges, setCharges] = useState([]);

  /* ================= HANDLERS ================= */
  const handleSaveProposal = async () => {
    if (!selectedRfq) return alert("❌ Please select RFQ first");
    if (!header.companyId || !header.branchId) return alert("❌ companyId / branchId missing");

    if (saving) return;

    try {
      setSaving(true);

      const payload = {
        rfqId: Number(selectedRfq),
        companyId: header.companyId,
        branchId: header.branchId,
        place: header.place,
        proposal_date: header.date,
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

      if (res.status === 409) {
        setHeader((prev) => ({ ...prev, quotationNo: data.proposal_number }));
        return alert("⚠️ Proposal already exists: " + data.proposal_number);
      }

   

      // ✅ DB generated proposal no show in UI
      if (data.proposal_number) {
        setHeader((prev) => ({ ...prev, quotationNo: data.proposal_number }));
      }

if (data.proposal_id) {
  setProposalId(data.proposal_id);
}

      alert("✅ Proposal sent ");
    } finally {
      setSaving(false);
    }
  };
  const handleDownloadPdf = () => {
    if (!selectedRfq) return alert("❌ Select RFQ first");
    window.open(`/api/proposals/pdf/${proposalId}`, "_blank");
  };
  
const handleEmailProposal = async () => {
  if (!selectedRfq) return alert("❌ Select RFQ first");
  if (!header.clientEmail) return alert("❌ Client email missing");

  try {
    setSendingProposal(true);

    const res = await fetch(`/api/proposals/email/${proposalId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "proposal",
        email: header.clientEmail,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Email failed");

    alert("✅ Proposal emailed to client");
  } catch (e) {
    alert("❌ " + e.message);
  } finally {
    setSendingProposal(false);
  }
};


const handleEmailInvoice = async () => {
  if (!selectedRfq) return alert("❌ Select RFQ first");
  if (!header.clientEmail) return alert("❌ Client email missing");

  try {
    setSendingInvoice(true);

    const res = await fetch(`/api/invoices/email/${selectedRfq}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "invoice",
        email: header.clientEmail,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Email failed");

    alert("✅ Invoice emailed to client");
  } catch (e) {
    alert("❌ " + e.message);
  } finally {
    setSendingInvoice(false);
  }
};



const handleRfqSelect = async (e) => {
  const rfqId = Number(e.target.value);
  
  setSelectedRfq(rfqId);

  if (!rfqId) return;

  /* 1️⃣ RFQ details */
  const res = await fetch(`/api/rfqs/${rfqId}/details`);
  const data = await res.json();
  if (!res.ok) return alert("❌ " + data.message);

  const companyId = data.header.companyId;

  /* 2️⃣ Charges → proposal override OR company default */
  let loadedCharges = [];

  try {
    const proposalChargesRes = await fetch(
      `/api/proposals/${rfqId}/charges`
    );
    const proposalChargesData = await proposalChargesRes.json();

    if (
      proposalChargesData.success &&
      proposalChargesData.charges?.length
    ) {
      loadedCharges = proposalChargesData.charges;
    } else {
      const companyRes = await fetch(
        `/api/companies/${companyId}/charges`
      );
      const companyData = await companyRes.json();
      loadedCharges = companyData.charges || [];
    }
  } catch {
    // fallback if proposal API fails
    const companyRes = await fetch(
      `/api/companies/${companyId}/charges`
    );
    const companyData = await companyRes.json();
    loadedCharges = companyData.charges || [];
  }

  setCharges(
    loadedCharges.map((c) => ({
      label: c.label,
      amount: Number(c.amount),
      taxPercent: Number(c.taxPercent || 0),
    }))
  );

  /* 3️⃣ Header + items */
const selected = acceptedRfqs.find((x) => x.id == rfqId);
  setHeader((prev) => ({
    ...prev,
     quotationNo: selected?.proposalNumber || "",
    date: new Date().toISOString().slice(0, 10),

    clientName: data.header.clientName,
    clientPhone: data.header.clientPhone,
    clientEmail: data.header.clientEmail,

    company: data.header.company,
    gstin: data.header.gstin,
    billingAddress: data.header.billing_address,
    shippingAddress: data.header.shipping_address,

    companyId,
    branchId: data.header.branchId,
  }));

setProposalId(selected?.proposalId || null);
  setItems(data.items || []);
};


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

const chargesSummary = charges.reduce(
  (acc, c) => {
    const amt = Number(c.amount || 0);
    const tax = (amt * Number(c.taxPercent || 0)) / 100;
    acc.amount += amt;
    acc.tax += tax;
    return acc;
  },
  { amount: 0, tax: 0 }
);


const grandTotal =
  totals.subtotal +
  totals.cgst +
  totals.sgst +
  totals.igst +
  chargesSummary.amount +
  chargesSummary.tax;


  useEffect(() => {
    fetchAcceptedRfqs();
  }, []);

  const fetchAcceptedRfqs = async () => {
    const res = await fetch("/api/proposals/accepted-rfqs");
    const data = await res.json();
    console.log("data",data)
    if (!res.ok) return alert("❌ " + data.message);
    setAcceptedRfqs(data.rfqs || []);
  };

  /* ================= UI ================= */
  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      {/* ===== RFQ SELECT ===== */}
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

      <div className="row invoice-edit">
        <div className="col-lg-9 col-12 mb-lg-0 mb-6">
          <div className="card invoice-preview-card p-sm-12 p-6">

            {/* ================= SELLER HEADER (GREY ROW) ================= */}
            <div
              className="card-body rounded-4 mb-4"
              style={{ backgroundColor: "#f4f5f7" }}
            >
              <div className="row align-items-start">
                {/* LEFT: LOGO ABOVE COMPANY NAME */}
                <div className="col-md-7">
                  <img
                    src="/materialize/assets/img/favicon/favicon.png"
                    alt="Indihands Logo"
                    style={{ height: "52px", marginBottom: "10px" }}
                  />

                  <h5 className="mb-1">Indihands – The Art Craft Nook</h5>

                  <p className="mb-0">Pune, Maharashtra, India</p>
                  <p className="mb-0">+91 98765 43210</p>
                  <p className="mb-0">support@indihands.com</p>
                </div>

                {/* RIGHT: INVOICE META */}
                <div className="col-md-5 ">
                  <h6 className="mb-2">
                    #{header.quotationNo}
                  </h6>


                </div>
              </div>
            </div>

            {/* Header */}
            <div className="card-body invoice-preview-header rounded-4 text-heading p-6 px-3">
              <div className="row mx-0 px-3">

                {/* LEFT SECTION */}
                <div className="col-md-8 ps-0">
                  <h4 className="mb-3">Quotation</h4>

                  <p className="mb-1">
                    <strong>Quotation No:</strong> {header.quotationNo}
                  </p>
                  <p className="mb-1">
                    <strong>To:</strong> {header.clientName}
                  </p>
                    <p className="mb-1">
                    <strong>Customer Email:</strong> {header.clientEmail}
                  </p>
                    <p className="mb-1">
                    <strong>Company Name:</strong> {header.company}
                  </p>
                  <p className="mb-1">
                    <strong>GSTIN:</strong> {header.gstin}
                  </p>
                  <p className="mb-1">
                    <strong>Place of Supply:</strong> {header.place}
                  </p>

                  {/* ✅ Billing & Shipping (NOW CORRECT) */}
                  <div className="row">
                    <div className=" col-12">
                      <strong>Billing Address:</strong>
                     {header.billingAddress}
                    </div>

                    <div className=" col-12 mt-2">
                      <strong>Shipping Address:</strong>
                      {header.shippingAddress}
                    </div>
                  </div>
                </div>

                {/* RIGHT SECTION */}
                <div className="col-md-4 col-12 pe-0 text-end">
                  <p className="mb-1">
                    <strong>Date:</strong> {header.date}
                  </p>
                </div>

              </div>
            </div>


            {/* Items Table */}
            <div className="card-body px-0">
              <div className="table-responsive">
                <table
                  className="table table-bordered align-middle"
                  style={{ tableLayout: "auto", width: "100%" }}
                >
                  <colgroup>
                    <col style={{ minWidth: "50px" }} />
                    <col style={{ minWidth: "250px" }} />
                    <col style={{ minWidth: "100px" }} />
                    <col style={{ minWidth: "60px" }} />
                    <col style={{ minWidth: "60px" }} />
                    <col style={{ minWidth: "100px" }} />
                    <col style={{ minWidth: "80px" }} />
                    <col style={{ minWidth: "120px" }} />
                    <col style={{ minWidth: "100px" }} />
                    <col style={{ minWidth: "100px" }} />
                    <col style={{ minWidth: "100px" }} />
                    <col style={{ minWidth: "140px" }} />
                  </colgroup>


                  <thead className="table-primary">
                    <tr>
                      <th>Sr No</th>
                      <th>Description</th>
                      <th>HSN/SAC</th>
                      <th>UOM</th>
                      <th>Qty</th>
                      <th>Rate</th>
                      <th>Discount</th>
                      <th>Amount</th>
                      <th>CGST</th>
                      <th>SGST</th>
                      <th>IGST</th>
                      <th>Total</th>
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
                          <td>{i + 1}</td>
                          <td style={{ minWidth: "250px" }}>{item.description}</td>
                          <td>{item.hsn}</td>
                          <td>{item.uom}</td>
                          <td>{item.qty}</td>
                          <td>{item.rate}</td>
                          <td>{item.discount}</td>
                          <td>{amount.toFixed(2)}</td>
                          <td>{calcTax(amount, item.cgst).toFixed(2)}</td>
                          <td>{calcTax(amount, item.sgst).toFixed(2)}</td>
                          <td>{calcTax(amount, item.igst).toFixed(2)}</td>
                          <td>{(amount + tax).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

{charges.length > 0 && (
  <div className="mb-3">
    <h6>Additional Charges</h6>
    <ul className="mb-0">
      {charges.map((c, i) => {
  const tax = (Number(c.amount || 0) * Number(c.taxPercent || 0)) / 100;
  const total = Number(c.amount || 0) + tax;

  return (
    <li key={i}>
      {c.label}: ₹ {total.toFixed(2)}
      {c.taxPercent > 0 && ` (${c.taxPercent}% tax)`}
    </li>
  );
})}

    </ul>
  </div>
)}


            {/* Totals */}
            <div className="card-body px-0">
              <div className="row">
                <div className="col-md-6" />
                <div className="col-md-6">
                  <table className="table">
                 <tbody>
  <tr>
    <td>Total Before Tax</td>
    <td>₹ {totals.subtotal.toFixed(2)}</td>
  </tr>
  <tr>
    <td>CGST Total</td>
    <td>₹ {totals.cgst.toFixed(2)}</td>
  </tr>
  <tr>
    <td>SGST Total</td>
    <td>₹ {totals.sgst.toFixed(2)}</td>
  </tr>
  <tr>
    <td>IGST Total</td>
    <td>₹ {totals.igst.toFixed(2)}</td>
  </tr>

  {chargesSummary.amount > 0 && (
    <tr>
      <td>Additional Charges</td>
      <td>₹ {chargesSummary.amount.toFixed(2)}</td>
    </tr>
  )}

  {chargesSummary.tax > 0 && (
    <tr>
      <td>Charges Tax</td>
      <td>₹ {chargesSummary.tax.toFixed(2)}</td>
    </tr>
  )}

  <tr className="fw-bold">
    <th>Grand Total</th>
    <th>₹ {grandTotal.toFixed(2)}</th>
  </tr>
</tbody>

                  </table>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="card-body px-0 pt-4">
              <h6>Terms & Conditions:</h6>
              <ol className="mb-0">
                <li>Payment within 15 days from invoice date.</li>
                <li>Delivery within 7 working days from order confirmation.</li>
                <li>Warranty as per manufacturer terms.</li>
                <li>Goods once sold will not be taken back.</li>
                <li>All disputes subject to Pune jurisdiction.</li>
              </ol>
            </div>
          </div>
        </div>

     {/* Actions */}
<div className="col-lg-3 col-12 invoice-actions">
  <div className="card border-0 shadow-sm">
    <div className="card-body p-3">

      {/* SAVE */}
      <button
        className="btn w-100 mb-3"
        style={{
          background: "#ff6b35",
          color: "#fff",
          borderRadius: "8px",
          fontWeight: 500
        }}
        onClick={handleSaveProposal}
        disabled={saving}
      >
        {saving ? "Saving..." : "Send Proposal"}
      </button>

      {/* DOWNLOAD */}
      <button
        className="btn w-100 mb-3"
        style={{
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          color: "#444",
          background: "#fff"
        }}
        onClick={handleDownloadPdf}
        disabled={!selectedRfq}
      >
        Download PDF
      </button>

    {/* EMAIL PROPOSAL */}
<button
  className="btn w-100 mb-2"
  style={{
    border: "1px solid #ff6b35",
    color: "#ff6b35",
    borderRadius: "8px",
    background: "#fff"
  }}
  onClick={handleEmailProposal}
  disabled={!header.clientEmail || sendingProposal}
>
  {sendingProposal ? "Sending..." : "Email Proposal"}
</button>


{/* EMAIL INVOICE */}
<button
  className="btn w-100 mb-3"
  style={{
    border: "1px solid #2e7d32",
    color: "#2e7d32",
    borderRadius: "8px",
    background: "#fff"
  }}
  onClick={handleEmailInvoice}
  disabled={!header.clientEmail || sendingInvoice}
>
  {sendingInvoice ? "Sending..." : "Email Invoice"}
</button>



   

    </div>
  </div>
</div>


      </div>
    </div>
  );
};

export default Page;
