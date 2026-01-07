"use client";
import React, { useState } from "react";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("general");

  const [users, setUsers] = useState([
    { id: 1, name: "Admin User", role: "Admin", email: "admin@corp.com", active: true },
    { id: 2, name: "Client One", role: "Client", email: "client1@corp.com", active: true },
  ]);

  const [companyInfo, setCompanyInfo] = useState({
    companyName: "Your Company",
    gstin: "27ABCDE1234F1Z5",
    email: "info@company.com",
    logoUrl: "",
    currency: "₹",
  });

  const [pricingDefaults, setPricingDefaults] = useState({
    sgstRate: 9,        // default SGST %
    cgstRate: 9,        // default CGST %
    igstRate: 18,       // default IGST %
    deliveryCharges: 40, // default handling/ courier charges
    brandingCharges: 0,  // optional, default 0
  });

  const [securitySettings, setSecuritySettings] = useState({
    enable2FA: true,
    passwordExpiryDays: 90,
    sessionTimeoutMinutes: 30,
  });

  const handleUserToggle = (userId) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, active: !u.active } : u))
    );
  };

  const handleSave = () => {
    console.log("Saved Settings:", { companyInfo, pricingDefaults, securitySettings, users });
    alert("Settings saved successfully!");
  };

  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      <h4 className="mb-4">Admin Settings</h4>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "general" ? "active" : ""}`}
            onClick={() => setActiveTab("general")}
          >
            General
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            Users
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "pricing" ? "active" : ""}`}
            onClick={() => setActiveTab("pricing")}
          >
            Pricing Defaults
          </button>
        </li>
      </ul>

      <div className="tab-content">
        {/* General */}
        {activeTab === "general" && (
          <div>
            <h5>Company Info & Branding</h5>
            <div className="mb-3">
              <label className="form-label">Company Name</label>
              <input
                type="text"
                className="form-control"
                value={companyInfo.companyName}
                onChange={(e) =>
                  setCompanyInfo({ ...companyInfo, companyName: e.target.value })
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">GSTIN</label>
              <input
                type="text"
                className="form-control"
                value={companyInfo.gstin}
                onChange={(e) =>
                  setCompanyInfo({ ...companyInfo, gstin: e.target.value })
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={companyInfo.email}
                onChange={(e) =>
                  setCompanyInfo({ ...companyInfo, email: e.target.value })
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Currency</label>
              <input
                type="text"
                className="form-control"
                value={companyInfo.currency}
                onChange={(e) =>
                  setCompanyInfo({ ...companyInfo, currency: e.target.value })
                }
              />
            </div>
          </div>
        )}

        {/* Users */}
        {activeTab === "users" && (
          <div>
            <h5>User Management</h5>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={user.active}
                        onChange={() => handleUserToggle(user.id)}
                      />
                    </td>
                    <td>
                      <button className="btn btn-sm btn-warning me-2">Edit</button>
                      <button className="btn btn-sm btn-danger">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pricing */}
        {activeTab === "pricing" && (
          <div>
            <h5>Pricing & Proposal Defaults</h5>

            <div className="mb-3">
              <label className="form-label">SGST Rate (%)</label>
              <input
                type="number"
                className="form-control"
                title="State GST rate (%) applied to proposals"
                value={pricingDefaults.sgstRate}
                onChange={(e) =>
                  setPricingDefaults({ ...pricingDefaults, sgstRate: Number(e.target.value) })
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">CGST Rate (%)</label>
              <input
                type="number"
                className="form-control"
                title="Central GST rate (%) applied to proposals"
                value={pricingDefaults.cgstRate}
                onChange={(e) =>
                  setPricingDefaults({ ...pricingDefaults, cgstRate: Number(e.target.value) })
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">IGST Rate (%)</label>
              <input
                type="number"
                className="form-control"
                title="Integrated GST rate (%) applied for interstate transactions"
                value={pricingDefaults.igstRate}
                onChange={(e) =>
                  setPricingDefaults({ ...pricingDefaults, igstRate: Number(e.target.value) })
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Delivery Charges</label>
              <input
                type="number"
                className="form-control"
                title="Default handling or courier charges for proposals"
                value={pricingDefaults.deliveryCharges}
                onChange={(e) =>
                  setPricingDefaults({ ...pricingDefaults, deliveryCharges: Number(e.target.value) })
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Branding Charges</label>
              <input
                type="number"
                className="form-control"
                title="Optional branding/design charges for proposals"
                value={pricingDefaults.brandingCharges}
                onChange={(e) =>
                  setPricingDefaults({ ...pricingDefaults, brandingCharges: Number(e.target.value) })
                }
              />
            </div>
          </div>
        )}

      </div>

      <div className="mt-4 text-end">
        <button className="btn btn-primary" onClick={handleSave}>
          Save All Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
