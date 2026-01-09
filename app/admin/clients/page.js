"use client";
import React, { useState, useRef } from "react";

const Page = () => {
  /* ===================== DUMMY DATA ===================== */
  const dummyCompanies = [
    {
      id: 1,
      companyName: "TCS",
      billingAddress: "Corporate Office, Mumbai",
      companyEmail: "accounts@tcs.com",
      branches: [
        {
          id: 101,
          branchName: "TCS Pune",
          gstin: "27ABCDE1234F1Z5",
          shippingAddress: "Hinjewadi Phase 2, Pune",
          contactPerson: "Ravi Kumar",
          phone: "+91 9876543210",
          email: "ravi.pune@tcs.com",
          loginEmail: "pune@tcs.com",
          password: "",
        },
        {
          id: 102,
          branchName: "TCS Mumbai",
          gstin: "27ABCDE9999F1Z9",
          shippingAddress: "Andheri East, Mumbai",
          contactPerson: "Sneha Patil",
          phone: "+91 9123456789",
          email: "sneha.mum@tcs.com",
          loginEmail: "mumbai@tcs.com",
          password: "",
        },
      ],
    },
    {
      id: 2,
      companyName: "Infosys",
      billingAddress: "Electronic City, Bangalore",
      companyEmail: "finance@infosys.com",
      branches: [
        {
          id: 201,
          branchName: "Infosys Pune",
          gstin: "27ABCDE5678F1Z6",
          shippingAddress: "Hinjewadi, Pune",
          contactPerson: "Amit Joshi",
          phone: "+91 9988776655",
          email: "amit.pune@infosys.com",
          loginEmail: "pune@infosys.com",
          password: "",
        },
      ],
    },
  ];

  /* ===================== STATE ===================== */
  const [companies, setCompanies] = useState(dummyCompanies);
  const [selectedCompany, setSelectedCompany] = useState(companies[0]);
  const [filter, setFilter] = useState("");

  const [newCompany, setNewCompany] = useState(null);
  const [newBranch, setNewBranch] = useState(null);
  const [editingBranch, setEditingBranch] = useState(null);

  const companyModalRef = useRef(null);
  const branchCreateModalRef = useRef(null);
  const branchEditModalRef = useRef(null);

  /* ===================== MODAL HELPERS ===================== */
  const openCompanyModal = () => {
    setNewCompany({
      id: Date.now(),
      companyName: "",
      billingAddress: "",
      companyEmail: "",
      branches: [],
    });
    new bootstrap.Modal(companyModalRef.current).show();
  };

  const openAddBranchModal = () => {
    setNewBranch({
      id: Date.now(),
      branchName: "",
      gstin: "",
      shippingAddress: "",
      contactPerson: "",
      phone: "",
      email: "",
      loginEmail: "",
      password: "",
    });
    new bootstrap.Modal(branchCreateModalRef.current).show();
  };

  const openEditBranchModal = (branch) => {
    setEditingBranch(branch);
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

      <button className="btn btn-orange rounded-pill mb-3" onClick={openCompanyModal}>
        + New Company
      </button>

      <div className="row g-4">
        {/* LEFT PANEL */}
        <div className="col-lg-3">
          <div className="card h-100">
            <div className="p-2">
              <input
                className="form-control rounded-pill"
                placeholder="Search company..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            <ul className="list-group list-group-flush">
              {filteredCompanies.map((c) => (
                <li
                  key={c.id}
                  className={`list-group-item ${selectedCompany.id === c.id ? "bg-primary text-white" : ""
                    }`}
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedCompany(c)}
                >
                  {c.companyName}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="col-lg-9">
          <div className="card p-4">
            <h5 className="text-orange">{selectedCompany.companyName}</h5>
            <p className="text-muted mb-1">
              Billing: {selectedCompany.billingAddress}
            </p>

            <div className="d-flex justify-content-between align-items-center my-3">
              <h6>Branches (Buyers)</h6>
              <button className="btn btn-outline-orange btn-sm" onClick={openAddBranchModal}>
                + Add Branch
              </button>
            </div>

            {selectedCompany.branches.map((b) => (
              <div key={b.id} className="border rounded p-3 mb-3">
                <h6 className="text-orange">{b.branchName}</h6>
                <div className="row small g-2">
                  <div className="col-md-6">
                    <b>GSTIN:</b> {b.gstin}
                  </div>

                  <div className="col-md-6">
                    <b>Phone:</b> {b.phone}
                  </div>

                  <div className="col-md-6">
                    <b>Contact Person:</b> {b.contactPerson}
                  </div>

                  <div className="col-md-6">
                    <b>Email:</b> {b.email}
                  </div>

                  <div className="col-md-6">
                    <b>Login Email:</b> {b.loginEmail}
                  </div>

                  <div className="col-12">
                    <b>Shipping Address:</b> {b.shippingAddress}
                  </div>
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
              <input className="form-control mb-2" placeholder="Company Name"
                onChange={(e) => setNewCompany({ ...newCompany, companyName: e.target.value })} />
              <input className="form-control mb-2" placeholder="Billing Address"
                onChange={(e) => setNewCompany({ ...newCompany, billingAddress: e.target.value })} />
              <input className="form-control mb-2" placeholder="Accounts Email"
                onChange={(e) => setNewCompany({ ...newCompany, companyEmail: e.target.value })} />
              <button className="btn btn-orange">Create</button>
            </form>
          </div>
        </div>
      </div>

      {/* ===================== CREATE BRANCH MODAL ===================== */}
      <div className="modal fade" ref={branchCreateModalRef}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content p-4">
            <h5>Add Branch (Buyer)</h5>
            <form onSubmit={handleBranchCreate} className="row g-2">
              {Object.keys(newBranch || {}).map(
                (k) =>
                  k !== "id" && (
                    <div key={k} className="col-md-6">
                      <input
                        className="form-control"
                        placeholder={k}
                        onChange={(e) =>
                          setNewBranch({ ...newBranch, [k]: e.target.value })
                        }
                      />
                    </div>
                  )
              )}
              <button className="btn btn-orange mt-2">Add Branch</button>
            </form>
          </div>
        </div>
      </div>

      {/* ===================== EDIT BRANCH MODAL ===================== */}
      <div className="modal fade" ref={branchEditModalRef}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content p-4">
            <h5>Edit Branch</h5>
            <form onSubmit={handleBranchUpdate} className="row g-2">
              {editingBranch &&
                Object.keys(editingBranch).map(
                  (k) =>
                    k !== "id" && (
                      <div key={k} className="col-md-6">
                        <input
                          className="form-control"
                          value={editingBranch[k]}
                          onChange={(e) =>
                            setEditingBranch({
                              ...editingBranch,
                              [k]: e.target.value,
                            })
                          }
                        />
                      </div>
                    )
                )}
              <button className="btn btn-orange mt-2">Save</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
