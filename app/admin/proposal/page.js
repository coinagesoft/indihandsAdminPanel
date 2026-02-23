"use client";

import { useEffect, useState } from "react";

export default function ProposalStatusPage() {

  const [list, setList] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);

  const [companyId, setCompanyId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);

  /* ================= LOAD ================= */
  useEffect(() => {
    Promise.all([
      fetch("/api/proposals").then(r => r.json()),
      fetch("/api/companies").then(r => r.json())
    ])
      .then(([proposals, compData]) => {
        setList(proposals || []);
        setFiltered(proposals || []);
        setCompanies(compData.companies || []);
      })
      .finally(() => setLoading(false));
  }, []);

  /* ================= COMPANY → BRANCH ================= */
  useEffect(() => {
    if (!companyId) {
      setBranches([]);
      return;
    }

    const comp = companies.find(c => c.id == companyId);
    setBranches(comp?.branches || []);
  }, [companyId, companies]);

  /* ================= FILTER ================= */
  useEffect(() => {
    let data = [...list];

    if (companyId) data = data.filter(x => x.company_id == companyId);
    if (branchId) data = data.filter(x => x.branch_id == branchId);
    if (status) data = data.filter(x => x.status === status);

    setFiltered(data);
  }, [companyId, branchId, status, list]);

  /* ================= BADGE ================= */
  const badge = (s) => {
    if (s === "Approved") return "bg-success";
    if (s === "Rejected") return "bg-danger";
    if (s === "Sent") return "bg-info";
    if (s === "Pending") return "bg-warning text-dark";
    return "bg-secondary";
  };

  if (loading) return <div className="p-4">Loading…</div>;

  return (
    <div className="container-xxl container-p-y ">

     <h4 className="mb-4 text-primary">Proposal History</h4>

      {/* ================= FILTER BAR ================= */}
      <div className="card p-3 mb-3">
        <div className="row g-2">

          {/* ORG */}
          <div className="col-md-4">
            <select
              className="form-select"
              value={companyId}
              onChange={(e) => {
                setCompanyId(e.target.value);
                setBranchId("");
              }}
            >
              <option value="">All Organizations</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>
                  {c.companyName}
                </option>
              ))}
            </select>
          </div>

          {/* BRANCH */}
          <div className="col-md-4">
            <select
              className="form-select"
              value={branchId}
              onChange={e => setBranchId(e.target.value)}
              disabled={!companyId}
            >
              <option value="">All Branches</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.branchName}
                </option>
              ))}
            </select>
          </div>

          {/* STATUS */}
          <div className="col-md-4">
            <select
              className="form-select"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option>Draft</option>
              <option>Pending</option>
              <option>Sent</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>
          </div>

        

        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="card ">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Proposal</th>
                {/* <th>RFQ</th> */}
                {/* <th>Client</th> */}
                <th>Company</th>
                <th>Branch</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
<td style={{ fontSize: "12px" }}> <b>{p.proposal_number}</b></td>           
       {/* <td>{p.rfq_number || "-"}</td> */}

                  {/* <td>
                    {p.client_name}
                    <div className="text-muted small">
                      {p.client_email}
                    </div>
                  </td> */}

                  <td>{p.company_name}</td>
                  <td>{p.branch_name}</td>

                  <td>
                    {p.proposal_date
                      ? new Date(p.proposal_date)
                          .toLocaleDateString("en-IN")
                      : "-"}
                  </td>

                  <td>
                    ₹ {Number(p.grand_total || 0)
                        .toLocaleString()}
                  </td>

                  <td>
                    <span className={`badge ${badge(p.status)}`}>
                      {p.status}
                    </span>
                  </td>

            
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-4">
                    No proposals found
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}