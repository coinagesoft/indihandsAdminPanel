"use client";
import React, { useState, useEffect } from "react";



const Page = () => {
  /* ================= HEADER ================= */
  const [header, setHeader] = useState({
    quotationNo: "",
    date: "",
    clientName: "",
    clientPhone: "",   // ✅ ADD
    clientEmail: "",
    company: "",
    gstin: "",
    place: "",
    billingAddress: "",
    shippingAddress: "",
    companyId: null,
    branchId: null,
  });

  const [selectedRfq, setSelectedRfq] = useState("");
  const [items, setItems] = useState([]);
  const [acceptedRfqs, setAcceptedRfqs] = useState([]);
  const [saving, setSaving] = useState(false);
  const [charges, setCharges] = useState([]);

  /* ================= HANDLERS ================= */
  const handleHeaderChange = (e) => {
    setHeader({ ...header, [e.target.name]: e.target.value });
  };
  const updateCharge = (index, field, value) => {
    const updated = [...charges];
    updated[index][field] = value;
    setCharges(updated);
  };

  const removeCharge = (index) => {
    setCharges(charges.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSaveProposal = async () => {
    if (!selectedRfq) return alert("❌ Please select RFQ first");
    if (!header.companyId || !header.branchId)
      return alert("❌ companyId / branchId missing");


    try {
      setSaving(true);

      const payload = {
        rfqId: Number(selectedRfq),
        companyId: header.companyId,
        branchId: header.branchId,
        proposal_date: header.date,
        place: header.place,
        billing_address: header.billingAddress,
        shipping_address: header.shippingAddress,
        items: items.map(x => ({
          productId: x.productId,
          quantity: x.qty,
          rate: x.rate,
          discount: x.discount,
          cgst_rate: x.cgst,
          sgst_rate: x.sgst,
          igst_rate: x.igst,
        })),
        charges: charges


      };

      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      // already exists
      if (res.status === 409) {
        setHeader(prev => ({
          ...prev,
          quotationNo: data.proposal_number,
        }));
        return alert(
          "⚠️ Proposal already exists. Proposal No: " +
          data.proposal_number
        );
      }

      if (!res.ok) {
        return alert("❌ " + (data.message || "Server error"));
      }

      // ✅ DB generated quotation no
      setHeader(prev => ({
        ...prev,
        quotationNo: data.proposal_number,
      }));

      alert("✅ Proposal saved successfully");
    } catch (err) {
      console.error("Save proposal error:", err);
      alert("❌ Internal server error");
    } finally {
      setSaving(false);
    }
  };




  const addItem = () => {
    setItems([
      ...items,
      {
        productId: null,
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

    const companyId = data.header.companyId;

    // company charges
    let loadedCharges = [];

    const proposalChargesRes = await fetch(
      `/api/proposals/${rfqId}/charges`
    );
    const proposalChargesData = await proposalChargesRes.json();

    if (proposalChargesData.success && proposalChargesData.charges?.length) {
      loadedCharges = proposalChargesData.charges;
    } else {
      // 2️⃣ fallback → company default
      const companyRes = await fetch(
        `/api/companies/${companyId}/charges`
      );
      const companyData = await companyRes.json();
      loadedCharges = companyData.charges || [];
    }

    setCharges(
      loadedCharges.map(c => ({
        label: c.label,
        amount: Number(c.amount),
        taxPercent: Number(c.taxPercent || 0),
      }))
    );


    const selected = acceptedRfqs.find(x => x.rfq_id == rfqId);

    setHeader(prev => ({
      ...prev,
      quotationNo: selected?.proposal_number || "",
      date: new Date().toISOString().slice(0, 10),

      companyId,
      branchId: data.header.branchId,

      clientName: data.header.clientName,
      clientPhone: data.header.clientPhone,
      clientEmail: data.header.clientEmail,

      company: data.header.company,
      gstin: data.header.gstin,
      billingAddress: data.header.billing_address,
      shippingAddress: data.header.shipping_address,
    }));

    setItems(data.items || []);
  };



  const addCharge = () => {
    setCharges([
      ...charges,
      { label: "New Charge", amount: 0, taxPercent: 0 }
    ]);
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
                  ["clientName", "Customer Name"],
                  ["clientEmail", "Customer Email"],
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
              <div className="table-responsive proposal-table">
                <table className="table table-bordered align-middle mb-0">
                  <colgroup>
                    <col style={{ minWidth: "50px" }} />
                    <col style={{ minWidth: "250px" }} />
                    <col style={{ minWidth: "100px" }} />
                    <col style={{ minWidth: "60px" }} />
                    <col style={{ minWidth: "120px" }} />
                    <col style={{ minWidth: "100px" }} />
                    <col style={{ minWidth: "120px" }} />
                    <col style={{ minWidth: "120px" }} />
                    <col style={{ minWidth: "120px" }} />

                  </colgroup>

                  <thead className="table-primary">
                    <tr>
                      <th className="text-center">#</th>
                      <th>Description</th>
                      <th className="text-center">HSN</th>
                      <th className="text-center">Qty</th>
                      <th className="text-end">Rate</th>
                      <th className="text-end">Disc %</th>
                      <th className="text-end">Amount</th>
                      <th className="text-end">Tax</th>
                      <th className="text-end">Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((item, i) => {
                      const amount = calcAmount(item);
                      const tax =
                        calcTax(amount, item.cgst) +
                        calcTax(amount, item.sgst) +
                        calcTax(amount, item.igst);
                      const total = amount + tax;

                      return (
                        <tr key={i}>
                          <td className="text-center">{i + 1}</td>

                          <td className="text-wrap">
                            {item.description || "-"}
                          </td>

                          <td className="text-center">
                            {item.hsn || "-"}
                          </td>

                          <td className="text-center">
                            {item.qty ?? 0}
                          </td>

                          <td className="text-end">
                            ₹ {Number(item.rate || 0).toFixed(2)}
                          </td>

                          <td className="text-end">
                            {Number(item.discount || 0).toFixed(2)}%
                          </td>

                          <td className="text-end">
                            ₹ {amount.toFixed(2)}
                          </td>

                          <td className="text-end">
                            ₹ {tax.toFixed(2)}
                          </td>

                          <td className="text-end fw-semibold">
                            ₹ {total.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>



              <h6 className="mt-4">Additional Charges</h6>
              <button
                className="btn btn-sm btn-outline-primary mb-2"
                onClick={addCharge}
              >
                + Add Charge
              </button>
              {charges.length === 0 ? (
                <div className="text-muted">No additional charges</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm align-middle">
                    <thead>
                      <tr>
                        <th>Charge</th>
                        <th style={{ width: 120 }}>Amount</th>
                        <th style={{ width: 100 }}>Tax %</th>
                        <th style={{ width: 120 }}>Total</th>
                        <th style={{ width: 60 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {charges.map((c, i) => {
                        const amt = Number(c.amount || 0);
                        const tax = (amt * Number(c.taxPercent || 0)) / 100;
                        const total = amt + tax;

                        return (
                          <tr key={i}>
                            <td>
                              <input
                                className="form-control form-control-sm"
                                value={c.label}
                                onChange={(e) =>
                                  updateCharge(i, "label", e.target.value)
                                }
                              />
                            </td>


                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                value={c.amount ?? ""}
                                onChange={(e) =>
                                  updateCharge(i, "amount", e.target.value)
                                }
                              />
                            </td>

                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                value={c.taxPercent ?? ""}
                                onChange={(e) =>
                                  updateCharge(i, "taxPercent", e.target.value)
                                }
                              />
                            </td>

                            <td className="fw-semibold">
                              ₹ {total.toFixed(2)}
                            </td>

                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => removeCharge(i)}
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
              )}






              {/* TOTALS */}
              <div className="row justify-content-end mt-4">
                <div className="col-md-6">
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
                      {charges.map((c, i) => {
                        const amt = Number(c.amount || 0);
                        const tax = (amt * Number(c.taxPercent || 0)) / 100;
                        const total = amt + tax;
                        if (total <= 0) return null;

                        return (
                          <tr key={i}>
                            <td className="">{c.label}</td>
                            <td className="text-end">₹ {total.toFixed(2)}</td>
                          </tr>
                        );
                      })}


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
