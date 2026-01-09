"use client";
import React, { useState, useRef } from "react";

const Page = () => {
  const dummyClients = [
    {
      id: 1,
      name: "TCS",
      billingAddress: "123 Corporate Ave, Mumbai, India",
      shippingAddresses: [
        "123 Corporate Ave, Mumbai, India",
        "456 Tech Park, Pune, India",
      ],
      gstin: "27ABCDE1234F1Z5",
      contactPerson: "Ravi Kumar",
      phone: "+91 9876543210",
      email: "ravi@tcs.com",
      branches: [
        { location: "Mumbai", state: "MH", city: "Mumbai", contact: "+91 9123456789" },
        { location: "Bangalore", state: "KA", city: "Bangalore", contact: "+91 9988776655" },
      ],
    },
    {
      id: 2,
      name: "Infosys",
      billingAddress: "456 Tech Park, Pune, India",
      shippingAddresses: ["456 Tech Park, Pune, India"],
      gstin: "27ABCDE5678F1Z6",
      contactPerson: "Sneha Patil",
      phone: "+91 9123456789",
      email: "sneha@infosys.com",
      branches: [
        { location: "Pune", state: "MH", city: "Pune", contact: "+91 9876543210" },
        { location: "Hyderabad", state: "TG", city: "Hyderabad", contact: "+91 9988776655" },
      ],
    },
  ];

  const [clients, setClients] = useState(dummyClients);
  const [selectedClient, setSelectedClient] = useState(clients[0]);
  const [filter, setFilter] = useState("");

  const editModalRef = useRef(null);
  const createModalRef = useRef(null);

  const openEditModal = () => editModalRef.current && new bootstrap.Modal(editModalRef.current).show();
  const openCreateModal = () => {
    setNewClient({
      id: Date.now(), // temporary ID
      name: "",
      billingAddress: "",
      shippingAddresses: [""],
      gstin: "",
      contactPerson: "",
      phone: "",
      email: "",
      branches: [{ location: "", city: "", state: "", contact: "" }],
    });
    createModalRef.current && new bootstrap.Modal(createModalRef.current).show();
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setSelectedClient((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setClients((prev) => prev.map((c) => (c.id === selectedClient.id ? selectedClient : c)));
    alert(`Client ${selectedClient.name} updated!`);
  };

  // --- New Client State & Handlers ---
  const [newClient, setNewClient] = useState(null);

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setNewClient((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    setClients((prev) => [...prev, newClient]);
    alert(`Client ${newClient.name} created!`);
    // close modal
    const modalEl = bootstrap.Modal.getInstance(createModalRef.current);
    modalEl.hide();
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name?.toLowerCase().includes(filter.toLowerCase()) ||
      c.contactPerson?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="container-xxl flex-grow-1 py-4">
      <h4 className="mb-4 text-primary">Client Management</h4>
     <div className="mb-3">
  <button
    className="btn btn-primary rounded-pill px-4" // <- theme matching
    onClick={openCreateModal}
  >
    + New Company
  </button>
</div>

      <div className="row g-4">
        {/* Left Panel */}
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
            <ul className="list-group list-group-flush overflow-auto" style={{ maxHeight: "65vh" }}>
              {filteredClients.map((c) => (
                <li
                  key={c.id}
                  className={`list-group-item d-flex flex-column gap-1 ${
                    selectedClient.id === c.id ? "bg-primary text-white fw-bold" : "hover-bg-light"
                  }`}
                  style={{ cursor: "pointer", borderRadius: "0.5rem", margin: "0.2rem 0", transition: "0.2s" }}
                  onClick={() => setSelectedClient(c)}
                >
                  <div className="text-truncate">{c.name}</div>
                  <small className="text-muted">{c.contactPerson}</small>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Panel */}
        <div className="col-xl-9 col-lg-8">
          <div className="card shadow-sm border-0 p-4 rounded-4">
            <div className="d-flex align-items-center mb-4">
              <div className="avatar rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" style={{ width: "60px", height: "60px", fontSize: "1.5rem" }}>
                {selectedClient.name.charAt(0)}
              </div>
              <div>
                <h5 className="mb-0 text-primary">{selectedClient.name}</h5>
                <small className="text-muted">{selectedClient.contactPerson}</small>
              </div>
            </div>

            {/* Client Info */}
            <div className="row g-3 mb-4">
              <div className="col-md-6"><strong>GSTIN:</strong> <span className="text-muted">{selectedClient.gstin}</span></div>
              <div className="col-md-6"><strong>Email:</strong> <span className="text-muted">{selectedClient.email}</span></div>
              <div className="col-md-6"><strong>Phone:</strong> <span className="text-muted">{selectedClient.phone}</span></div>
              <div className="col-md-6"><strong>Billing Address:</strong> <span className="text-muted">{selectedClient.billingAddress}</span></div>
              <div className="col-12">
                <strong>Shipping Addresses:</strong>
                <ul className="ms-3 mb-0">{selectedClient.shippingAddresses.map((addr, i) => (<li key={i} className="text-muted">{addr}</li>))}</ul>
              </div>
              <div className="col-12">
                <strong>Branches:</strong>
                <ul className="ms-3 mb-0">{selectedClient.branches.map((b, i) => (<li key={i} className="text-muted">{b.location}, {b.city}, {b.state} ({b.contact})</li>))}</ul>
              </div>
              
            </div>

            <div className="d-flex justify-content-end">
              <button className="btn btn-primary rounded-pill px-4" onClick={openEditModal}>
                Edit Client
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* --- Create Modal --- */}
      <div className="modal fade" ref={createModalRef} tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-simple">
          <div className="modal-content rounded-4 shadow">
            <button type="button" className="btn-close m-3 position-absolute top-0 end-0" data-bs-dismiss="modal"></button>
            <div className="modal-body p-4">
              <h5 className="text-center mb-3 text-success">Create New Company</h5>
              {newClient && (
                <form className="row g-3" onSubmit={handleCreateSubmit}>
                  {/* Name */}
                  <div className="col-md-6">
                    <input type="text" className="form-control rounded-pill" name="name" value={newClient.name} onChange={handleCreateChange} placeholder="Company Name" />
                  </div>

                  {/* Billing */}
                  <div className="col-md-6">
                    <input type="text" className="form-control rounded-pill" name="billingAddress" value={newClient.billingAddress} onChange={handleCreateChange} placeholder="Billing Address" />
                  </div>

                  {/* GSTIN */}
                  <div className="col-md-6">
                    <input type="text" className="form-control rounded-pill" name="gstin" value={newClient.gstin} onChange={handleCreateChange} placeholder="GSTIN" />
                  </div>

                  {/* Contact Person */}
                  <div className="col-md-6">
                    <input type="text" className="form-control rounded-pill" name="contactPerson" value={newClient.contactPerson} onChange={handleCreateChange} placeholder="Contact Person" />
                  </div>

                  {/* Phone */}
                  <div className="col-md-6">
                    <input type="text" className="form-control rounded-pill" name="phone" value={newClient.phone} onChange={handleCreateChange} placeholder="Phone" />
                  </div>

                  {/* Email */}
                  <div className="col-md-6">
                    <input type="email" className="form-control rounded-pill" name="email" value={newClient.email} onChange={handleCreateChange} placeholder="Email" />
                  </div>

                  {/* Shipping Addresses */}
                  <div className="col-12">
                    <strong>Shipping Addresses</strong>
                    {newClient.shippingAddresses.map((addr, idx) => (
                      <div key={idx} className="input-group mb-2">
                        <input type="text" className="form-control rounded-pill" value={addr} onChange={(e) => {
                          const newAddresses = [...newClient.shippingAddresses];
                          newAddresses[idx] = e.target.value;
                          setNewClient((prev) => ({ ...prev, shippingAddresses: newAddresses }));
                        }} />
                        <button type="button" className="btn btn-outline-danger" onClick={() => {
                          const newAddresses = newClient.shippingAddresses.filter((_, i) => i !== idx);
                          setNewClient((prev) => ({ ...prev, shippingAddresses: newAddresses }));
                        }}>X</button>
                      </div>
                    ))}
                    <button type="button" className="btn btn-outline-primary rounded-pill mt-2" onClick={() =>
                      setNewClient((prev) => ({ ...prev, shippingAddresses: [...prev.shippingAddresses, ""] }))
                    }>Add Address</button>
                  </div>

                  {/* Branches */}
                  <div className="col-12">
                    <strong>Branches</strong>
                    {newClient.branches.map((b, idx) => (
                      <div key={idx} className="border rounded p-2 mb-2">
                        <input type="text" className="form-control mb-1" placeholder="Location" value={b.location} onChange={(e) => {
                          const newBranches = [...newClient.branches];
                          newBranches[idx].location = e.target.value;
                          setNewClient((prev) => ({ ...prev, branches: newBranches }));
                        }} />
                        <input type="text" className="form-control mb-1" placeholder="City" value={b.city} onChange={(e) => {
                          const newBranches = [...newClient.branches];
                          newBranches[idx].city = e.target.value;
                          setNewClient((prev) => ({ ...prev, branches: newBranches }));
                        }} />
                        <input type="text" className="form-control mb-1" placeholder="State" value={b.state} onChange={(e) => {
                          const newBranches = [...newClient.branches];
                          newBranches[idx].state = e.target.value;
                          setNewClient((prev) => ({ ...prev, branches: newBranches }));
                        }} />
                        <input type="text" className="form-control mb-1" placeholder="Contact" value={b.contact} onChange={(e) => {
                          const newBranches = [...newClient.branches];
                          newBranches[idx].contact = e.target.value;
                          setNewClient((prev) => ({ ...prev, branches: newBranches }));
                        }} />
                        <button type="button" className="btn btn-outline-danger btn-sm mt-1" onClick={() => {
                          const newBranches = newClient.branches.filter((_, i) => i !== idx);
                          setNewClient((prev) => ({ ...prev, branches: newBranches }));
                        }}>Remove Branch</button>
                      </div>
                    ))}
                    <button type="button" className="btn btn-outline-primary rounded-pill mt-2" onClick={() =>
                      setNewClient((prev) => ({ ...prev, branches: [...prev.branches, { location: "", city: "", state: "", contact: "" }] }))
                    }>Add Branch</button>
                  </div>
   {/* Credentials Section */}
            <div className="col-12 mt-3 border-top pt-3">
              <h6 className="text-success mb-2">Login Credentials</h6>
              <div className="col-md-6 mb-2">
                <input
                  type="email"
                  className="form-control rounded-pill"
                  placeholder="Login Email"
                  value={selectedClient.loginEmail || ""}
                  onChange={(e) =>
                    setSelectedClient((prev) => ({ ...prev, loginEmail: e.target.value }))
                  }
                />
              </div>
              <div className="col-md-6 mb-2">
                <input
                  type="password"
                  className="form-control rounded-pill"
                  placeholder="Password"
                  value={selectedClient.password || ""}
                  onChange={(e) =>
                    setSelectedClient((prev) => ({ ...prev, password: e.target.value }))
                  }
                />
              </div>
              <div className="col-12">
                <button
                  type="button"
                  className="btn btn-outline-warning rounded-pill"
                  onClick={() =>
                    setSelectedClient((prev) => ({ ...prev, password: "" }))
                  }
                >
                  Create Password
                </button>
              </div>
            </div>
                  <div className="col-12 d-flex justify-content-center gap-2 mt-3">
                    <button type="submit" className="btn btn-success rounded-pill">Create</button>
                    <button className="btn btn-outline-secondary rounded-pill" data-bs-dismiss="modal">Cancel</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
{/* --- Edit Modal --- */}
<div className="modal fade" ref={editModalRef} tabIndex="-1" aria-hidden="true">
  <div className="modal-dialog modal-lg modal-simple">
    <div className="modal-content rounded-4 shadow">
      <button type="button" className="btn-close m-3 position-absolute top-0 end-0" data-bs-dismiss="modal"></button>
      <div className="modal-body p-4">
        <h5 className="text-center mb-3 text-primary">Edit Company</h5>
        {selectedClient && (
          <form className="row g-3" onSubmit={handleEditSubmit}>
            {/* Name */}
            <div className="col-md-6">
              <input
                type="text"
                className="form-control rounded-pill"
                name="name"
                value={selectedClient.name}
                onChange={handleEditChange}
                placeholder="Company Name"
              />
            </div>

            {/* Billing */}
            <div className="col-md-6">
              <input
                type="text"
                className="form-control rounded-pill"
                name="billingAddress"
                value={selectedClient.billingAddress}
                onChange={handleEditChange}
                placeholder="Billing Address"
              />
            </div>

            {/* GSTIN */}
            <div className="col-md-6">
              <input
                type="text"
                className="form-control rounded-pill"
                name="gstin"
                value={selectedClient.gstin}
                onChange={handleEditChange}
                placeholder="GSTIN"
              />
            </div>

            {/* Contact Person */}
            <div className="col-md-6">
              <input
                type="text"
                className="form-control rounded-pill"
                name="contactPerson"
                value={selectedClient.contactPerson}
                onChange={handleEditChange}
                placeholder="Contact Person"
              />
            </div>

            {/* Phone */}
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

            {/* Email */}
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

            {/* Shipping Addresses */}
            <div className="col-12">
              <strong>Shipping Addresses</strong>
              {selectedClient.shippingAddresses.map((addr, idx) => (
                <div key={idx} className="input-group mb-2">
                  <input
                    type="text"
                    className="form-control rounded-pill"
                    value={addr}
                    onChange={(e) => {
                      const newAddresses = [...selectedClient.shippingAddresses];
                      newAddresses[idx] = e.target.value;
                      setSelectedClient((prev) => ({ ...prev, shippingAddresses: newAddresses }));
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => {
                      const newAddresses = selectedClient.shippingAddresses.filter((_, i) => i !== idx);
                      setSelectedClient((prev) => ({ ...prev, shippingAddresses: newAddresses }));
                    }}
                  >
                    X
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline-primary rounded-pill mt-2"
                onClick={() =>
                  setSelectedClient((prev) => ({
                    ...prev,
                    shippingAddresses: [...prev.shippingAddresses, ""],
                  }))
                }
              >
                Add Address
              </button>
            </div>

            {/* Branches */}
            <div className="col-12">
              <strong>Branches</strong>
              {selectedClient.branches.map((b, idx) => (
                <div key={idx} className="border rounded p-2 mb-2">
                  <input
                    type="text"
                    className="form-control mb-1"
                    placeholder="Location"
                    value={b.location}
                    onChange={(e) => {
                      const newBranches = [...selectedClient.branches];
                      newBranches[idx].location = e.target.value;
                      setSelectedClient((prev) => ({ ...prev, branches: newBranches }));
                    }}
                  />
                  <input
                    type="text"
                    className="form-control mb-1"
                    placeholder="City"
                    value={b.city}
                    onChange={(e) => {
                      const newBranches = [...selectedClient.branches];
                      newBranches[idx].city = e.target.value;
                      setSelectedClient((prev) => ({ ...prev, branches: newBranches }));
                    }}
                  />
                  <input
                    type="text"
                    className="form-control mb-1"
                    placeholder="State"
                    value={b.state}
                    onChange={(e) => {
                      const newBranches = [...selectedClient.branches];
                      newBranches[idx].state = e.target.value;
                      setSelectedClient((prev) => ({ ...prev, branches: newBranches }));
                    }}
                  />
                  <input
                    type="text"
                    className="form-control mb-1"
                    placeholder="Contact"
                    value={b.contact}
                    onChange={(e) => {
                      const newBranches = [...selectedClient.branches];
                      newBranches[idx].contact = e.target.value;
                      setSelectedClient((prev) => ({ ...prev, branches: newBranches }));
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm mt-1"
                    onClick={() => {
                      const newBranches = selectedClient.branches.filter((_, i) => i !== idx);
                      setSelectedClient((prev) => ({ ...prev, branches: newBranches }));
                    }}
                  >
                    Remove Branch
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline-primary rounded-pill mt-2"
                onClick={() =>
                  setSelectedClient((prev) => ({
                    ...prev,
                    branches: [...prev.branches, { location: "", city: "", state: "", contact: "" }],
                  }))
                }
              >
                Add Branch
              </button>
            </div>

            {/* Credentials Section */}
            <div className="col-12 mt-3 border-top pt-3">
              <h6 className="text-success mb-2">Login Credentials</h6>
              <div className="col-md-6 mb-2">
                <input
                  type="email"
                  className="form-control rounded-pill"
                  placeholder="Login Email"
                  value={selectedClient.loginEmail || ""}
                  onChange={(e) =>
                    setSelectedClient((prev) => ({ ...prev, loginEmail: e.target.value }))
                  }
                />
              </div>
              <div className="col-md-6 mb-2">
                <input
                  type="password"
                  className="form-control rounded-pill"
                  placeholder="Password"
                  value={selectedClient.password || ""}
                  onChange={(e) =>
                    setSelectedClient((prev) => ({ ...prev, password: e.target.value }))
                  }
                />
              </div>
              <div className="col-12">
                <button
                  type="button"
                  className="btn btn-outline-warning rounded-pill"
                  onClick={() =>
                    setSelectedClient((prev) => ({ ...prev, password: "" }))
                  }
                >
                  Reset Password
                </button>
              </div>
            </div>

            <div className="col-12 d-flex justify-content-center gap-2 mt-3">
              <button type="submit" className="btn btn-primary rounded-pill">
                Save Changes
              </button>
              <button className="btn btn-outline-secondary rounded-pill" data-bs-dismiss="modal">
                Cancel
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
