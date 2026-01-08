"use client";
import React, { useState } from "react";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip
);

const page = () => {
const [view, setView] = useState("weekly");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  /* ---------------- DATA ---------------- */

  const weeklyData = [6, 9, 5, 11, 14, 10, 16];

  const monthlyDataByMonth = {
    0: [12, 18, 14, 20], // Jan
    1: [10, 15, 22, 28], // Feb
    2: [32, 48, 41, 58], // Mar
    3: [25, 30, 27, 35], // Apr
    4: [20, 26, 29, 33], // May
  };

  const yearlyDataByYear = {
    2023: [120, 140, 180, 160, 190, 210, 220, 240, 200, 260, 280, 300],
    2024: [150, 180, 210, 230, 260, 280, 300, 330, 310, 360, 390, 420],
  };

  /* ---------------- LABELS & VALUES ---------------- */

  let labels = [];
  let values = [];

  if (view === "weekly") {
    labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    values = weeklyData;
  }

  if (view === "monthly") {
    labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
    values = monthlyDataByMonth[selectedMonth] || [0, 0, 0, 0];
  }

  if (view === "yearly") {
    labels = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec"
    ];
    values = yearlyDataByYear[selectedYear] || new Array(12).fill(0);
  }

  /* ---------------- CHART CONFIG ---------------- */

  const chartData = {
    labels,
    datasets: [
      {
        label: "RFQs",
        data: values,
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
    <>
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
                    <h5 className="mb-0">124</h5>
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
                    <h5 className="mb-0">38</h5>
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
                    <h5 className="mb-0">21</h5>
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
                <h4 className="mt-4">540</h4>
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
                <h4 className="mt-4">17</h4>
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
                      <option value={2023}>2023</option>
                      <option value={2024}>2024</option>
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
                    <tr>
                      <td>ABC Corp</td>
                      <td>#PR-1023</td>
                      <td>
                        <span className="badge bg-label-success">Approved</span>
                      </td>
                      <td className="text-end">₹5.2L</td>
                    </tr>
                    <tr>
                      <td>XYZ Ltd</td>
                      <td>#PR-1029</td>
                      <td>
                        <span className="badge bg-label-warning">Pending</span>
                      </td>
                      <td className="text-end">₹3.8L</td>
                    </tr>
                    <tr>
                      <td>Delta Inc</td>
                      <td>#PR-1011</td>
                      <td>
                        <span className="badge bg-label-danger">Rejected</span>
                      </td>
                      <td className="text-end">₹1.4L</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
      <div className="content-backdrop fade"></div>
    </>
  );
};

export default page;
