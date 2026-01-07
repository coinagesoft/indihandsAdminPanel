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
    sgstRate: 9,
    cgstRate: 9,
    igstRate: 18,
    deliveryCharges: 40,
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
<div className="settings-tabs mb-4">
  <button
    type="button"
    className={`settings-tab ${activeTab === "general" ? "active" : ""}`}
    onClick={() => setActiveTab("general")}
  >
    General
  </button>

  <button
    type="button"
    className={`settings-tab ${activeTab === "users" ? "active" : ""}`}
    onClick={() => setActiveTab("users")}
  >
    Users
  </button>

  <button
    type="button"
    className={`settings-tab ${activeTab === "pricing" ? "active" : ""}`}
    onClick={() => setActiveTab("pricing")}
  >
    Pricing Defaults
  </button>
</div>


      <div className="tab-content">

        {/* General */}
        {activeTab === "general" && (
          <div>
            <h5>Company Info & Branding</h5>
            <div className="row g-3">
              <div className="col-12 col-md-6">
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
              <div className="col-12 col-md-6">
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
              <div className="col-12 col-md-6">
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
              <div className="col-12 col-md-6">
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
          </div>
        )}

        {/* Users */}
        {activeTab === "users" && (
          <div>
            <h5>User Management</h5>
            <div className="table-responsive">
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
  <div className="d-flex gap-2">
    <button
      type="button"
      className="btn btn-sm btn-outline-primary"
      onClick={() => openEditModal(cust)}
    >
      Edit
    </button>

    <button
      type="button"
      className="btn btn-sm btn-outline-danger"
      onClick={() => handleDelete(cust)}
    >
      Delete
    </button>
  </div>
</td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pricing */}
        {activeTab === "pricing" && (
          <div>
            <h5>Pricing & Proposal Defaults</h5>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label">SGST Rate (%)</label>
                <input
                  type="number"
                  className="form-control"
                  value={pricingDefaults.sgstRate}
                  onChange={(e) =>
                    setPricingDefaults({ ...pricingDefaults, sgstRate: Number(e.target.value) })
                  }
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">CGST Rate (%)</label>
                <input
                  type="number"
                  className="form-control"
                  value={pricingDefaults.cgstRate}
                  onChange={(e) =>
                    setPricingDefaults({ ...pricingDefaults, cgstRate: Number(e.target.value) })
                  }
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">IGST Rate (%)</label>
                <input
                  type="number"
                  className="form-control"
                  value={pricingDefaults.igstRate}
                  onChange={(e) =>
                    setPricingDefaults({ ...pricingDefaults, igstRate: Number(e.target.value) })
                  }
                />
              </div>
              <div className="col-12 col-md-6">
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
              <div className="col-12 col-md-6">
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
