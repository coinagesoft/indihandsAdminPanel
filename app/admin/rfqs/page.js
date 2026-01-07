"use client";
import React, { useState, useMemo } from "react";

const RFQPage = () => {
  const [clients] = useState([
    { id: 1, name: "Client A" },
    { id: 2, name: "Client B" },
  ]);

  const [rfqs, setRfqs] = useState([
    {
      id: 101,
      clientId: 1,
      submittedAt: "2026-01-01 10:00 AM",
      status: "Submitted",
      notes: "Lights required for gifting purpose.",
      products: [
        { id: 1, name: "TATHAGAT : MADHUBANI FOLDABLE LAMP", code: "1800", hsn: "44209090", quantity: 2 },
        { id: 2, name: "UTSAV : PHAD FOLDABLE LAMP", code: "1800", hsn: "44209090", quantity: 2 },
      ],
    },
    {
      id: 102,
      clientId: 2,
      submittedAt: "2026-01-01 11:30 AM",
      status: "Reviewed",
      notes: "",
      products: [
        { id: 3, name: "KEKIN : KALAMKARI FOLDABLE LAMP", code: "1800", hsn: "44209090", quantity: 2 },
      ],
    },
  ]);

  const [selectedClient, setSelectedClient] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState("all");

  const allProducts = useMemo(() => {
    const map = new Map();
    rfqs.forEach((r) =>
      r.products.forEach((p) => {
        if (!map.has(p.id)) map.set(p.id, { id: p.id, name: p.name });
      })
    );
    return Array.from(map.values());
  }, [rfqs]);

  const updateStatus = (rfqId, status) => {
    setRfqs((prev) => prev.map((r) => (r.id === rfqId ? { ...r, status } : r)));
  };

  const getClientName = (clientId) => clients.find((c) => c.id === clientId)?.name || "Unknown Client";

  const filteredRfqs = rfqs.filter((rfq) => {
    const clientMatch = selectedClient === "all" || rfq.clientId === Number(selectedClient);
    const statusMatch = selectedStatus === "all" || rfq.status === selectedStatus;
    const productMatch = selectedProduct === "all" || rfq.products.some((p) => p.id === Number(selectedProduct));
    return clientMatch && statusMatch && productMatch;
  });

  return (
    <div className="container-xxl container-p-y">
      <h4 className="mb-4 text-primary">RFQ Management</h4>

      {/* Filters */}
      <div className="row mb-4 g-3">
        <div className="col-12 col-md-4">
          <label className="form-label">Filter by Client</label>
          <select
            className="form-select"
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
          >
            <option value="all">All Clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="col-12 col-md-4">
          <label className="form-label">Filter by Product</label>
          <select
            className="form-select"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <option value="all">All Products</option>
            {allProducts.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="col-12 col-md-4">
          <label className="form-label">Filter by Status</label>
          <select
            className="form-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {filteredRfqs.length === 0 && (
        <p className="text-muted">No RFQs match the selected filters.</p>
      )}

      {filteredRfqs.map((rfq) => (
        <div key={rfq.id} className="card mb-4 shadow-sm">
          <div className="card-header d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
            <strong>RFQ #{rfq.id} — {getClientName(rfq.clientId)}</strong>
            <span
              className={`badge ${
                rfq.status === "Submitted"
                  ? "bg-label-primary"
                  : rfq.status === "Reviewed"
                  ? "bg-label-success"
                  : "bg-label-danger"
              }`}
            >
              {rfq.status}
            </span>
          </div>

          <div className="card-body">
            <p className="text-muted mb-2">Submitted at: {rfq.submittedAt}</p>

            {/* Responsive table */}
            <div className="table-responsive">
              <table className="table table-striped table-bordered align-middle mb-3">
                <thead className="table-light">
                  <tr>
                    <th>Product</th>
                    <th>Code</th>
                    <th>HSN/SAC</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {rfq.products.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{p.code}</td>
                      <td>{p.hsn}</td>
                      <td>{p.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {rfq.notes && (
              <div className="mt-3">
                <strong>Client Notes:</strong>
                <p className="mb-0 text-muted">{rfq.notes}</p>
              </div>
            )}

            {rfq.status === "Submitted" && (
              <div className="d-flex flex-wrap gap-2 mt-4">
                <button
                  className="btn btn-success btn-sm flex-grow-1 flex-md-grow-0"
                  onClick={() => updateStatus(rfq.id, "Reviewed")}
                >
                  Mark Reviewed
                </button>
                <button
                  className="btn btn-danger btn-sm flex-grow-1 flex-md-grow-0"
                  onClick={() => updateStatus(rfq.id, "Rejected")}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RFQPage;
