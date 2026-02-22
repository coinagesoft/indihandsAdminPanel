"use client";
import React, { useEffect, useState } from "react";

const EMPTY_COMPANY = {
  companyName: "",
  gstin: "",
  email: "",
  logoUrl: "",
  currency: "₹",

  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
  website: "",

  bankName: "",
  bankAccount: "",
  bankIfsc: "",
  bankBranch: "",
};


const EMPTY_PRICING = {
  sgstRate: 0,
  cgstRate: 0,
  igstRate: 0,
  deliveryCharges: 0,
  brandingCharges: 0,
};

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("general");

  // ✅ API state
  const [users, setUsers] = useState([]);
  const [companyInfo, setCompanyInfo] = useState(EMPTY_COMPANY);
  const [pricingDefaults, setPricingDefaults] = useState(EMPTY_PRICING);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ✅ Edit modal state
  const [editUser, setEditUser] = useState(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/settings");
      const data = await res.json();

      if (!res.ok) {
        return alert("❌ " + (data.message || "Failed to load settings"));
      }

      setUsers(data.users || []);
setCompanyInfo({
  companyName: data.companyInfo?.company_name || "",
  gstin: data.companyInfo?.gstin || "",
  email: data.companyInfo?.email || "",
  logoUrl: data.companyInfo?.logo_url || "",
  currency: data.companyInfo?.currency || "₹",

  addressLine1: data.companyInfo?.address_line1 || "",
  addressLine2: data.companyInfo?.address_line2 || "",
  city: data.companyInfo?.city || "",
  state: data.companyInfo?.state || "",
  pincode: data.companyInfo?.pincode || "",
  phone: data.companyInfo?.phone || "",
  website: data.companyInfo?.website || "",

  bankName: data.companyInfo?.bank_name || "",
  bankAccount: data.companyInfo?.bank_account || "",
  bankIfsc: data.companyInfo?.bank_ifsc || "",
  bankBranch: data.companyInfo?.bank_branch || "",
});



      setPricingDefaults({
        sgstRate: Number(data.pricingDefaults?.sgst_rate || 0),
        cgstRate: Number(data.pricingDefaults?.cgst_rate || 0),
        igstRate: Number(data.pricingDefaults?.igst_rate || 0),
        deliveryCharges: Number(data.pricingDefaults?.delivery_charges || 0),
        brandingCharges: Number(data.pricingDefaults?.branding_charges || 0),
      });
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // ✅ Toggle user active
  const handleUserToggle = async (user) => {
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          role: user.role,
          active: !user.active,
        }),
      });

      const data = await res.json();
      if (!res.ok) return alert("❌ " + (data.message || "Failed"));

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, active: !u.active } : u))
      );
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  // ✅ Delete user
  const handleDelete = async (user) => {
    if (!confirm(`Delete user ${user.email}?`)) return;

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) return alert("❌ " + (data.message || "Delete failed"));

      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      alert("✅ User deleted");
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  // ✅ Save user edit
  const saveUserEdit = async () => {
    try {
      if (!editUser?.id) return;

      const res = await fetch(`/api/users/${editUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: editUser.email,
          role: editUser.role,
          active: editUser.active,
        }),
      });

      const data = await res.json();
      if (!res.ok) return alert("❌ " + (data.message || "Update failed"));

      setUsers((prev) => prev.map((u) => (u.id === editUser.id ? editUser : u)));
      setEditUser(null);
      alert("✅ User updated");
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  // ✅ Save All Settings
  const handleSave = async () => {
    try {
      setSaving(true);

      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyInfo,
          pricingDefaults,
        }),
      });

      const data = await res.json();
      if (!res.ok) return alert("❌ " + (data.message || "Save failed"));

      alert("✅ Settings saved successfully!");
      fetchSettings();
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      <div className="d-flex justify-content-between align-items-center mb-3">
 <h4 className="mb-4 text-primary">Admin Settings</h4>
         <button className="btn btn-sm btn-outline-primary" onClick={fetchSettings}>
          Refresh
        </button>
      </div>

      {loading && <div className="alert alert-info">Loading...</div>}

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
        {/* ✅ General */}
       {activeTab === "general" && (
  <div>
    <h5>Company Info & Branding</h5>

    <div className="row g-3">

      {/* BASIC */}
      <div className="col-md-6">
        <label className="form-label">Company Name</label>
        <input className="form-control"
          value={companyInfo.companyName}
          onChange={e=>setCompanyInfo({...companyInfo,companyName:e.target.value})}/>
      </div>

      <div className="col-md-6">
        <label className="form-label">GSTIN</label>
        <input className="form-control"
          value={companyInfo.gstin}
          onChange={e=>setCompanyInfo({...companyInfo,gstin:e.target.value})}/>
      </div>

      <div className="col-md-6">
        <label className="form-label">Email</label>
        <input className="form-control"
          value={companyInfo.email}
          onChange={e=>setCompanyInfo({...companyInfo,email:e.target.value})}/>
      </div>

      <div className="col-md-6">
        <label className="form-label">Phone</label>
        <input className="form-control"
          value={companyInfo.phone}
          onChange={e=>setCompanyInfo({...companyInfo,phone:e.target.value})}/>
      </div>

      {/* ADDRESS */}
      <div className="col-md-6">
        <label className="form-label">Address</label>
        <input className="form-control"
          value={companyInfo.addressLine1}
          onChange={e=>setCompanyInfo({...companyInfo,addressLine1:e.target.value})}/>
      </div>

      {/* <div className="col-md-6">
        <label className="form-label">Address Line 2</label>
        <input className="form-control"
          value={companyInfo.addressLine2}
          onChange={e=>setCompanyInfo({...companyInfo,addressLine2:e.target.value})}/>
      </div> */}

      <div className="col-md-4">
        <label className="form-label">City</label>
        <input className="form-control"
          value={companyInfo.city}
          onChange={e=>setCompanyInfo({...companyInfo,city:e.target.value})}/>
      </div>

      <div className="col-md-4">
        <label className="form-label">State</label>
        <input className="form-control"
          value={companyInfo.state}
          onChange={e=>setCompanyInfo({...companyInfo,state:e.target.value})}/>
      </div>

      <div className="col-md-4">
        <label className="form-label">Pincode</label>
        <input className="form-control"
          value={companyInfo.pincode}
          onChange={e=>setCompanyInfo({...companyInfo,pincode:e.target.value})}/>
      </div>

      {/* WEBSITE */}
      <div className="col-md-6">
        <label className="form-label">Website</label>
        <input className="form-control"
          value={companyInfo.website}
          onChange={e=>setCompanyInfo({...companyInfo,website:e.target.value})}/>
      </div>

      <div className="col-md-6">
        <label className="form-label">Currency</label>
        <input className="form-control"
          value={companyInfo.currency}
          onChange={e=>setCompanyInfo({...companyInfo,currency:e.target.value})}/>
      </div>

      {/* BANK */}
      <div className="col-md-6">
        <label className="form-label">Bank Name</label>
        <input className="form-control"
          value={companyInfo.bankName}
          onChange={e=>setCompanyInfo({...companyInfo,bankName:e.target.value})}/>
      </div>

      <div className="col-md-6">
        <label className="form-label">Bank Account</label>
        <input className="form-control"
          value={companyInfo.bankAccount}
          onChange={e=>setCompanyInfo({...companyInfo,bankAccount:e.target.value})}/>
      </div>

      <div className="col-md-6">
        <label className="form-label">IFSC</label>
        <input className="form-control"
          value={companyInfo.bankIfsc}
          onChange={e=>setCompanyInfo({...companyInfo,bankIfsc:e.target.value})}/>
      </div>

      <div className="col-md-6">
        <label className="form-label">Bank Branch</label>
        <input className="form-control"
          value={companyInfo.bankBranch}
          onChange={e=>setCompanyInfo({...companyInfo,bankBranch:e.target.value})}/>
      </div>

    </div>
  </div>
)}


        {/* ✅ Users */}
        {activeTab === "users" && (
          <div>
            <h5>User Management</h5>
            <div className="table-responsive">
              <table className="table table-striped align-middle">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Active</th>
                    <th style={{ width: 180 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-4">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.email}</td>
                        <td>
                          <span className="badge bg-label-primary">{user.role}</span>
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            checked={!!user.active}
                            onChange={() => handleUserToggle(user)}
                          />
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => setEditUser({ ...user })}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(user)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ✅ Pricing */}
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
                    setPricingDefaults({
                      ...pricingDefaults,
                      sgstRate: Number(e.target.value),
                    })
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
                    setPricingDefaults({
                      ...pricingDefaults,
                      cgstRate: Number(e.target.value),
                    })
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
                    setPricingDefaults({
                      ...pricingDefaults,
                      igstRate: Number(e.target.value),
                    })
                  }
                />
              </div>

              {/* <div className="col-12 col-md-6">
                <label className="form-label">Delivery Charges</label>
                <input
                  type="number"
                  className="form-control"
                  value={pricingDefaults.deliveryCharges}
                  onChange={(e) =>
                    setPricingDefaults({
                      ...pricingDefaults,
                      deliveryCharges: Number(e.target.value),
                    })
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
                    setPricingDefaults({
                      ...pricingDefaults,
                      brandingCharges: Number(e.target.value),
                    })
                  }
                />
              </div> */}
            </div>
          </div>
        )}
      </div>

      {/* ✅ Save Button */}
      <div className="mt-4 text-end">
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save All Settings"}
        </button>
      </div>

      {/* ✅ Edit User Modal */}
      {editUser && (
        <>
          <div className="modal-backdrop fade show"></div>

          <div className="modal d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header py-2">
                  <h5 className="modal-title">Edit User</h5>
                  <button className="btn-close" onClick={() => setEditUser(null)} />
                </div>

                <div className="modal-body">
                  <div className="mb-2">
                    <label className="form-label">Email</label>
                    <input
                      className="form-control"
                      value={editUser.email}
                      onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label">Role</label>
                    <select
                      className="form-select"
                      value={editUser.role}
                      onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                    >
                      <option value="Admin">Admin</option>
                      <option value="Client">Client</option>
                    </select>
                  </div>

                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={!!editUser.active}
                      onChange={(e) => setEditUser({ ...editUser, active: e.target.checked })}
                      id="activeUser"
                    />
                    <label className="form-check-label" htmlFor="activeUser">
                      Active
                    </label>
                  </div>
                </div>

                <div className="modal-footer py-2">
                  <button className="btn btn-secondary" onClick={() => setEditUser(null)}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={saveUserEdit}>
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SettingsPage;
