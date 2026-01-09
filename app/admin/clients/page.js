"use client";

import React, { useState, useRef } from "react";

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
  password: "",
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
  const [companies, setCompanies] = useState(dummyCompanies);
  const [selectedCompany, setSelectedCompany] = useState(dummyCompanies[0]);
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
  const handleCompanyCreate = (e) => {
    e.preventDefault();
    setCompanies((prev) => [...prev, newCompany]);
    new bootstrap.Modal(companyModalRef.current).hide();
  };

  const handleBranchCreate = (e) => {
    e.preventDefault();
    setCompanies((prev) =>
      prev.map((c) =>
        c.id === selectedCompany.id
          ? { ...c, branches: [...c.branches, newBranch] }
          : c
      )
    );
    new bootstrap.Modal(branchCreateModalRef.current).hide();
  };

  const handleBranchUpdate = (e) => {
    e.preventDefault();
    setCompanies((prev) =>
      prev.map((c) =>
        c.id === selectedCompany.id
          ? {
              ...c,
              branches: c.branches.map((b) =>
                b.id === editingBranch.id ? editingBranch : b
              ),
            }
          : c
      )
    );
    new bootstrap.Modal(branchEditModalRef.current).hide();
  };

  const filteredCompanies = companies.filter((c) =>
    c.companyName.toLowerCase().includes(filter.toLowerCase())
  );

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
                  className={`list-group-item ${
                    selectedCompany?.id === c.id ? "bg-primary text-white" : ""
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
            <h5 className="text-orange">{selectedCompany?.companyName}</h5>

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

                <button
                  className="btn btn-sm btn-outline-orange mt-2"
                  onClick={() => openEditBranchModal(b)}
                >
                  Edit Branch
                </button>
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
<div className="modal fade" ref={branchCreateModalRef}>
  <div className="modal-dialog modal-lg">
    <div className="modal-content p-4">
      <h5>Add Branch</h5>

      <form onSubmit={handleBranchCreate} className="row g-3">

        {/* Row 1 */}
        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="Branch Name"
            value={newBranch.branchName || ""}
            onChange={(e) =>
              setNewBranch({ ...newBranch, branchName: e.target.value })
            }
          />
        </div>

        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="GSTIN"
            value={newBranch.gstin || ""}
            onChange={(e) =>
              setNewBranch({ ...newBranch, gstin: e.target.value })
            }
          />
        </div>

        {/* Row 2 */}
        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="Contact Person"
            value={newBranch.contactPerson || ""}
            onChange={(e) =>
              setNewBranch({ ...newBranch, contactPerson: e.target.value })
            }
          />
        </div>

        <div className="col-md-6">
          <textarea
            className="form-control"
            rows={2}
            placeholder="Shipping Address"
            value={newBranch.shippingAddress || ""}
            onChange={(e) =>
              setNewBranch({ ...newBranch, shippingAddress: e.target.value })
            }
          />
        </div>

        {/* Row 3 */}
        <div className="col-md-6">
          <textarea
            className="form-control"
            rows={2}
            placeholder="Billing Address"
            value={newBranch.billingAddress || ""}
            onChange={(e) =>
              setNewBranch({ ...newBranch, billingAddress: e.target.value })
            }
          />
        </div>

        <div className="col-md-6" />

        {/* ✅ Row 4 – LOGIN EMAIL & PASSWORD */}
        <div className="col-md-6">
          <input
            type="email"
            className="form-control"
            placeholder="Login Email"
            value={newBranch.loginEmail || ""}
            onChange={(e) =>
              setNewBranch({ ...newBranch, loginEmail: e.target.value })
            }
          />
        </div>

        <div className="col-md-6">
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            value={newBranch.password || ""}
            onChange={(e) =>
              setNewBranch({ ...newBranch, password: e.target.value })
            }
          />
        </div>

        {/* Phones */}
        <div className="col-12">
          <label>Phones</label>
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
                className="btn btn-sm btn-danger"
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
          <button
            type="button"
            className="btn btn-sm btn-outline-primary mt-1"
            onClick={() =>
              setNewBranch({
                ...newBranch,
                phones: [...(newBranch.phones || []), ""],
              })
            }
          >
            + Add Phone
          </button>
        </div>

        {/* Emails */}
        <div className="col-12">
          <label>Emails</label>
          {(newBranch.emails || []).map((e, idx) => (
            <div key={idx} className="d-flex gap-2 mb-1">
              <input
                className="form-control"
                placeholder={`Email ${idx + 1}`}
                value={e}
                onChange={(ev) => {
                  const emails = [...newBranch.emails];
                  emails[idx] = ev.target.value;
                  setNewBranch({ ...newBranch, emails });
                }}
              />
              <button
                type="button"
                className="btn btn-sm btn-danger"
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
          <button
            type="button"
            className="btn btn-sm btn-outline-primary mt-1"
            onClick={() =>
              setNewBranch({
                ...newBranch,
                emails: [...(newBranch.emails || []), ""],
              })
            }
          >
            + Add Email
          </button>
        </div>

        <button className="btn btn-orange mt-3">Add Branch</button>
      </form>
    </div>
  </div>
</div>


{/* ===================== EDIT BRANCH MODAL ===================== */}
<div className="modal fade" ref={branchEditModalRef}>
  <div className="modal-dialog modal-lg">
    <div className="modal-content p-4">
      <h5>Edit Branch</h5>
      {editingBranch && (
        <form onSubmit={handleBranchUpdate} className="row g-2">
          {[
            { label: "Branch Name", key: "branchName" },
            { label: "GSTIN", key: "gstin" },
            { label: "Contact Person", key: "contactPerson" },
            { label: "Shipping Address", key: "shippingAddress" },
            { label: "Billing Address", key: "billingAddress" },
            { label: "Login Email", key: "loginEmail" },
            { label: "Password", key: "password" },
          ].map(({ label, key }) => (
            <div key={key} className="col-md-6">
              {["shippingAddress", "billingAddress"].includes(key) ? (
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder={label}
                  value={editingBranch[key] || ""}
                  onChange={(e) =>
                    setEditingBranch({ ...editingBranch, [key]: e.target.value })
                  }
                />
              ) : (
                <input
                  className="form-control"
                  type={key === "password" ? "password" : "text"}
                  placeholder={label}
                  value={editingBranch[key] || ""}
                  onChange={(e) =>
                    setEditingBranch({ ...editingBranch, [key]: e.target.value })
                  }
                />
              )}
            </div>
          ))}

          {/* Dynamic Phones */}
          <div className="col-12">
            <label>Phones</label>
            {(editingBranch.phones || []).map((p, idx) => (
              <div key={idx} className="d-flex gap-2 mb-1">
                <input
                  className="form-control"
                  placeholder={`Phone ${idx + 1}`}
                  value={p}
                  onChange={(e) => {
                    const phones = [...editingBranch.phones];
                    phones[idx] = e.target.value;
                    setEditingBranch({ ...editingBranch, phones });
                  }}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => {
                    const phones = editingBranch.phones.filter((_, i) => i !== idx);
                    setEditingBranch({ ...editingBranch, phones });
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-sm btn-outline-primary mt-1"
              onClick={() =>
                setEditingBranch({ ...editingBranch, phones: [...(editingBranch.phones || []), ""] })
              }
            >
              + Add Phone
            </button>
          </div>

          {/* Dynamic Emails */}
          <div className="col-12">
            <label>Emails</label>
            {(editingBranch.emails || []).map((e, idx) => (
              <div key={idx} className="d-flex gap-2 mb-1">
                <input
                  className="form-control"
                  placeholder={`Email ${idx + 1}`}
                  value={e}
                  onChange={(ev) => {
                    const emails = [...editingBranch.emails];
                    emails[idx] = ev.target.value;
                    setEditingBranch({ ...editingBranch, emails });
                  }}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => {
                    const emails = editingBranch.emails.filter((_, i) => i !== idx);
                    setEditingBranch({ ...editingBranch, emails });
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-sm btn-outline-primary mt-1"
              onClick={() =>
                setEditingBranch({ ...editingBranch, emails: [...(editingBranch.emails || []), ""] })
              }
            >
              + Add Email
            </button>
          </div>

          <button className="btn btn-orange mt-2">Save</button>
        </form>
      )}
    </div>
  </div>
</div>


    </div>
  );
};

export default Page;
