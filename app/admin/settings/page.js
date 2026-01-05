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
    gstRate: 18,
    deliveryCharges: 50,
    brandingCharges: 0,
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
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            Security
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
              <label className="form-label">GST Rate (%)</label>
              <input
                type="number"
                className="form-control"
                value={pricingDefaults.gstRate}
                onChange={(e) =>
                  setPricingDefaults({ ...pricingDefaults, gstRate: Number(e.target.value) })
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Delivery Charges</label>
              <input
                type="number"
                className="form-control"
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
                value={pricingDefaults.brandingCharges}
                onChange={(e) =>
                  setPricingDefaults({ ...pricingDefaults, brandingCharges: Number(e.target.value) })
                }
              />
            </div>
          </div>
        )}

        {/* Security */}
        {activeTab === "security" && (
          <div>
            <h5>Security Settings</h5>
            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                checked={securitySettings.enable2FA}
                onChange={(e) =>
                  setSecuritySettings({ ...securitySettings, enable2FA: e.target.checked })
                }
              />
              <label className="form-check-label">Enable 2FA for Admins</label>
            </div>
            <div className="mb-3">
              <label className="form-label">Password Expiry (days)</label>
              <input
                type="number"
                className="form-control"
                value={securitySettings.passwordExpiryDays}
                onChange={(e) =>
                  setSecuritySettings({ ...securitySettings, passwordExpiryDays: Number(e.target.value) })
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Session Timeout (minutes)</label>
              <input
                type="number"
                className="form-control"
                value={securitySettings.sessionTimeoutMinutes}
                onChange={(e) =>
                  setSecuritySettings({ ...securitySettings, sessionTimeoutMinutes: Number(e.target.value) })
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
