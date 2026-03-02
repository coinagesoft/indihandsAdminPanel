"use client";
import React, { useState, useEffect } from "react";
import  ProtectedRoute from '../../../components/ProtectedRoute'
import { useFetchWithLoader } from "../../../lib/fetchWithLoader";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip);

const Page = () => {
  const [view, setView] = useState("weekly");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const fetchWithLoader = useFetchWithLoader();
  const [overview, setOverview] = useState({
    activeClients: 0,
    openRFQs: 0,
    approvedProposals: 0,
    activeProducts: 0,
    pendingRFQs: 0,
  });

  const [chartValues, setChartValues] = useState([]);
  const [recentProposals, setRecentProposals] = useState([]);

  /* ---------------- FETCH OVERVIEW ---------------- */
  const fetchOverview = async () => {
    try {
         const token = localStorage.getItem("token");

      const res = await fetchWithLoader("/api/dashboard/overview", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
      const data = await res.json();
      setOverview(data);
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- FETCH CHART ---------------- */
  const fetchChart = async () => {
    try {
         const token = localStorage.getItem("token");

      const res = await fetchWithLoader(
        `/api/dashboard/chart?view=${view}&month=${selectedMonth}&year=${selectedYear}`
      , {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
      const data = await res.json();
      setChartValues(data);
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- FETCH RECENT PROPOSALS ---------------- */
  const fetchRecentProposals = async () => {
    try {
   const token = localStorage.getItem("token");

const res = await fetchWithLoader("/api/dashboard/recent-proposals", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

      const data = await res.json();
      console.log("data",data)
    setRecentProposals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setRecentProposals([]); 
    }
  };

  /* ---------------- EFFECTS ---------------- */
  useEffect(() => {
    fetchOverview();
    fetchRecentProposals();
  }, []);

  useEffect(() => {
    fetchChart();
  }, [view, selectedMonth, selectedYear]);

  /* ---------------- LABELS ---------------- */
  let labels = [];
  if (view === "weekly") labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  if (view === "monthly") labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
  if (view === "yearly")
    labels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  /* ---------------- CHART CONFIG ---------------- */
  const chartData = {
    labels,
    datasets: [
      {
        label: "RFQs",
        data: chartValues,
        borderColor: "#ff9f43",
        backgroundColor: "rgba(255,159,67,0.15)",
        tension: 0.4,
        fill: true,
        pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: {
        ticks: { stepSize: 10 },
        grid: { borderDash: [4, 4] },
      },
    },
  };

  return (
    <ProtectedRoute>

  
    <div className="container-xxl flex-grow-1 container-p-y">
      <div className="row g-6 mb-6">
        {/* BUSINESS OVERVIEW */}
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-1">Business Overview</h5>
            </div>
            <div className="card-body d-flex justify-content-between flex-wrap gap-4">
              <div className="d-flex align-items-center gap-3">
                <div className="avatar">
                  <div className="avatar-initial bg-label-primary rounded">
                    <i className="ri-user-3-line ri-24px"></i>
                  </div>
                </div>
                <div>
                  <h5 className="mb-0">{overview.activeClients}</h5>
                  <p className="mb-0">Active Clients</p>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="avatar">
                  <div className="avatar-initial bg-label-warning rounded">
                    <i className="ri-file-list-3-line ri-24px"></i>
                  </div>
                </div>
                <div>
                  <h5 className="mb-0">{overview.openRFQs}</h5>
                  <p className="mb-0">Open RFQs</p>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="avatar">
                  <div className="avatar-initial bg-label-success rounded">
                    <i className="ri-file-check-line ri-24px"></i>
                  </div>
                </div>
                <div>
                  <h5 className="mb-0">{overview.approvedProposals}</h5>
                  <p className="mb-0">Approved Proposals</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PRODUCTS */}
        <div className="col-lg-3 col-sm-6">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="mb-2">Products</h6>
              <span className="badge bg-label-primary">Inventory</span>
              <h4 className="mt-4">{overview.activeProducts}</h4>
              <p className="text-success mb-0">Active Products</p>
            </div>
          </div>
        </div>

        {/* PENDING ACTIONS */}
        <div className="col-lg-3 col-sm-6">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="mb-2">Pending Actions</h6>
              <span className="badge bg-label-danger">Attention</span>
              <h4 className="mt-4">{overview.pendingRFQs}</h4>
              <p className="text-warning mb-0">RFQs</p>
            </div>
          </div>
        </div>

        {/* ACTIVITY TIMELINE */}
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
              <h5 className="mb-0">RFQ Activity Timeline</h5>
              <div className="d-flex align-items-center gap-2">
                {(view === "monthly" || view === "yearly") && (
                  <select
                    className="form-select form-select-sm"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                  >
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                  </select>
                )}
                {view === "monthly" && (
                  <select
                    className="form-select form-select-sm"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  >
                    {[
                      "Jan","Feb","Mar","Apr","May","Jun",
                      "Jul","Aug","Sep","Oct","Nov","Dec"
                    ].map((m, i) => (
                      <option key={i} value={i}>{m}</option>
                    ))}
                  </select>
                )}
                <div className="btn-group">
                  <button
                    className={`btn btn-sm ${view === "weekly" ? "btn-warning" : "btn-outline-warning"}`}
                    onClick={() => setView("weekly")}
                  >
                    Weekly
                  </button>
                  <button
                    className={`btn btn-sm ${view === "monthly" ? "btn-warning" : "btn-outline-warning"}`}
                    onClick={() => setView("monthly")}
                  >
                    Monthly
                  </button>
                  <button
                    className={`btn btn-sm ${view === "yearly" ? "btn-warning" : "btn-outline-warning"}`}
                    onClick={() => setView("yearly")}
                  >
                    Yearly
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body pt-4">
              <div style={{ height: "260px" }}>
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>

        {/* RECENT PROPOSALS */}
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-1">Recent Proposals</h5>
              <p className="mb-0">Client-wise summary</p>
            </div>
            <div className="table-responsive">
              <table className="table table-border-bottom-0">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Proposal ID</th>
                    <th>Status</th>
                    <th className="text-end">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProposals.map((p, i) => (
                    <tr key={i}>
                      <td>{p.clientName}</td>
                      <td>{p.proposalNumber}</td>
                      <td>
                        <span className={`badge ${
                          p.status === "Approved"
                            ? "bg-label-success"
                            : p.status === "Pending"
                            ? "bg-label-warning"
                            : "bg-label-danger"
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="text-end">{p.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
      <div className="content-backdrop fade"></div>
    </div>  </ProtectedRoute>
  );
};

export default Page;
