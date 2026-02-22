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
  password: "",
};

const EMPTY_COMPANY = {
  id: null,
  companyName: "",
  companyEmail: "",
  branches: [],
};

const Page = () => {
  /* ===================== STATE ===================== */
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [filter, setFilter] = useState("");
  const [companyCharges, setCompanyCharges] = useState([]);

  const [newCompany, setNewCompany] = useState(EMPTY_COMPANY);
  const [newBranch, setNewBranch] = useState(EMPTY_BRANCH);
  const [editingBranch, setEditingBranch] = useState(EMPTY_BRANCH);
  const [editingCompany, setEditingCompany] = useState(EMPTY_COMPANY);

  const companyModalRef = useRef(null);
  const branchCreateModalRef = useRef(null);
  const branchEditModalRef = useRef(null);

  /* ===================== MODALS ===================== */
  const openCompanyModal = () => {
    setEditingCompany(EMPTY_COMPANY);
    setNewCompany({ ...EMPTY_COMPANY });
    setCompanyCharges([]);   // ✅ reset
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
      password: "",
      phones: branch.phones || [],
      emails: branch.emails || [],
    });
    new bootstrap.Modal(branchEditModalRef.current).show();
  };

  const handleCompanyUpdate = async (e) => {
    e.preventDefault();

    const res = await fetch(`/api/companies/${editingCompany.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: editingCompany.companyName,
        companyEmail: editingCompany.companyEmail || null,
        charges: companyCharges.filter(
          c => c.label?.trim() && Number(c.amount) > 0
        ),
      }),
    });

    const data = await res.json();
    if (!res.ok) return alert("❌ " + data.message);

    alert("✅ Company updated");
    await fetchCompanies();
    setEditingCompany(EMPTY_COMPANY);
    const modal = bootstrap.Modal.getInstance(companyModalRef.current);
    modal.hide();
  };


  /* ===================== HANDLERS ===================== */
  const handleCompanyCreate = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: newCompany.companyName,
        companyEmail: newCompany.companyEmail || null,
        charges: companyCharges.filter(
          c => c.label?.trim() && Number(c.amount) > 0
        ),
      }),
    });
    setCompanyCharges([]);


    const data = await res.json();
    if (!res.ok) return alert("❌ " + data.message);

    alert("✅ Company created");
    await fetchCompanies();

    const modal = bootstrap.Modal.getInstance(companyModalRef.current);
    modal.hide();
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

    // const resetRes = await fetch("/api/auth/request-reset", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ email: newBranch.loginEmail }),
    // });

    if (!data.ok) {
      alert("✅ Branch created  ");
    } else {
      alert("✅ Branch created ");
    }

    await fetchCompanies();
    setNewBranch(EMPTY_BRANCH);
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
    setEditingBranch({ ...editingBranch, password: "" }); // ✅ ADD
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
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h5 className="text-orange mb-1">{selectedCompany?.companyName}</h5>

                {selectedCompany?.charges?.length > 0 && (
                  <div className="small text-muted">
                    Charges:{" "}
                    {selectedCompany.charges.map((c, i) => {
                      const tax = (Number(c.amount) * Number(c.taxPercent || 0)) / 100;
                      const total = Number(c.amount) + tax;

                      return (
                        <span key={i} className="me-3">
                          {c.label}: ₹{total.toFixed(0)}
                          {c.taxPercent > 0 && (
                            <span className="text-secondary">
                              {" "}
                              ({c.taxPercent}%)
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="d-flex gap-2 ">
                <button
                  className="btn btn-sm btn-outline-orange"
                  disabled={!selectedCompany?.id}
                  onClick={async () => {
                    setEditingCompany(selectedCompany);

                    const res = await fetch(`/api/companies/${selectedCompany.id}/charges`);
                    if (res.ok) {
                      const data = await res.json();
                      setCompanyCharges(
                        (data.charges || []).map((c) => ({
                          label: c.label,
                          amount: Number(c.amount),
                          taxPercent: Number(c.taxPercent || 0),
                        }))
                      );
                    } else {
                      setCompanyCharges([]);
                    }

                    new bootstrap.Modal(companyModalRef.current).show();
                  }}
                >
                  Edit Company
                </button>

                <button
                  className="btn btn-sm btn-outline-danger"
                  disabled={!selectedCompany?.id}
                  onClick={async () => {
                    if (!selectedCompany?.id) return;

                    if (!confirm("⚠️ Delete company & branches?")) return;

                    const res = await fetch(`/api/companies/${selectedCompany.id}`, {
                      method: "DELETE",
                    });

                    const data = await res.json();
                    if (!res.ok) return alert("❌ " + data.message);

                    alert("✅ Company deleted");
                    await fetchCompanies();
                  }}
                >
                  Delete Company
                </button>
              </div>
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
                  {/* <div className="col-md-6"><b>Contact:</b> {b.contactPerson}</div> */}

                  {/* <div className="col-md-6">
                    <b>Phones:</b>
                    <ul>{(b.phones || []).map((p, i) => <li key={i}>{p}</li>)}</ul>
                  </div> */}

                  {/* <div className="col-md-6">
                    <b>Emails:</b>
                    <ul>{(b.emails || []).map((e, i) => <li key={i}>{e}</li>)}</ul>
                  </div> */}
                  <div className="col-md-6"><b>Login:</b> {b.loginEmail}</div>

                  <div className="col-6"><b>Shipping:</b> {b.shippingAddress}</div>
                  <div className="col-6"><b>Billing:</b> {b.billingAddress}</div>
                  {/* <div className="col-md-6"><b>Password:</b> {b.password_hash}</div> */}
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
            <h5>{editingCompany?.id ? "Edit Company" : "Create Company"}</h5>

            <form onSubmit={editingCompany?.id ? handleCompanyUpdate : handleCompanyCreate}>
              <input
                className="form-control mb-2"
                placeholder="Company Name"
                value={editingCompany?.id ? editingCompany.companyName : newCompany.companyName}
                onChange={(e) => {
                  editingCompany?.id
                    ? setEditingCompany({ ...editingCompany, companyName: e.target.value })
                    : setNewCompany({ ...newCompany, companyName: e.target.value });
                }}
              />

              <input
                className="form-control mb-2"
                placeholder="Company Email"
                value={
                  editingCompany?.id
                    ? editingCompany.companyEmail || ""
                    : newCompany.companyEmail || ""
                }
                onChange={(e) => {
                  const val = e.target.value || null;   // 👈 key fix

                  editingCompany?.id
                    ? setEditingCompany({ ...editingCompany, companyEmail: val })
                    : setNewCompany({ ...newCompany, companyEmail: val });
                }}
              />
              <hr className="my-3" />
              <h6>Company Charges</h6>

              {companyCharges.map((c, i) => (
                <div key={i} className="row g-2 mb-2">
                  <div className="col-md-5">
                    <input
                      className="form-control"
                      placeholder="Charge label (e.g. Shipping)"
                      value={c.label}
                      onChange={(e) => {
                        const arr = [...companyCharges];
                        arr[i].label = e.target.value;
                        setCompanyCharges(arr);
                      }}
                    />
                  </div>

                  <div className="col-md-3">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Amount"
                      value={c.amount}
                      onChange={(e) => {
                        const arr = [...companyCharges];
                        arr[i].amount = +e.target.value;
                        setCompanyCharges(arr);
                      }}
                    />
                  </div>

                  <div className="col-md-3">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Tax %"
                      value={c.taxPercent}
                      onChange={(e) => {
                        const arr = [...companyCharges];
                        arr[i].taxPercent = +e.target.value;
                        setCompanyCharges(arr);
                      }}
                    />
                  </div>

                  <div className="col-md-1">
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        setCompanyCharges(companyCharges.filter((_, idx) => idx !== i))
                      }
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="btn btn-outline-secondary btn-sm me-2"
                onClick={() =>
                  setCompanyCharges([
                    ...companyCharges,
                    { label: "", amount: "", taxPercent: "" },
                  ])
                }
              >
                + Add Charge
              </button>


              <button className="btn btn-orange">
                {editingCompany?.id ? "Update" : "Create"}
              </button>

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

                {/* Basic Fields */}
                {[
                  { label: "Branch Name", key: "branchName", type: "text", required: true },
                  { label: "GSTIN", key: "gstin", type: "text", required: true },
                  // { label: "Contact Person", key: "contactPerson", type: "text" },
                  { label: "Login Email", key: "loginEmail", type: "email", required: true },
                ].map(({ label, key, type, required }) => (
                  <div key={key} className="col-md-6">
                    <label className="form-label mb-1">{label}</label>
                    <input
                      type={type}
                      className="form-control"
                      value={newBranch[key] || ""}
                      onChange={(e) =>
                        setNewBranch({ ...newBranch, [key]: e.target.value })
                      }
                      required={required}
                    />
                  </div>
                ))}
                 <div className="col-md-6">
                  <label className="form-label mb-1">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Minimum 6 characters"
                    value={newBranch.password || ""}
                    onChange={(e) =>
                      setNewBranch({ ...newBranch, password: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Addresses */}
                <div className="col-md-6">
                  <label className="form-label mb-1">Shipping Address</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={newBranch.shippingAddress || ""}
                    onChange={(e) =>
                      setNewBranch({ ...newBranch, shippingAddress: e.target.value })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label mb-1">Billing Address</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={newBranch.billingAddress || ""}
                    onChange={(e) =>
                      setNewBranch({ ...newBranch, billingAddress: e.target.value })
                    }
                  />
                </div>

                {/* Password */}
               

                {/* Phones */}
                {/* <div className="col-12 mt-2">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label mb-0">Phones</label>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() =>
                        setNewBranch({
                          ...newBranch,
                          phones: [...(newBranch.phones || []), ""],
                        })
                      }
                    >
                      + Add
                    </button>
                  </div>

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
                </div> */}

                {/* Emails */}
                {/* <div className="col-12 mt-2">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label mb-0">Emails</label>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() =>
                        setNewBranch({
                          ...newBranch,
                          emails: [...(newBranch.emails || []), ""],
                        })
                      }
                    >
                      + Add
                    </button>
                  </div>

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
                </div> */}

                {/* Footer */}
                <div className="col-12 mt-3 d-flex justify-content-between flex-wrap gap-2">
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
                    // { label: "Contact Person", key: "contactPerson", type: "text" },
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
 <div className="col-md-6">
                    <label className="form-label mb-1">
                      New Password <small className="text-muted">(optional)</small>
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Leave blank to keep current password"
                      value={editingBranch.password || ""}
                      onChange={(e) =>
                        setEditingBranch({ ...editingBranch, password: e.target.value })
                      }
                    />
                  </div>
                  {/* Addresses */}
                  <div className="col-md-6">
                    <label className="form-label mb-1">Shipping Address</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={editingBranch.shippingAddress || ""}
                      onChange={(e) => setEditingBranch({ ...editingBranch, shippingAddress: e.target.value })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label mb-1">Billing Address</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={editingBranch.billingAddress || ""}
                      onChange={(e) => setEditingBranch({ ...editingBranch, billingAddress: e.target.value })}
                    />
                  </div>
                 


                  {/* Phones */}
                  {/* <div className="col-12 mt-2">
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
                  </div> */}

                  {/* Emails */}
                  {/* <div className="col-12 mt-2">
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
                  </div> */}

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
