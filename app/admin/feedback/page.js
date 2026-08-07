"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { useFetchWithLoader } from "../../../lib/fetchWithLoader";

export default function FeedbackPage() {

    const fetchWithLoader = useFetchWithLoader();

    const [loading, setLoading] = useState(true);

    const [list, setList] = useState([]);
    const [filtered, setFiltered] = useState([]);

    const [search, setSearch] = useState("");

    const [activeTab, setActiveTab] = useState("B2B");

    const [rating, setRating] = useState("");

    const [source, setSource] = useState("");

    const [selectedFeedback, setSelectedFeedback] = useState(null);

    const [showModal, setShowModal] = useState(false);

    /* ================= LOAD ================= */

    useEffect(() => {

        loadFeedback();

    }, []);

    const loadFeedback = async () => {

        try {

            const res = await fetchWithLoader("/api/feedback");

            const data = await res.json();

            setList(data || []);

            setFiltered(data || []);

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);

        }

    };

    /* ================= FILTER ================= */

    useEffect(() => {

        let rows = [...list];

        rows = rows.filter(
            x => (x.client_type || "B2B") === activeTab
        );

        if (search) {

            const s = search.toLowerCase();

            rows = rows.filter(x =>

                (x.proposal_number || "")
                    .toLowerCase()
                    .includes(s)

                ||

                (x.invoice_number || "")
                    .toLowerCase()
                    .includes(s)

                ||

                (x.company_name || "")
                    .toLowerCase()
                    .includes(s)

                ||

                (x.branch_name || "")
                    .toLowerCase()
                    .includes(s)

                ||

                (x.customer_name || "")
                    .toLowerCase()
                    .includes(s)

                ||

                (x.comments || "")
                    .toLowerCase()
                    .includes(s)

            );

        }

        if (rating) {

            rows = rows.filter(
                x => String(x.rating) === rating
            );

        }

        if (source) {

            rows = rows.filter(
                x => x.feedback_source === source
            );

        }

        setFiltered(rows);

    }, [
        list,
        activeTab,
        search,
        rating,
        source
    ]);

    /* ================= RATING ================= */

    const getRating = (value) => {

        switch (Number(value)) {

            case 5:
                return "😍 Excellent";

            case 4:
                return "🙂 Good";

            case 3:
                return "😐 Average";

            case 2:
                return "🙁 Poor";

            case 1:
                return "😡 Very Poor";

            default:
                return "-";

        }

    };

    if (loading) {

        return (
            <ProtectedRoute>
                <div className="container-xxl container-p-y">
                    Loading...
                </div>
            </ProtectedRoute>
        );

    }

    return (

        <ProtectedRoute>

            <div className="container-xxl container-p-y">

                <h4 className="mb-4 text-primary">

                    Feedback Management

                </h4>

                {/* ================= TABS ================= */}

                <div className="mb-3 d-flex gap-2">

                    <button
                        className={`btn ${activeTab === "B2B"
                                ? "btn-orange"
                                : "btn-outline-orange"
                            }`}
                        onClick={() => setActiveTab("B2B")}
                    >
                        Company Feedback
                    </button>

                    <button
                        className={`btn ${activeTab === "B2C"
                                ? "btn-orange"
                                : "btn-outline-orange"
                            }`}
                        onClick={() => setActiveTab("B2C")}
                    >
                        Customer Feedback
                    </button>

                </div>

                {/* ================= FILTER ================= */}

                <div className="card p-3 mb-3">

                    <div className="row g-3 align-items-end">

                        <div className="col-md-6">

                            <label className="form-label">

                                Search

                            </label>

                            <input
                                className="form-control"
                                placeholder="Search proposal, invoice, company, branch..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />

                        </div>

                        <div className="col-md-3">

                            <label className="form-label">

                                Rating

                            </label>

                            <select
                                className="form-select"
                                value={rating}
                                onChange={(e) =>
                                    setRating(e.target.value)
                                }
                            >

                                <option value="">All</option>

                                <option value="5">
                                    😍 Excellent
                                </option>

                                <option value="4">
                                    🙂 Good
                                </option>

                                <option value="3">
                                    😐 Average
                                </option>

                                <option value="2">
                                    🙁 Poor
                                </option>

                                <option value="1">
                                    😡 Very Poor
                                </option>

                            </select>

                        </div>

                        <div className="col-md-3">

                            <label className="form-label">

                                Source

                            </label>

                            <select
                                className="form-select"
                                value={source}
                                onChange={(e) =>
                                    setSource(e.target.value)
                                }
                            >

                                <option value="">All</option>

                                <option>
                                    Proposal
                                </option>

                                <option>
                                    Invoice
                                </option>

                            </select>

                        </div>

                    </div>

                </div>

                {/* ================= TABLE ================= */}

                <div className="card">

                    <div
                        className="table-responsive"
                        style={{
                            maxHeight: "500px",
                            overflowY: "auto",
                        }}
                    >

                        <table className="table table-hover align-middle">

                            <thead className="table-light">

                                <tr>

                                    <th>Proposal</th>

                                    <th>Invoice</th>

                                    <th>Client</th>

                                    <th>Rating</th>

                                    <th>Source</th>

                                    <th>Feedback</th>

                                    <th>Date</th>

                                    <th>Action</th>

                                </tr>

                            </thead>

                            <tbody>

                                {filtered.length === 0 ? (

                                    <tr>

                                        <td colSpan="8" className="text-center py-5">
                                            No feedback found.
                                        </td>

                                    </tr>

                                ) : (

                                    filtered.map((item) => (

                                        <tr key={item.id}>

                                            <td style={{
                                                whiteSpace: "nowrap",
                                                minWidth: "170px",
                                            }}>{item.proposal_number || "-"}</td>

                                            <td>{item.invoice_number || "-"}</td>

                                            <td style={{
                                                whiteSpace: "nowrap",
                                                minWidth: "220px",
                                            }}>
                                                {activeTab === "B2B"
                                                    ? item.client_name || "-"
                                                    : item.customer_name || "-"}
                                            </td>

                                            <td style={{ fontSize: "20px" }}>
                                                {item.rating === 5 && "😍"}
                                                {item.rating === 4 && "🙂"}
                                                {item.rating === 3 && "😐"}
                                                {item.rating === 2 && "🙁"}
                                                {item.rating === 1 && "😡"}
                                                {!item.rating && "-"}
                                            </td>

                                            <td>
                                                <span
                                                    className={`badge ${item.feedback_source === "Proposal"
                                                            ? "bg-info"
                                                            : "bg-warning text-dark"
                                                        }`}
                                                >
                                                    {item.feedback_source}
                                                </span>
                                            </td>

                                            <td
                                                style={{
                                                    maxWidth: "280px",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                }}
                                                title={item.comments}
                                            >
                                                {item.comments || "-"}
                                            </td>

                                            <td>
                                                {item.submitted_at
                                                    ? new Date(item.submitted_at).toLocaleDateString("en-IN")
                                                    : "-"}
                                            </td>

                                            <td>

                                                <button
                                                    className="btn btn-sm btn-outline-orange"
                                                    onClick={() => {
                                                        setSelectedFeedback(item);
                                                        setShowModal(true);
                                                    }}
                                                >
                                                    View
                                                </button>

                                            </td>

                                        </tr>

                                    ))

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

                {/* ================= VIEW MODAL ================= */}

                {showModal && selectedFeedback && (

                    <div
                        className="modal fade show"
                        style={{
                            display: "block",
                            background: "rgba(0,0,0,.45)",
                        }}
                    >

                        <div className="modal-dialog modal-md modal-dialog-centered">

                            <div className="modal-content">

                                <div className="modal-header">

                                    <h5 className="modal-title">
                                        Feedback Details
                                    </h5>

                                    <button
                                        className="btn-close"
                                        onClick={() =>
                                            setShowModal(false)
                                        }
                                    />

                                </div>

                               <div className="modal-body">

  <table className="table table-sm mb-0">

    <tbody>

      <tr>
        <th style={{ width: "180px" }}>Proposal</th>
        <td>{selectedFeedback.proposal_number || "-"}</td>
      </tr>

      <tr>
        <th>Invoice</th>
        <td>{selectedFeedback.invoice_number || "-"}</td>
      </tr>

      <tr>
        <th>Client Type</th>
        <td>{selectedFeedback.client_type}</td>
      </tr>

      <tr>
        <th>Source</th>
        <td>{selectedFeedback.feedback_source}</td>
      </tr>

      {selectedFeedback.client_type === "B2B" && (
        <>
          <tr>
            <th>Company</th>
            <td>{selectedFeedback.company_name}</td>
          </tr>

          <tr>
            <th>Branch</th>
            <td>{selectedFeedback.branch_name}</td>
          </tr>

          <tr>
            <th>Client</th>
            <td>{selectedFeedback.client_name}</td>
          </tr>
        </>
      )}

      {selectedFeedback.client_type === "B2C" && (
        <tr>
          <th>Customer</th>
          <td>{selectedFeedback.customer_name}</td>
        </tr>
      )}

      <tr>
        <th>Rating</th>
        <td style={{ fontSize: 26 }}>
          {selectedFeedback.rating === 5 && "😍"}
          {selectedFeedback.rating === 4 && "🙂"}
          {selectedFeedback.rating === 3 && "😐"}
          {selectedFeedback.rating === 2 && "🙁"}
          {selectedFeedback.rating === 1 && "😡"}
        </td>
      </tr>

      <tr>
        <th>Submitted</th>
        <td>
          {selectedFeedback.submitted_at
            ? new Date(selectedFeedback.submitted_at).toLocaleString("en-IN")
            : "-"}
        </td>
      </tr>

      <tr>
        <th style={{ verticalAlign: "top" }}>Feedback</th>
        <td style={{ whiteSpace: "pre-wrap", lineHeight: "1.7" }}>
          {selectedFeedback.comments || "-"}
        </td>
      </tr>

    </tbody>

  </table>

</div>

                                <div className="modal-footer">

                                    <button
                                        className="btn btn-orange"
                                        onClick={() =>
                                            setShowModal(false)
                                        }
                                    >
                                        Close
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>

                )}

            </div>

        </ProtectedRoute>

    );

}