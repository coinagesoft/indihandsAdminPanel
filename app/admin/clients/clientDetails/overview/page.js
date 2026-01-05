"use client";
import React, { useState, useRef } from "react";

const Page = () => {
  const dummyClients = [
    {
      id: 1,
      companyName: "Acme Corp",
      gst: "27ABCDE1234F1Z5",
      primaryContact: "John Doe",
      email: "john@acme.com",
      phone: "+1 123-456-7890",
      addresses: ["123 Main St, NY", "456 Elm St, LA"],
      loginEnabled: true,
    },
    {
      id: 2,
      companyName: "Globex Ltd",
      gst: "29XYZAB1234C2Z6",
      primaryContact: "Jane Smith",
      email: "jane@globex.com",
      phone: "+1 987-654-3210",
      addresses: ["789 Pine St, TX"],
      loginEnabled: false,
    },
    {
      id: 3,
      companyName: "Initech",
      gst: "22INTEC1234X1Z2",
      primaryContact: "Peter Gibbons",
      email: "peter@initech.com",
      phone: "+1 555-555-5555",
      addresses: ["101 Tech Blvd, SF"],
      loginEnabled: true,
    },
  ];

  const [clients, setClients] = useState(dummyClients);
  const [selectedClient, setSelectedClient] = useState(clients[0]);
  const [filter, setFilter] = useState("");
  const editModalRef = useRef(null);

  const openEditModal = () =>
    editModalRef.current &&
    new bootstrap.Modal(editModalRef.current).show();

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSelectedClient((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setClients((prev) =>
      prev.map((c) => (c.id === selectedClient.id ? selectedClient : c))
    );
    alert(`Client ${selectedClient.companyName} updated!`);
  };

  // Filtered clients
  const filteredClients = clients.filter(
    (c) =>
      c.companyName.toLowerCase().includes(filter.toLowerCase()) ||
      c.primaryContact.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="container-xxl flex-grow-1 py-4">
      <h4 className="mb-4 text-primary">Client Management</h4>
      <div className="row g-4">
        {/* Left Panel: Client List + Filter */}
        <div className="col-xl-3 col-lg-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <span>Clients</span>
              <span className="badge bg-primary">{clients.length}</span>
            </div>
            <div className="p-2">
              <input
                type="text"
                className="form-control rounded-pill"
                placeholder="Search clients..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            <ul
              className="list-group list-group-flush overflow-auto"
              style={{ maxHeight: "65vh" }}
            >
              {filteredClients.map((c) => (
                <li
                  key={c.id}
                  className={`list-group-item d-flex flex-column gap-1 ${
                    selectedClient.id === c.id
                      ? "bg-primary text-white fw-bold"
                      : "hover-bg-light"
                  }`}
                  style={{
                    cursor: "pointer",
                    borderRadius: "0.5rem",
                    margin: "0.2rem 0",
                    transition: "0.2s",
                  }}
                  onClick={() => setSelectedClient(c)}
                >
                  <div className="text-truncate">{c.companyName}</div>
                  <small className="text-muted">
                    {c.primaryContact}
                  </small>
                </li>
              ))}
            </ul>
          </div>
        </div>

       {/* Right Panel: Client Details */}
<div className="col-xl-9 col-lg-8">
  <div className="card shadow-sm border-0 p-4 rounded-4">
    {/* Header */}
    <div className="d-flex align-items-center mb-4">
      <div className="avatar rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" style={{width: '60px', height: '60px', fontSize: '1.5rem'}}>
        {selectedClient.companyName.charAt(0)}
      </div>
      <div>
        <h5 className="mb-0 text-primary">{selectedClient.companyName}</h5>
        <small className="text-muted">{selectedClient.primaryContact}</small>
      </div>
    </div>

    {/* Client Info Grid */}
    <div className="row g-3 mb-4">
      <div className="col-md-6">
        <strong>GST:</strong> <span className="text-muted">{selectedClient.gst}</span>
      </div>
      <div className="col-md-6">
        <strong>Email:</strong> <span className="text-muted">{selectedClient.email}</span>
      </div>
      <div className="col-md-6">
        <strong>Phone:</strong> <span className="text-muted">{selectedClient.phone}</span>
      </div>
      <div className="col-md-6">
        <strong>Login Enabled:</strong>{" "}
        <span className={`badge ${selectedClient.loginEnabled ? "bg-success" : "bg-secondary"}`}>
          {selectedClient.loginEnabled ? "Yes" : "No"}
        </span>
      </div>
      <div className="col-12">
        <strong>Addresses:</strong>
        <ul className="ms-3 mb-0">
          {selectedClient.addresses.map((addr, i) => (
            <li key={i} className="text-muted">{addr}</li>
          ))}
        </ul>
      </div>
    </div>

    {/* Edit Button */}
    <div className="d-flex justify-content-end">
      <button
        className="btn btn-primary rounded-pill px-4"
        onClick={openEditModal}
      >
        Edit Client
      </button>
    </div>
  </div>
</div>

      </div>

      {/* Edit Modal */}
      <div
        className="modal fade"
        ref={editModalRef}
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-simple">
          <div className="modal-content rounded-4 shadow">
            <button
              type="button"
              className="btn-close m-3 position-absolute top-0 end-0"
              data-bs-dismiss="modal"
            ></button>
            <div className="modal-body p-4">
              <h5 className="text-center mb-3 text-primary">Edit Client</h5>
              <form className="row g-3" onSubmit={handleEditSubmit}>
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control rounded-pill"
                    name="companyName"
                    value={selectedClient.companyName}
                    onChange={handleEditChange}
                    placeholder="Company Name"
                  />
                </div>
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control rounded-pill"
                    name="gst"
                    value={selectedClient.gst}
                    onChange={handleEditChange}
                    placeholder="GST"
                  />
                </div>
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control rounded-pill"
                    name="primaryContact"
                    value={selectedClient.primaryContact}
                    onChange={handleEditChange}
                    placeholder="Primary Contact"
                  />
                </div>
                <div className="col-md-6">
                  <input
                    type="email"
                    className="form-control rounded-pill"
                    name="email"
                    value={selectedClient.email}
                    onChange={handleEditChange}
                    placeholder="Email"
                  />
                </div>
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control rounded-pill"
                    name="phone"
                    value={selectedClient.phone}
                    onChange={handleEditChange}
                    placeholder="Phone"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">
                    <strong>Login Enabled</strong>
                  </label>
                  <input
                    type="checkbox"
                    className="form-check-input ms-2"
                    name="loginEnabled"
                    checked={selectedClient.loginEnabled}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="col-12 d-flex justify-content-center gap-2 mt-3">
                  <button
                    className="btn btn-primary rounded-pill"
                    type="submit"
                  >
                    Save
                  </button>
                  <button
                    className="btn btn-outline-secondary rounded-pill"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
