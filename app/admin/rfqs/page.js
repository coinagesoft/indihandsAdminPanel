"use client";
import React, { useState, useMemo, useEffect } from "react";

const RFQ_STATUSES = ["Submitted", "Under Review", "Accepted", "Rejected"];

const RFQPage = () => {
  const [organizations, setOrganizations] = useState([]);
  const [rfqs, setRfqs] = useState([]);

  const [selectedOrg, setSelectedOrg] = useState("all");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [statusLoading, setStatusLoading] = useState(null);
  /* ---------------- API ---------------- */

  useEffect(() => {
    fetchRfqs();
  }, []);

  const fetchRfqs = async () => {
    try {
      const res = await fetch("/api/rfqs");
      const data = await res.json();
 console.log("rfq",data)
      if (!res.ok) throw new Error(data.message || "Failed to load RFQs");

      setOrganizations(data.organizations || []);
      setRfqs(data.rfqs || []);
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  // const updateStatus = async (rfqId, status) => {
  //   const res = await fetch(`/api/rfqs/${rfqId}`, {
  //     method: "PATCH",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ status }),
  //   });

  //   const data = await res.json();
  //   if (!res.ok) return alert("❌ " + data.message);

  //   // Show alert based on email sent status
  //   if (data.emailSent) {
  //     alert(`✅ Status updated to "${status}" and email sent to client (${data.clientEmail})`);
  //   } else if (data.emailError) {
  //     alert(`⚠️ Status updated to "${status}" but failed to send email: ${data.emailError}`);
  //   } else {
  //     alert(`✅ Status updated to "${status}"`);
  //   }

  //   setRfqs((prev) =>
  //     prev.map((r) => (r.id === rfqId ? { ...r, status } : r))
  //   );
  // };

  const updateStatus = async (rfqId, status) => {
  const key = `${rfqId}-${status}`;
  setStatusLoading(key);

  try {
    const res = await fetch(`/api/rfqs/${rfqId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Update failed");

    if (data.emailSent) {
      alert(`✅ Status "${status}" & email sent)`);
    } else if (data.emailError) {
      alert(`⚠️ Status updated but email failed`);
    } else {
      alert(`✅ Status updated`);
    }

    setRfqs(prev =>
      prev.map(r => (r.id === rfqId ? { ...r, status } : r))
    );

  } catch (e) {
    alert("❌ " + e.message);
  } finally {
    setStatusLoading(null);
  }
};
  /* ---------------- FILTER HELPERS ---------------- */

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
    return org?.branches || [];
  }, [selectedOrg, organizations]);


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

  /* ---------------- UI ---------------- */

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
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}

          </select>
        </div>

        {/* <div className="col-md-3">
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
        </div> */}

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
          <div className="card-header d-flex justify-content-between">
            <strong>
              {rfq.rfqNumber} — {rfq.orgName} ({rfq.branch})
            </strong>
            <span className={`badge ${statusBadgeClass(rfq.status)}`}>
              {rfq.status}
            </span>
          </div>

          <div className="card-body">
            <p className="text-muted">Submitted at: {rfq.submittedAt}</p>
  {/* ✅ CLIENT DETAILS */}
  <div className="mb-3 row">
    <div className="col-4"><strong>Client Name:</strong> {rfq.clientName || "-"}</div>
    <div className="col-3"><strong>Phone:</strong> {rfq.clientPhone || "-"}</div>
    <div className="col-5"><strong>Email:</strong> {rfq.clientEmail || "-"}</div>
  </div>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Product</th>
                     <th>HSN</th>
                    <th>Code</th>
                    <th>Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {rfq.products.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                       <td>{p.hsn || "-"}</td>
                      <td>{p.code}</td>
                      <td>{p.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          {rfq.status !== "Accepted" && rfq.status !== "Rejected" && (
  <div className="d-flex gap-2 mt-3">

    {/* UNDER REVIEW */}
    {rfq.status === "Submitted" && (
      <button
        className="btn btn-warning btn-sm"
        disabled={statusLoading === `${rfq.id}-Under Review`}
        onClick={() => updateStatus(rfq.id, "Under Review")}
      >
        {statusLoading === `${rfq.id}-Under Review` ? (
          <>
            <span className="spinner-border spinner-border-sm me-1"></span>
            Sending...
          </>
        ) : (
          "Mark Under Review"
        )}
      </button>
    )}

    {/* ACCEPT */}
    <button
      className="btn btn-success btn-sm"
      disabled={statusLoading === `${rfq.id}-Accepted`}
      onClick={() => updateStatus(rfq.id, "Accepted")}
    >
      {statusLoading === `${rfq.id}-Accepted` ? (
        <>
          <span className="spinner-border spinner-border-sm me-1"></span>
          Sending...
        </>
      ) : (
        "Accept"
      )}
    </button>

    {/* REJECT */}
    <button
      className="btn btn-danger btn-sm"
      disabled={statusLoading === `${rfq.id}-Rejected`}
      onClick={() => updateStatus(rfq.id, "Rejected")}
    >
      {statusLoading === `${rfq.id}-Rejected` ? (
        <>
          <span className="spinner-border spinner-border-sm me-1"></span>
          Sending...
        </>
      ) : (
        "Reject"
      )}
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
