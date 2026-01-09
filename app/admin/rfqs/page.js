"use client";
import React, { useState, useMemo } from "react";

const RFQ_STATUSES = [
  "Submitted",
  "Under Review",
  "Accepted",
  "Rejected",
];

const RFQPage = () => {
  const [organizations] = useState([
    { id: 1, name: "Tathagat Crafts", branches: ["Pune", "Mumbai"] },
    { id: 2, name: "Utsav Handicrafts", branches: ["Delhi"] },
    { id: 3, name: "Kekin Artworks", branches: ["Jaipur", "Ahmedabad"] },
  ]);

  const [rfqs, setRfqs] = useState([
    {
      id: 201,
      orgId: 1,
      branch: "Pune",
      submittedAt: "2026-01-01 10:00 AM",
      status: "Submitted",
      notes: "Products required for corporate gifting.",
      products: [
        {
          id: 1,
          name: "Madhubani Foldable Lamp",
          code: "TL-1800",
          category: "Lighting",
          hsn: "44209090",
          quantity: 2,
        },
        {
          id: 2,
          name: "Phad Foldable Lamp",
          code: "UL-1801",
          category: "Lighting",
          hsn: "44209090",
          quantity: 2,
        },
      ],
    },
    {
      id: 202,
      orgId: 2,
      branch: "Delhi",
      submittedAt: "2026-01-01 11:30 AM",
      status: "Under Review",
      notes: "",
      products: [
        {
          id: 3,
          name: "Kalamkari Foldable Lamp",
          code: "KL-1802",
          category: "Decor",
          hsn: "44209090",
          quantity: 3,
        },
      ],
    },
    {
      id: 203,
      orgId: 3,
      branch: "Jaipur",
      submittedAt: "2026-01-02 09:15 AM",
      status: "Submitted",
      notes: "Urgent requirement.",
      products: [
        {
          id: 4,
          name: "Hand-painted Wooden Lamp",
          code: "KA-1900",
          category: "Decor",
          hsn: "44209090",
          quantity: 1,
        },
      ],
    },
  ]);

  const [selectedOrg, setSelectedOrg] = useState("all");
  const [selectedBranch, setSelectedBranch] = useState("all");
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

  const availableBranches = useMemo(() => {
    if (selectedOrg === "all") return [];
    const org = organizations.find((o) => o.id === Number(selectedOrg));
    return org ? org.branches : [];
  }, [selectedOrg, organizations]);

  const updateStatus = (rfqId, status) => {
    setRfqs((prev) =>
      prev.map((r) => (r.id === rfqId ? { ...r, status } : r))
    );
  };

  const getOrgName = (orgId) =>
    organizations.find((o) => o.id === orgId)?.name || "Unknown Org";

  const filteredRfqs = rfqs.filter((rfq) => {
    const orgMatch = selectedOrg === "all" || rfq.orgId === Number(selectedOrg);
    const branchMatch =
      selectedBranch === "all" || rfq.branch === selectedBranch;
    const statusMatch =
      selectedStatus === "all" || rfq.status === selectedStatus;
    const productMatch =
      selectedProduct === "all" ||
      rfq.products.some((p) => p.id === Number(selectedProduct));

    return orgMatch && branchMatch && statusMatch && productMatch;
  });

  const statusBadgeClass = (status) => {
    switch (status) {
      case "Submitted":
        return "bg-label-primary";
      case "Under Review":
        return "bg-label-warning";
      case "Accepted":
        return "bg-label-success";
      case "Rejected":
        return "bg-label-danger";
      default:
        return "bg-label-secondary";
    }
  };

  return (
    <div className="container-xxl container-p-y">
      <h4 className="mb-4 text-primary">RFQ Management</h4>

      {/* Filters */}
      <div className="row mb-4 g-3">
        <div className="col-md-3">
          <label className="form-label">Organization</label>
          <select
            className="form-select"
            value={selectedOrg}
            onChange={(e) => {
              setSelectedOrg(e.target.value);
              setSelectedBranch("all");
            }}
          >
            <option value="all">All Organizations</option>
            {organizations.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <label className="form-label">Branch</label>
          <select
            className="form-select"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            disabled={selectedOrg === "all"}
          >
            <option value="all">All Branches</option>
            {availableBranches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <label className="form-label">Product</label>
          <select
            className="form-select"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <option value="all">All Products</option>
            {allProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <label className="form-label">Status</label>
          <select
            className="form-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            {RFQ_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredRfqs.length === 0 && (
        <p className="text-muted">No RFQs match selected filters.</p>
      )}

      {filteredRfqs.map((rfq) => (
        <div key={rfq.id} className="card mb-4 shadow-sm">
          <div className="card-header d-flex justify-content-between flex-wrap gap-2">
            <strong>
              RFQ #{rfq.id} — {getOrgName(rfq.orgId)} ({rfq.branch})
            </strong>
            <span className={`badge ${statusBadgeClass(rfq.status)}`}>
              {rfq.status}
            </span>
          </div>

          <div className="card-body">
            <p className="text-muted">Submitted at: {rfq.submittedAt}</p>

            {/* Products table */}
            <div className="table-responsive">
              <table className="table table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Product</th>
                    <th>SKU / Code</th>
                    <th>Category</th>
                    <th>HSN</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {rfq.products.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{p.code}</td>
                      <td>{p.category}</td>
                      <td>{p.hsn}</td>
                      <td>{p.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {rfq.notes && (
              <div className="mt-3">
                <strong>Organization Notes:</strong>
                <p className="mb-0 text-muted">{rfq.notes}</p>
              </div>
            )}

            {/* Admin Actions */}
            {rfq.status === "Submitted" && (
              <div className="d-flex gap-2 mt-4">
                <button
                  className="btn btn-warning btn-sm"
                  onClick={() => updateStatus(rfq.id, "Under Review")}
                >
                  Mark Under Review
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => updateStatus(rfq.id, "Rejected")}
                >
                  Reject
                </button>
              </div>
            )}

            {rfq.status === "Under Review" && (
              <div className="d-flex gap-2 mt-4">
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => updateStatus(rfq.id, "Accepted")}
                >
                  Accept RFQ
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
