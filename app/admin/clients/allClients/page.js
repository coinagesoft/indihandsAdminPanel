"use client";
import React, { useState, useRef } from "react";

const Page = () => {
  const [customers, setCustomers] = useState([
    { id: 1, name: "John Doe", customerId: "CUST001", country: "USA", orders: 5, totalSpent: "$1,200.00", username: "john123", password: "pass@123" },
    { id: 2, name: "Jane Smith", customerId: "CUST002", country: "Canada", orders: 3, totalSpent: "$780.00", username: "janeS", password: "pass@456" },
    { id: 3, name: "Michael Johnson", customerId: "CUST003", country: "Australia", orders: 7, totalSpent: "$1,560.00", username: "mikeJ", password: "pass@789" },
  ]);

  const [editCustomer, setEditCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    customerId: "",
    country: "",
    orders: 0,
    totalSpent: "$0.00",
    username: "",
    password: "",
  });

  const editOffcanvasRef = useRef(null);
  const addOffcanvasRef = useRef(null);

  // Edit client
  const handleEditSubmit = (e) => {
    e.preventDefault();
    setCustomers((prev) =>
      prev.map((cust) => (cust.id === editCustomer.id ? editCustomer : cust))
    );
    alert(`Customer ${editCustomer.name} updated successfully!`);
  };

  // Add new client
  const handleAddSubmit = (e) => {
    e.preventDefault();
    const id = customers.length + 1;
    setCustomers([...customers, { ...newCustomer, id }]);
    alert(`Customer ${newCustomer.name} added successfully!`);
    setNewCustomer({
      name: "",
      customerId: "",
      country: "",
      orders: 0,
      totalSpent: "$0.00",
      username: "",
      password: "",
    });
  };

  const openEditModal = (customer) => {
    setEditCustomer(customer);
    if (editOffcanvasRef.current) {
      const bsOffcanvas = new bootstrap.Offcanvas(editOffcanvasRef.current);
      bsOffcanvas.show();
    }
  };

  const openAddModal = () => {
    if (addOffcanvasRef.current) {
      const bsOffcanvas = new bootstrap.Offcanvas(addOffcanvasRef.current);
      bsOffcanvas.show();
    }
  };

  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      <div className="d-flex justify-content-between mb-3">
        <h4>Clients</h4>
        <button className="btn btn-primary" onClick={openAddModal}>Add Client</button>
      </div>

      <div className="card">
        <div className="card-datatable table-responsive">
          <table className="datatables-customers table">
            <thead>
              <tr>
                <th></th>
                <th>Customer</th>
                <th>Customer Id</th>
                <th>Country</th>
                <th>Order</th>
                <th>Total Spent</th>
                <th>Username</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((cust) => (
                <tr key={cust.id}>
                  <td>
                    <div className="avatar me-2">
                      <span className="avatar-initial rounded bg-label-primary">{cust.name.charAt(0)}</span>
                    </div>
                  </td>
                  <td>{cust.name}</td>
                  <td>{cust.customerId}</td>
                  <td>{cust.country}</td>
                  <td>{cust.orders}</td>
                  <td>{cust.totalSpent}</td>
                  <td>{cust.username}</td>
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

      {/* Edit Customer Offcanvas */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex={-1}
        ref={editOffcanvasRef}
        id="offcanvasEditCustomer"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="offcanvas-title">Edit Client</h5>
          <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" />
        </div>
        <div className="offcanvas-body mx-0 flex-grow-0">
          {editCustomer && (
            <form onSubmit={handleEditSubmit}>
              <div className="mb-3">
                <label>Name*</label>
                <input
                  type="text"
                  className="form-control"
                  value={editCustomer.name}
                  onChange={(e) => setEditCustomer({ ...editCustomer, name: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label>Email*</label>
                <input
                  type="email"
                  className="form-control"
                  value={editCustomer.customerEmail || ""}
                  onChange={(e) => setEditCustomer({ ...editCustomer, customerEmail: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label>Mobile</label>
                <input
                  type="text"
                  className="form-control"
                  value={editCustomer.customerContact || ""}
                  onChange={(e) => setEditCustomer({ ...editCustomer, customerContact: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label>Username*</label>
                <input
                  type="text"
                  className="form-control"
                  value={editCustomer.username || ""}
                  onChange={(e) => setEditCustomer({ ...editCustomer, username: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label>Password*</label>
                <input
                  type="password"
                  className="form-control"
                  value={editCustomer.password || ""}
                  onChange={(e) => setEditCustomer({ ...editCustomer, password: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary me-2">Save</button>
              <button type="reset" className="btn btn-outline-danger" data-bs-dismiss="offcanvas">Discard</button>
            </form>
          )}
        </div>
      </div>

      {/* Add Customer Offcanvas */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex={-1}
        ref={addOffcanvasRef}
        id="offcanvasAddCustomer"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="offcanvas-title">Add Client</h5>
          <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" />
        </div>
        <div className="offcanvas-body mx-0 flex-grow-0">
          <form onSubmit={handleAddSubmit}>
            <div className="mb-3">
              <label>Name*</label>
              <input
                type="text"
                className="form-control"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label>Customer Id*</label>
              <input
                type="text"
                className="form-control"
                value={newCustomer.customerId}
                onChange={(e) => setNewCustomer({ ...newCustomer, customerId: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label>Country</label>
              <input
                type="text"
                className="form-control"
                value={newCustomer.country}
                onChange={(e) => setNewCustomer({ ...newCustomer, country: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label>Username*</label>
              <input
                type="text"
                className="form-control"
                value={newCustomer.username}
                onChange={(e) => setNewCustomer({ ...newCustomer, username: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label>Password*</label>
              <input
                type="password"
                className="form-control"
                value={newCustomer.password}
                onChange={(e) => setNewCustomer({ ...newCustomer, password: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary me-2">Add</button>
            <button type="reset" className="btn btn-outline-danger" data-bs-dismiss="offcanvas">Discard</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;
