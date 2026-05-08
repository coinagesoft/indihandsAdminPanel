"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "../../../../components/ProtectedRoute";
import { useFetchWithLoader } from "../../../../lib/fetchWithLoader";

export default function InvoiceList() {
  const fetchWithLoader = useFetchWithLoader();
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [invoiceType, setInvoiceType] = useState("B2B");

useEffect(() => {
  const load = async () => {
    try {

      setInvoices([]);

      const apiUrl =
        invoiceType === "B2B"
          ? `/api/challan/invoiceList?search=${search}&fromDate=${fromDate}&toDate=${toDate}`
          : `/api/challan/invoiceList/b2cList?search=${search}&fromDate=${fromDate}&toDate=${toDate}`;

      console.log("FETCHING API:", apiUrl);

      const res = await fetchWithLoader(apiUrl);

      const data = await res.json();

      console.log("API DATA:", data);

      setInvoices(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error("Invoice fetch error:", err);
      setInvoices([]);
    }
  };

  load();

}, [invoiceType, search, fromDate, toDate]);
  /* ========= FILTER ========= */
  const filtered = invoices.filter(inv => {
    const s = search.toLowerCase();

    let match =
      (inv.invoice_number || "").toLowerCase().includes(s) ||
    (inv.proposal_number || "").toLowerCase().includes(s)||
      (inv.client_name || "").toLowerCase().includes(s);

    if (fromDate) {
      match = match && inv.invoice_date >= fromDate;
    }

    if (toDate) {
      match = match && inv.invoice_date <= toDate;
    }

    return match;
  });

  
  return (
    <ProtectedRoute>
      <div className="container-xxl py-4">

        <h4 className="mb-4 text-primary">Invoice List</h4>
<div className="d-flex gap-2 mb-3">

  <button
    className={`btn ${
      invoiceType === "B2B"
        ? "btn-orange"
        : "btn-outline-orange"
    }`}
    onClick={() => setInvoiceType("B2B")}
  >
    Company Invoices
  </button>

  <button
    className={`btn ${
      invoiceType === "B2C"
        ? "btn-orange"
        : "btn-outline-orange"
    }`}
    onClick={() => setInvoiceType("B2C")}
  >
    Customer Invoices
  </button>

</div>
        {/* FILTER BAR */}
        <div className="card p-3 mb-3">
          <div className="row g-2">

            {/* 🔍 SEARCH */}
            <div className="col-md-6">
              <input
                className="form-control"
                placeholder="Search Invoice No / Proposal No / Client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* 📅 FROM */}
            <div className="col-md-2">
              <input
                type="date"
                className="form-control"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            {/* 📅 TO */}
            <div className="col-md-2">
              <input
                type="date"
                className="form-control"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            {/* 🔄 RESET */}
            <div className="col-md-2">
              <button
                className="btn btn-orange mt-1 w-100"
                onClick={() => {
                  setSearch("");
                  setFromDate("");
                  setToDate("");
                }}
              >
                Reset
              </button>
            </div>

          </div>
        </div>

        {/* TABLE */}
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Invoice No</th>
                  <th>Proposal No</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th className="text-end">Amount</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-4">
                      No invoices found
                    </td>
                  </tr>
                )}

                {filtered.map((inv, i) => (
                  <tr key={inv.id}>

                    <td>{i + 1}</td>

                    <td className="fw-semibold " style={{ fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {inv.invoice_number}
                    </td>

                    <td style={{ fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{inv.proposal_number}</td>

                    <td style={{ fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{inv.client_name}</td>

                    <td style={{ fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{inv.invoice_date?.slice(0, 10)}</td>

                    <td className="text-end fw-semibold" style={{ fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      ₹ {Number(inv.grand_total || 0).toFixed(2)}
                    </td>

                   

                    <td className="text-center" style={{ fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>

                      {/* VIEW */}
                    {invoiceType === "B2B" && (
  <button
    className="btn btn-sm btn-outline-orange me-2"
    onClick={() =>
      window.open(`/admin/invoice/create?proposalId=${inv.proposal_id}`)
    }
  >
    Edit
  </button>
)}

                      {/* PDF */}
                      <button
  className="btn btn-sm btn-outline-secondary"
  onClick={() =>
    window.open(
      invoiceType === "B2B"
        ? `/api/invoices/pdf/${inv.proposal_id}`
        : `/api/challan/invoiceList/b2cList/pdf/${inv.id}`
    )
  }
>
  PDF
</button>

                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>

      </div>
    </ProtectedRoute>
  );
}