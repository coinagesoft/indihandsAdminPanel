"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from '../../../components/ProtectedRoute'
import { useFetchWithLoader } from "../../../lib/fetchWithLoader";
import { useRouter } from "next/navigation";
export default function ProposalStatusPage() {

  const [list, setList] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const fetchWithLoader = useFetchWithLoader();
  const router = useRouter();
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [search, setSearch] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);

  /* ================= LOAD ================= */
  useEffect(() => {
    Promise.all([
      fetchWithLoader("/api/proposals").then(r => r.json()),
      fetchWithLoader("/api/companies").then(r => r.json())
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

    // 🔍 SEARCH FILTER
    if (search) {
      const s = search.toLowerCase();

      data = data.filter(x =>
        (x.proposal_number || "").toLowerCase().includes(s) ||
        (x.rfq_number || "").toLowerCase().includes(s) ||
        (x.client_name || "").toLowerCase().includes(s) ||
        (x.client_email || "").toLowerCase().includes(s)
      );
    }

    // 🏢 COMPANY
    if (companyId) {
      data = data.filter(x => x.company_id == companyId);
    }

    // 🏬 BRANCH
    if (branchId) {
      data = data.filter(x => x.branch_id == branchId);
    }

    // 📌 STATUS
    if (status) {
      data = data.filter(x => x.status === status);
    }

    // 📅 DATE RANGE
    if (fromDate) {
      data = data.filter(x => x.proposal_date && x.proposal_date >= fromDate);
    }

    if (toDate) {
      data = data.filter(x => x.proposal_date && x.proposal_date <= toDate);
    }

    setFiltered(data);
  }, [search, companyId, branchId, status, fromDate, toDate, list]);

  /* ================= BADGE ================= */
  const badge = (s) => {
    if (s === "Approved") return "bg-success";
    if (s === "Rejected") return "bg-danger";
    if (s === "Sent") return "bg-info";
    return "bg-secondary";
  };

  // if (loading) return <div className="p-4">Loading…</div>;

  return (
    <ProtectedRoute>
      <div className="container-xxl container-p-y ">

        <h4 className="mb-4 text-primary">Proposal History</h4>

        <div className="card p-3 mb-3">

          <div className="row g-3 align-items-end">
            <div className="col-md-12">
              <label className="form-label mb-1">Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by Proposal ID, RFQ ID, Client, Email, or Phone"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {/* ORG */}
            <div className="col-md-3">
              <label className="form-label mb-1">Organization</label>
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
            <div className="col-md-2">
              <label className="form-label mb-1">Branch</label>
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
            <div className="col-md-3">
              <label className="form-label mb-1">Status</label>
              <select
                className="form-select"
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option>Pending</option>
                <option>Sent</option>
                <option>Approved</option>
                <option>Rejected</option>
              </select>
            </div>


            {/* FROM */}
            <div className="col-md-2">
              <label className="form-label mb-1">From</label>
              <input
                type="date"
                className="form-control"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            {/* TO */}
            <div className="col-md-2">
              <label className="form-label mb-1">To</label>
              <input
                type="date"
                className="form-control"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

          </div>
        </div>

        {/* ================= TABLE ================= */}
        <div className="card ">
          <div className="table-responsive" style={{ maxHeight: "400px", overflowY: "auto", overflowX: "auto" }}>
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "120px" }}>Proposal</th>
                  <th style={{ width: "150px" }}>RFQ</th>
                  <th style={{ width: "220px" }}>Client</th>
                  <th style={{ width: "250px" }}>Company</th>
                  <th style={{ width: "200px" }}>Branch</th>
                  <th style={{ width: "120px" }}>Date</th>
                  <th style={{ width: "120px" }}>Total</th>
                  <th style={{ width: "120px" }}>Status</th>
                  <th style={{ width: "150px" }}>Next Step</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} > <b>{p.proposal_number}</b></td>
                    <td style={{ fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.rfq_number || "-"}</td>

                    <td style={{ fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {p.client_name}
                      <div className="text-muted small" style={{ fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} >
                        {p.client_email}
                      </div>
                      <div className="text-muted small" style={{ fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} >
                        {p.client_phone}
                      </div>
                    </td>

                    <td style={{ fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}  >{p.company_name}</td>
                    <td style={{ fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} >{p.branch_name}</td>

                    <td style={{ fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} >
                      {p.proposal_date
                        ? new Date(p.proposal_date)
                          .toLocaleDateString("en-IN")
                        : "-"}
                    </td>

                    <td style={{ fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} >
                      ₹ {Number(p.grand_total || 0)
                        .toLocaleString()}
                    </td>

                    <td>
                      <span className={`badge ${badge(p.status)}`} style={{ fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} >
                        {p.status}
                      </span>
                    </td>
                    <td style={{ fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} >
                      {(p.status === "Approved" || p.status === "Sent") ? (
                        <button
                          className="btn btn-sm btn-outline-orange"
                          onClick={() =>
                            router.push(`/admin/invoice/create?proposalId=${p.id}`)
                          }
                          style={{ fontSize: "12px" }}
                        >
                          Create Invoice
                        </button>
                      ) : (
                        <span className="text-muted small">Not Available</span>
                      )}
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
    </ProtectedRoute>
  );
}