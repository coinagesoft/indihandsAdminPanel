"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import PreviewPage from '../../../../components/InvoicePreview.js'
import ProtectedRoute from '../../../../components/ProtectedRoute.js'
import { showSuccess, showError } from "../../../../lib/toast.js";
import { useConfirm } from "../../../../components/ConfirmDialog.js";
import { useFetchWithLoader } from "../../../../lib/fetchWithLoader.js";

const PageInner = () => {
  /* ================= HEADER ================= */
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
    rfqType: "",
  });
  const fetchWithLoader = useFetchWithLoader();
  const [selectedRfq, setSelectedRfq] = useState("");
  const [items, setItems] = useState([]);
  const [acceptedRfqs, setAcceptedRfqs] = useState([]);
  const [saving, setSaving] = useState(false);
  const [charges, setCharges] = useState([]);
  const [mode, setMode] = useState("edit");
  const searchParams = useSearchParams();
  const [rfqSearch, setRfqSearch] = useState("");
  const rfqIdFromUrl = searchParams.get("rfqId");
  // "edit" | "preview"
  const readonlyFields = [
    "quotationNo",
    "clientName",
    "clientEmail",
    "gstin"
  ];
  const isB2C =
  header.rfqType === "B2C";
  /* ================= HANDLERS ================= */
  const handleHeaderChange = (e) => {
    setHeader({ ...header, [e.target.name]: e.target.value });
  };
  const updateCharge = (index, field, value) => {
    const updated = [...charges];

    if (field === "amount" || field === "taxPercent") {
      if (value === "") {
        updated[index][field] = "";
      } else {
        let num = Number(value);

        if (isNaN(num)) num = 0;

        // 🚫 prevent negative
        num = Math.max(0, num);

        // optional: tax cap
        if (field === "taxPercent") num = Math.min(100, num);

        updated[index][field] = num;
      }
    } else {
      updated[index][field] = value;
    }

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

  const filteredRfqs = acceptedRfqs.filter(r => {
    const s = rfqSearch.toLowerCase();

    if (!s) return true;

    return (
      (r.rfqNumber || "").toLowerCase().includes(s) ||
      (r.company || "").toLowerCase().includes(s)
    );
  });

  const handleSaveProposal = async () => {
    if (!selectedRfq) return showError("Please select RFQ first");
 if (
  !isB2C &&
  (
    !header.companyId ||
    !header.branchId
  )
) {
  return showError(
    "companyId / branchId missing"
  );
}


    try {
      setSaving(true);

      const payload = {
        rfqId: Number(selectedRfq),
       companyId:
  header.companyId || null,

branchId:
  header.branchId || null,

rfqType:
  header.rfqType,
        proposal_date: header.date,
        place: header.place,
        billing_address: header.billingAddress,
        shipping_address: header.shippingAddress,
        gstin: header.gstin,
        company_name: header.company,
        items: items.map(x => ({
          productId: x.productId,
          quantity: x.qty,
          rate: x.rate,
          discount: x.discount,
          cgst_rate: x.cgst,
          sgst_rate: x.sgst,
          igst_rate: x.igst,
        })),
        charges: charges.map(c => ({
          label: c.label,
          amount: c.amount,
          taxPercent: c.taxPercent,
          hsnCode: c.hsnCode
        }))


      };

      const res = await fetchWithLoader("/api/proposals", {
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
        return showError(
          "Proposal already exists. Proposal No: " +
          data.proposal_number
        );
      }

      if (!res.ok) {
        return showError("❌ " + (data.message || "Server error"));
      }

      // ✅ DB generated quotation no
      setHeader(prev => ({
        ...prev,
        quotationNo: data.proposal_number,
      }));

      showSuccess("Proposal saved successfully");
    } catch (err) {
      console.error("Save proposal error:", err);
      showError("❌ Internal server error");
    } finally {
      setSaving(false);
    }
  };


  const handleDownloadPdf = () => {
    if (!selectedRfq) return showError("❌ Select RFQ first");
    if (!proposalId) return showError("❌ Please send proposal first");

    window.open(`/api/proposals/pdf/${proposalId}`, "_blank");
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

    const res = await fetchWithLoader(`/api/rfqs/${rfqId}/details`);
    const data = await res.json();
    if (!res.ok) return showError("❌ " + data.message);
    console.log("rfqid", data)
    const companyId = data.header.companyId;

    // company charges
    let loadedCharges = [];

    const proposalChargesRes = await fetchWithLoader(
      `/api/proposals/${rfqId}/charges`
    );
    const proposalChargesData = await proposalChargesRes.json();

    if (proposalChargesData.success && proposalChargesData.charges?.length) {
      loadedCharges = proposalChargesData.charges;
    } else {
      // 2️⃣ fallback → company default
      const companyRes = await fetchWithLoader(
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
        hsnCode: c.hsnCode || c.hsn_code || ""
      }))
    );


    const selected = acceptedRfqs.find((x) => x.id == rfqId);
    console.log("selected", selected)
    setHeader(prev => ({
      ...prev,
      quotationNo: selected?.proposalNumber || "",
      date: new Date().toISOString().slice(0, 10),

      companyId,
      branchId: data.header.branchId,
      rfqType:
  data.header.rfqType || "",
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
      { label: "Delivery Charge", amount: 0, taxPercent: 18, hsnCode: "996812" }
    ]);
  };

  const loadRfqById = async (rfqId) => {
    try {
      setSelectedRfq(rfqId);

      const res = await fetchWithLoader(`/api/rfqs/${rfqId}/details`);
      const data = await res.json();

      if (!res.ok) return showError("❌ " + data.message);

      const companyId = data.header.companyId;

      // charges logic (same as your existing)
      let loadedCharges = [];

      const proposalChargesRes = await fetchWithLoader(
        `/api/proposals/${rfqId}/charges`
      );
      const proposalChargesData = await proposalChargesRes.json();

      if (proposalChargesData.success && proposalChargesData.charges?.length) {
        loadedCharges = proposalChargesData.charges;
      } else {
        const companyRes = await fetchWithLoader(
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
          hsnCode: c.hsnCode || ""
        }))
      );
 const selected = acceptedRfqs.find((x) => x.id == rfqId);
      // ✅ header
      setHeader(prev => ({
        ...prev,
        quotationNo: selected?.proposalNumber || "",
        date: new Date().toISOString().slice(0, 10),

        companyId,
        branchId: data.header.branchId,
        rfqType:
        data.header.rfqType || "",
        clientName: data.header.clientName,
        clientPhone: data.header.clientPhone,
        clientEmail: data.header.clientEmail,

        company: data.header.company,
        gstin: data.header.gstin,
        billingAddress: data.header.billing_address,
        shippingAddress: data.header.shipping_address,
      }));

      setItems(data.items || []);

    } catch (err) {
      showError("❌ Failed to load RFQ");
    }
  };


  /* ================= CALCULATIONS ================= */
  const calcAmount = (item) => {
    return item.qty * item.rate;
  };

  const calcTax = (amount, percent) =>
    (amount * (percent || 0)) / 100;

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

  useEffect(() => {
    if (rfqIdFromUrl) {
      loadRfqById(rfqIdFromUrl);
    }
  }, [rfqIdFromUrl]);

useEffect(() => {
  if (!rfqSearch) return;

  if (filteredRfqs.length === 1) {
    const rfq = filteredRfqs[0];

    // ✅ prevent duplicate calls
    if (rfq.id !== selectedRfq) {
      setSelectedRfq(rfq.id);
      loadRfqById(rfq.id);
    }
  } else {
    setSelectedRfq("");
  }
}, [rfqSearch]);

  const fetchAcceptedRfqs = async () => {
    const res = await fetchWithLoader("/api/proposals/accepted-rfqs");
    const data = await res.json();
    if (!res.ok) return showError("❌ " + data.message);

    setAcceptedRfqs(data.rfqs || []);
  };



  /* ================= UI ================= */
  return (
    <ProtectedRoute>
      <div className="container-xxl flex-grow-1 container-p-y">


        {mode === "edit" && (
          <>
            <div className="row g-4">
              {/* MAIN */}
              <div className="col-lg-9">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h4 className="mb-4">Proposal Editor</h4>

                    {/* RFQ */}
                    <div className="mb-4">
                      <label className="form-label">Select Accepted RFQ</label>

                      {/* 🔍 SEARCH */}
                      <input
                        type="text"
                        className="form-control mb-2"
                        placeholder="Search by RFQ No.... "
                        value={rfqSearch}
                        onChange={(e) => setRfqSearch(e.target.value)}
                      />

                      {/* DROPDOWN */}
                      <select
                        className="form-select"
                        value={selectedRfq || ""}
                        onChange={(e) => loadRfqById(e.target.value)}
                      >
                        <option value="">-- Select RFQ --</option>

                        {rfqIdFromUrl && !acceptedRfqs.some(r => r.id == rfqIdFromUrl) && (
                          <option value={rfqIdFromUrl}>
                            RFQ #{rfqIdFromUrl} (from list)
                          </option>
                        )}
{filteredRfqs.map((r) => {

  const isB2C =
    r.rfqType === "B2C";

  return (
    <option
      key={r.id}
      value={r.id}
    >
      {isB2C

        ? `${r.rfqNumber} — ${r.clientName || r.customerName}`

        : `${r.rfqNumber} — ${r.company}`
      }
    </option>
  );
})}
                      </select>
                    </div>

                    {/* HEADER */}
                    <div className="row g-3 mb-6">
                     {[
  ["quotationNo", "Quotation No"],
  ["date", "Date", "date"],
  ["clientName", "Customer Name"],
  ["clientEmail", "Customer Email"],

  ...(
    isB2C
      ? []
      : [
          ["company", "Company"],
          ["gstin", "GSTIN"],
        ]
  ),

].map(([name, label, type = "text"]) => (
                        <div className="col-md-6" key={name}>
                          <label className="form-label">{label}</label>
                          <input
                            type={type}
                            className="form-control"
                            name={name}
                            value={header[name]}
                            onChange={handleHeaderChange}
                            disabled={readonlyFields.includes(name)}
                          />
                        </div>
                      ))}

                      <div className="col-md-6">
                        <label className="form-label">Billing Address</label>
                        <textarea
                          className="form-control"
                          name="billingAddress"
                          value={header.billingAddress}
                          onChange={handleHeaderChange}
                          rows={3}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Shipping Address</label>
                        <textarea
                          className="form-control"
                          name="shippingAddress"
                          value={header.shippingAddress}
                          onChange={handleHeaderChange}
                          rows={3}
                        />
                      </div>
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

                          <col style={{ minWidth: "140px" }} />

                        </colgroup>

                        <thead className="table-primary">
                          <tr>
                            <th className="text-center">#</th>
                            <th>Description</th>
                            <th className="text-center">HSN/SAC </th>
                            <th className="text-center">Qty</th>
                            <th className="text-end">Rate</th>
                            <th className="text-end">Disc %</th>
                            <th className="text-end">Disc Amt</th>
                            <th className="text-end">Amount</th>
                            {/* ✅ ADD THESE */}
                            <th className="text-end">CGST</th>
                            <th className="text-end">SGST</th>
                            <th className="text-end">IGST</th>
                            <th className="text-end">Tax</th>
                            <th className="text-end">Total</th>
                          </tr>
                        </thead>

                        <tbody>
                          {items.map((item, i) => {
                            const amount = calcAmount(item);

                            const cgstAmt = calcTax(amount, item.cgst);
                            const sgstAmt = calcTax(amount, item.sgst);
                            const igstAmt = calcTax(amount, item.igst);

                            const tax = cgstAmt + sgstAmt + igstAmt;
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
                                  {Number(item.rate || 0).toFixed(2)}
                                </td>

                                <td className="text-end">
                                  {item.discount}%
                                </td>

                                <td className="text-end">
                                  {(item.basePrice - item.rate).toFixed(2)}
                                </td>

                                <td className="text-end">
                                  {amount.toFixed(2)}
                                </td>

                                {/* ✅ TAX COLUMNS */}
                                <td className="text-end">{cgstAmt.toFixed(2)}</td>
                                <td className="text-end">{sgstAmt.toFixed(2)}</td>
                                <td className="text-end">{igstAmt.toFixed(2)}</td>

                                <td className="text-end">{tax.toFixed(2)}</td>

                                <td className="text-end fw-semibold">
                                  {total.toFixed(2)}
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
                              <th >Charge</th>
                              <th>HSN/SAC</th>
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
                                  <td className="px-0">
                                    <input
                                      className="form-control form-control-sm"
                                      value={c.label}
                                      placeholder="Charge Name"
                                      onChange={(e) =>
                                        updateCharge(i, "label", e.target.value)
                                      }
                                    />
                                  </td>

                                  <td>
                                    <input
                                      className="form-control form-control-sm"
                                      value={c.hsnCode || ""}
                                      onChange={(e) =>
                                        updateCharge(i, "hsnCode", e.target.value)
                                      }
                                      placeholder="HSN/SAC"
                                    />
                                  </td>
                                  <td className="px-0">
                                    <input
                                      type="number"
                                      min="0"
                                      className="form-control form-control-sm"
                                      value={c.amount ?? ""}
                                      onChange={(e) =>
                                        updateCharge(i, "amount", e.target.value)
                                      }
                                    />
                                  </td>

                                  <td className="">
                                    <input
                                      type="number"
                                      min="0"
                                      className="form-control form-control-sm"
                                      value={c.taxPercent ?? ""}
                                      onChange={(e) =>
                                        updateCharge(i, "taxPercent", e.target.value)
                                      }
                                    />
                                  </td>

                                  <td className="fw-semibold ">
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
                    disabled={!selectedRfq || saving}
                  >
                    {saving ? "Saving..." : "Save Proposal"}
                  </button>

                  <button
                    className="btn btn-outline-orange mb-3 w-100"
                    onClick={() => setMode("preview")}
                  >
                    👁 Preview
                  </button>

                  {/* <button className="btn btn-outline-secondary">
              Download PDF
            </button> */}
                </div>
              </div>
            </div>
          </>
        )}

        {mode === "preview" && (
          <>
            <PreviewPage
              onBack={() => setMode("edit")}
              rfqId={selectedRfq}
            />
          </>
        )}
      </div>
    </ProtectedRoute>
  );
};


export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageInner />
    </Suspense>
  );
}
