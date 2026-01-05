"use client";
import React, { useState } from "react";

const RFQPage = () => {
  const [clients] = useState([
    { id: 1, name: "Client A" },
    { id: 2, name: "Client B" },
  ]);

  const [products] = useState([
    { id: 1, name: "Product X" },
    { id: 2, name: "Product Y" },
    { id: 3, name: "Product Z" },
  ]);

  const [rfqs, setRfqs] = useState([
    {
      id: 101,
      clientId: 1,
      products: [
        { id: 1, name: "Product X", quantity: 10 },
        { id: 2, name: "Product Y", quantity: 5 },
      ],
      status: "Submitted",
      submittedAt: "2026-01-01 10:00 AM",
    },
    {
      id: 102,
      clientId: 2,
      products: [{ id: 1, name: "Product X", quantity: 2 }],
      status: "Submitted",
      submittedAt: "2026-01-01 11:30 AM",
    },
    {
      id: 103,
      clientId: 1,
      products: [{ id: 3, name: "Product Z", quantity: 7 }],
      status: "Reviewed",
      submittedAt: "2026-01-01 12:15 PM",
    },
  ]);

  // Filters
  const [selectedClient, setSelectedClient] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const updateStatus = (rfqId, status) => {
    setRfqs((prev) =>
      prev.map((r) => (r.id === rfqId ? { ...r, status } : r))
    );
  };

  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.name : "Unknown Client";
  };

  const filteredRfqs = rfqs.filter((rfq) => {
    const clientMatch =
      selectedClient === "all" || rfq.clientId === Number(selectedClient);

    const statusMatch =
      selectedStatus === "all" || rfq.status === selectedStatus;

    const productMatch =
      selectedProduct === "all" ||
      rfq.products.some((p) => p.id === Number(selectedProduct));

    return clientMatch && statusMatch && productMatch;
  });

  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      <h4 className="mb-4">RFQ Management</h4>

      {/* Filters */}
      <div className="row mb-4 g-3">
        <div className="col-md-4">
          <label className="form-label">Filter by Client</label>
          <select
            className="form-select"
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
          >
            <option value="all">All Clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label">Filter by Product</label>
          <select
            className="form-select"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <option value="all">All Products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
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
          <div className="card-header d-flex justify-content-between align-items-center">
            <strong>
              RFQ #{rfq.id} — {getClientName(rfq.clientId)}
            </strong>
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
            <p className="text-muted">
              Submitted at: {rfq.submittedAt}
            </p>

            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {rfq.products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {rfq.status === "Submitted" && (
              <div className="d-flex gap-2 mt-3">
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => updateStatus(rfq.id, "Reviewed")}
                >
                  Mark Reviewed
                </button>
                <button
                  className="btn btn-danger btn-sm"
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
