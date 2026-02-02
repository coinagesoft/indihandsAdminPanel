"use client";

import React, { useState, useRef, useEffect } from "react";

/* ===================== SAFE EMPTY MODELS ===================== */
const EMPTY_BRANCH = {
  id: null,
  branchName: "",
  gstin: "",
  shippingAddress: "",
  billingAddress: "",
  contactPerson: "",
  phones: [],
  emails: [],
  loginEmail: "",
};

const EMPTY_COMPANY = {
  id: null,
  companyName: "",
  companyEmail: "",
  branches: [],
};

const Page = () => {
  /* ===================== DUMMY DATA ===================== */
  const dummyCompanies = [
    {
      id: 1,
      companyName: "TCS",
      companyEmail: "accounts@tcs.com",
      branches: [
        {
          id: 101,
          branchName: "TCS Pune",
          gstin: "27ABCDE1234F1Z5",
          shippingAddress: "Hinjewadi Phase 2, Pune",
          billingAddress: "Hinjewadi Phase 2, Pune",
          contactPerson: "Ravi Kumar",
          phones: ["+91 9876543210"],
          emails: ["ravi.pune@tcs.com"],
          loginEmail: "pune@tcs.com",
          password: "",
        },
        {
          id: 102,
          branchName: "TCS Mumbai",
          gstin: "27ABCDE9999F1Z9",
          shippingAddress: "Andheri East, Mumbai",
          billingAddress: "Andheri East, Mumbai",
          contactPerson: "Sneha Patil",
          phones: ["+91 9123456789"],
          emails: ["sneha.mum@tcs.com"],
          loginEmail: "mumbai@tcs.com",
          password: "",
        },
      ],
    },

    {
      id: 2,
      companyName: "Infosys",
      companyEmail: "finance@infosys.com",
      branches: [
        {
          id: 201,
          branchName: "Infosys Bengaluru",
          gstin: "29INFOSYS1234F1Z1",
          shippingAddress: "Electronic City Phase 1, Bengaluru",
          billingAddress: "Electronic City Phase 1, Bengaluru",
          contactPerson: "Anil Sharma",
          phones: ["+91 9988776655"],
          emails: ["anil.sharma@infosys.com"],
          loginEmail: "blr@infosys.com",
          password: "",
        },
        {
          id: 202,
          branchName: "Infosys Pune",
          gstin: "27INFOSYS5678F1Z3",
          shippingAddress: "Hinjewadi Phase 3, Pune",
          billingAddress: "Hinjewadi Phase 3, Pune",
          contactPerson: "Pooja Kulkarni",
          phones: ["+91 9090909090"],
          emails: ["pooja.kulkarni@infosys.com"],
          loginEmail: "pune@infosys.com",
          password: "",
        },
      ],
    },
  ];


  /* ===================== STATE ===================== */
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [filter, setFilter] = useState("");

  const [newCompany, setNewCompany] = useState(EMPTY_COMPANY);
  const [newBranch, setNewBranch] = useState(EMPTY_BRANCH);
  const [editingBranch, setEditingBranch] = useState(EMPTY_BRANCH);

  const companyModalRef = useRef(null);
  const branchCreateModalRef = useRef(null);
  const branchEditModalRef = useRef(null);

  /* ===================== MODALS ===================== */
  const openCompanyModal = () => {
    setNewCompany({ ...EMPTY_COMPANY, id: Date.now() });
    new bootstrap.Modal(companyModalRef.current).show();
  };

  const openAddBranchModal = () => {
    setNewBranch({ ...EMPTY_BRANCH, id: Date.now(), phones: [""], emails: [""] });
    new bootstrap.Modal(branchCreateModalRef.current).show();
  };

  const openEditBranchModal = (branch) => {
    setEditingBranch({
      ...EMPTY_BRANCH,
      ...branch,
      phones: branch.phones || [],
      emails: branch.emails || [],
    });
    new bootstrap.Modal(branchEditModalRef.current).show();
  };

  /* ===================== HANDLERS ===================== */
  const handleCompanyCreate = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: newCompany.companyName,
        companyEmail: newCompany.companyEmail,
      }),
    });

    const data = await res.json();
    if (!res.ok) return alert("❌ " + data.message);

    alert("✅ Company created");
    await fetchCompanies();
    new bootstrap.Modal(companyModalRef.current).hide();
  };


  const handleBranchCreate = async (e) => {
    e.preventDefault();

    const res = await fetch(`/api/companies/${selectedCompany.id}/branches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBranch),
    });

    const data = await res.json();
    if (!res.ok) return alert("❌ " + data.message);

    // ✅ Send "Set Password" link immediately (using your existing reset link API)
    const resetRes = await fetch("/api/auth/request-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newBranch.loginEmail }),
    });

    const resetData = await resetRes.json();
    if (!resetRes.ok) {
      alert("⚠️ Branch created but email not sent: " + resetData.message);
    } else {
      alert("✅ Branch created & Set Password link sent to email!");
    }

    await fetchCompanies();
    new bootstrap.Modal(branchCreateModalRef.current).hide();
  };


  const handleBranchUpdate = async (e) => {
    e.preventDefault();

    const res = await fetch(`/api/branches/${editingBranch.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingBranch),
    });

    const data = await res.json();
    if (!res.ok) return alert("❌ " + data.message);

    alert("✅ Branch updated");
    await fetchCompanies();
    new bootstrap.Modal(branchEditModalRef.current).hide();
  };


  const filteredCompanies = companies.filter((c) =>
    c.companyName.toLowerCase().includes(filter.toLowerCase())
  );
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    const res = await fetch("/api/companies");
    const data = await res.json();
    console.log("data comp", data)
    setCompanies(data.companies || []);

    if (data.companies?.length > 0) {
      setSelectedCompany(data.companies[0]);
    }
  };

  /* ===================== UI ===================== */
  return (
    <div className="container-xxl py-4">
      <h4 className="mb-4 text-primary">Company & Branch Management</h4>

      <button className="btn btn-orange mb-3" onClick={openCompanyModal}>
        + New Company
      </button>

      <div className="row g-4">
        {/* LEFT */}
        <div className="col-lg-3">
          <div className="card">
            <div className="p-2">
              <input
                className="form-control"
                placeholder="Search company..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            <ul className="list-group list-group-flush">
              {filteredCompanies.map((c) => (
                <li
                  key={c.id}
                  className={`list-group-item ${selectedCompany?.id === c.id ? "bg-primary text-white" : ""
                    }`}
                  onClick={() => setSelectedCompany(c)}
                  style={{ cursor: "pointer" }}
                >
                  {c.companyName}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-lg-9">
          <div className="card p-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
  <h5 className="text-orange mb-0">{selectedCompany?.companyName}</h5>

  <button
    className="btn btn-sm btn-outline-danger"
    disabled={!selectedCompany?.id}
    onClick={async () => {
      if (!selectedCompany?.id) return;

      const ok = confirm("⚠️ Are you sure? This will delete company & all branches.");
      if (!ok) return;

      const res = await fetch(`/api/companies/${selectedCompany.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) return alert("❌ " + data.message);

      alert("✅ Company deleted");
      await fetchCompanies(); // refresh list
    }}
  >
    Delete Company
  </button>
</div>

            <div className="d-flex justify-content-between my-3">
              <h6>Branches</h6>
              <button className="btn btn-outline-orange btn-sm" onClick={openAddBranchModal}>
                + Add Branch
              </button>
            </div>

            {(selectedCompany?.branches || []).map((b) => (
              <div key={b.id} className="border rounded p-3 mb-3">
                <h6 className="text-orange">{b.branchName}</h6>

                <div className="row small">
                  <div className="col-md-6"><b>GSTIN:</b> {b.gstin}</div>
                  <div className="col-md-6"><b>Contact:</b> {b.contactPerson}</div>
                  <div className="col-md-6"><b>Login:</b> {b.loginEmail}</div>

                  <div className="col-md-6">
                    <b>Phones:</b>
                    <ul>{(b.phones || []).map((p, i) => <li key={i}>{p}</li>)}</ul>
                  </div>

                  <div className="col-md-6">
                    <b>Emails:</b>
                    <ul>{(b.emails || []).map((e, i) => <li key={i}>{e}</li>)}</ul>
                  </div>

                  <div className="col-12"><b>Shipping:</b> {b.shippingAddress}</div>
                  <div className="col-12"><b>Billing:</b> {b.billingAddress}</div>
                </div>

               <div className="d-flex gap-2 mt-2">
  <button
    className="btn btn-sm btn-outline-orange"
    onClick={() => openEditBranchModal(b)}
  >
    Edit Branch
  </button>

  <button
    className="btn btn-sm btn-outline-danger"
    onClick={async () => {
      const ok = confirm("⚠️ Are you sure you want to delete this branch?");
      if (!ok) return;

      const res = await fetch(`/api/branches/${b.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) return alert("❌ " + data.message);

      alert("✅ Branch deleted");
      await fetchCompanies();
    }}
  >
    Delete Branch
  </button>
</div>

                
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===================== CREATE COMPANY MODAL ===================== */}
      <div className="modal fade" ref={companyModalRef}>
        <div className="modal-dialog">
          <div className="modal-content p-4">
            <h5>Create Company</h5>
            <form onSubmit={handleCompanyCreate}>
              <input
                className="form-control mb-2"
                placeholder="Company Name"
                value={newCompany.companyName}
                onChange={(e) =>
                  setNewCompany({ ...newCompany, companyName: e.target.value })
                }
              />
              <input
                className="form-control mb-2"
                placeholder="Company Email"
                value={newCompany.companyEmail}
                onChange={(e) =>
                  setNewCompany({ ...newCompany, companyEmail: e.target.value })
                }
              />
              <button className="btn btn-orange">Create</button>
            </form>
          </div>
        </div>
      </div>

      {/* ===================== CREATE BRANCH MODAL ===================== */}
<div className="modal fade" ref={branchCreateModalRef} tabIndex={-1}>
  <div className="modal-dialog modal-lg modal-dialog-centered">
    <div className="modal-content">

      <div className="modal-header py-2">
        <h5 className="modal-title">Add Branch</h5>
        <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
      </div>

      <div className="modal-body pt-3">
        <form onSubmit={handleBranchCreate} className="row g-2">

          {/* Branch + GSTIN */}
          <div className="col-md-6">
            <label className="form-label mb-1">Branch Name</label>
            <input
              className="form-control"
              placeholder="e.g. Pune Branch"
              value={newBranch.branchName || ""}
              onChange={(e) => setNewBranch({ ...newBranch, branchName: e.target.value })}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label mb-1">GSTIN</label>
            <input
              className="form-control"
              placeholder="27ABCDE1234F1Z5"
              value={newBranch.gstin || ""}
              onChange={(e) => setNewBranch({ ...newBranch, gstin: e.target.value })}
              required
            />
          </div>

          {/* Contact + Login Email */}
          <div className="col-md-6">
            <label className="form-label mb-1">Contact Person</label>
            <input
              className="form-control"
              placeholder="e.g. Ravi Kumar"
              value={newBranch.contactPerson || ""}
              onChange={(e) => setNewBranch({ ...newBranch, contactPerson: e.target.value })}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label mb-1">Login Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="client@email.com"
              value={newBranch.loginEmail || ""}
              onChange={(e) => setNewBranch({ ...newBranch, loginEmail: e.target.value })}
              required
            />
            <small className="text-muted d-block mt-1">
              Client will receive “Set Password” link on this email.
            </small>
          </div>

          {/* Shipping + Billing */}
          <div className="col-md-6">
            <label className="form-label mb-1">Shipping Address</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="Shipping address"
              value={newBranch.shippingAddress || ""}
              onChange={(e) => setNewBranch({ ...newBranch, shippingAddress: e.target.value })}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label mb-1">Billing Address</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="Billing address"
              value={newBranch.billingAddress || ""}
              onChange={(e) => setNewBranch({ ...newBranch, billingAddress: e.target.value })}
            />
          </div>

          {/* Phones */}
          <div className="col-12 mt-2">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label mb-0">Phones</label>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() =>
                  setNewBranch({ ...newBranch, phones: [...(newBranch.phones || []), ""] })
                }
              >
                + Add
              </button>
            </div>

            {(newBranch.phones || []).length === 0 && (
              <small className="text-muted">No phone added</small>
            )}

            {(newBranch.phones || []).map((p, idx) => (
              <div key={idx} className="d-flex gap-2 mb-1">
                <input
                  className="form-control"
                  placeholder={`Phone ${idx + 1}`}
                  value={p}
                  onChange={(e) => {
                    const phones = [...newBranch.phones];
                    phones[idx] = e.target.value;
                    setNewBranch({ ...newBranch, phones });
                  }}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() =>
                    setNewBranch({
                      ...newBranch,
                      phones: newBranch.phones.filter((_, i) => i !== idx),
                    })
                  }
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Emails */}
          <div className="col-12 mt-2">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label mb-0">Emails</label>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() =>
                  setNewBranch({ ...newBranch, emails: [...(newBranch.emails || []), ""] })
                }
              >
                + Add
              </button>
            </div>

            {(newBranch.emails || []).length === 0 && (
              <small className="text-muted">No email added</small>
            )}

            {(newBranch.emails || []).map((em, idx) => (
              <div key={idx} className="d-flex gap-2 mb-1">
                <input
                  className="form-control"
                  placeholder={`Email ${idx + 1}`}
                  value={em}
                  onChange={(e) => {
                    const emails = [...newBranch.emails];
                    emails[idx] = e.target.value;
                    setNewBranch({ ...newBranch, emails });
                  }}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() =>
                    setNewBranch({
                      ...newBranch,
                      emails: newBranch.emails.filter((_, i) => i !== idx),
                    })
                  }
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Footer Buttons */}
          <div className="col-12 mt-3 d-flex justify-content-between flex-wrap gap-2">
            {/* <button
              type="button"
              className="btn btn-outline-warning"
              disabled={!newBranch.loginEmail?.trim()}
              onClick={async () => {
                const res = await fetch("/api/auth/request-reset", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: newBranch.loginEmail }),
                });

                const data = await res.json();
                if (!res.ok) return alert("❌ " + data.message);

                alert("✅ Set Password link sent to client email");
              }}
            >
              Send Set Password Link
            </button> */}

            <button type="submit" className="btn btn-orange px-4">
              Save Branch
            </button>
          </div>

        </form>
      </div>
    </div>
  </div>
</div>



      {/* ===================== EDIT BRANCH MODAL ===================== */}
      {/* ===================== EDIT BRANCH MODAL ===================== */}
<div className="modal fade" ref={branchEditModalRef} tabIndex={-1}>
  <div className="modal-dialog modal-lg modal-dialog-centered">
    <div className="modal-content">

      <div className="modal-header py-2">
        <h5 className="modal-title">Edit Branch</h5>
        <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
      </div>

      <div className="modal-body pt-3">
        {editingBranch && (
          <form onSubmit={handleBranchUpdate} className="row g-2">

            {/* Basic Fields */}
            {[
              { label: "Branch Name", key: "branchName", type: "text" },
              { label: "GSTIN", key: "gstin", type: "text" },
              { label: "Contact Person", key: "contactPerson", type: "text" },
              { label: "Login Email", key: "loginEmail", type: "email" },
            ].map(({ label, key, type }) => (
              <div key={key} className="col-md-6">
                <label className="form-label mb-1">{label}</label>
                <input
                  className="form-control"
                  type={type}
                  value={editingBranch[key] || ""}
                  onChange={(e) => setEditingBranch({ ...editingBranch, [key]: e.target.value })}
                />
              </div>
            ))}

            {/* Addresses */}
            <div className="col-md-6">
              <label className="form-label mb-1">Shipping Address</label>
              <textarea
                className="form-control"
                rows={2}
                value={editingBranch.shippingAddress || ""}
                onChange={(e) => setEditingBranch({ ...editingBranch, shippingAddress: e.target.value })}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label mb-1">Billing Address</label>
              <textarea
                className="form-control"
                rows={2}
                value={editingBranch.billingAddress || ""}
                onChange={(e) => setEditingBranch({ ...editingBranch, billingAddress: e.target.value })}
              />
            </div>

            {/* Phones */}
            <div className="col-12 mt-2">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label mb-0">Phones</label>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() =>
                    setEditingBranch({
                      ...editingBranch,
                      phones: [...(editingBranch.phones || []), ""],
                    })
                  }
                >
                  + Add
                </button>
              </div>

              {(editingBranch.phones || []).map((p, idx) => (
                <div key={idx} className="d-flex gap-2 mb-1">
                  <input
                    className="form-control"
                    value={p}
                    placeholder={`Phone ${idx + 1}`}
                    onChange={(e) => {
                      const phones = [...editingBranch.phones];
                      phones[idx] = e.target.value;
                      setEditingBranch({ ...editingBranch, phones });
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => {
                      const phones = editingBranch.phones.filter((_, i) => i !== idx);
                      setEditingBranch({ ...editingBranch, phones });
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Emails */}
            <div className="col-12 mt-2">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label mb-0">Emails</label>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() =>
                    setEditingBranch({
                      ...editingBranch,
                      emails: [...(editingBranch.emails || []), ""],
                    })
                  }
                >
                  + Add
                </button>
              </div>

              {(editingBranch.emails || []).map((em, idx) => (
                <div key={idx} className="d-flex gap-2 mb-1">
                  <input
                    className="form-control"
                    value={em}
                    placeholder={`Email ${idx + 1}`}
                    onChange={(e) => {
                      const emails = [...editingBranch.emails];
                      emails[idx] = e.target.value;
                      setEditingBranch({ ...editingBranch, emails });
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => {
                      const emails = editingBranch.emails.filter((_, i) => i !== idx);
                      setEditingBranch({ ...editingBranch, emails });
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="col-12 mt-3 d-flex justify-content-between flex-wrap gap-2">
              {/* <button
                type="button"
                className="btn btn-outline-warning"
                disabled={!editingBranch.loginEmail?.trim()}
                onClick={async () => {
                  const res = await fetch("/api/auth/request-reset", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: editingBranch.loginEmail }),
                  });

                  const data = await res.json();
                  if (!res.ok) return alert("❌ " + data.message);

                  alert("✅ Reset link sent to client email");
                }}
              >
                Send Reset Password Link
              </button> */}

              <button type="submit" className="btn btn-orange px-4">
                Save Changes
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  </div>
</div>



    </div>
  );
};

export default Page;
