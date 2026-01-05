"use client";

import React, { useState } from "react";

const BillingAddressAdminPage = () => {
  // ==================== DUMMY USERS ====================
  const [users] = useState([
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" },
    { id: 3, name: "Bob Johnson" },
  ]);
  const [selectedUser, setSelectedUser] = useState(users[0].id);

  // ==================== ADDRESSES ====================
  const [addresses, setAddresses] = useState([
    { id: 1, userId: 1, type: "office", firstName: "John", lastName: "Doe", city: "Pune", state: "MH", billing: true },
    { id: 2, userId: 2, type: "home", firstName: "Jane", lastName: "Smith", city: "Mumbai", state: "MH", billing: true },
  ]);
  const [addressModal, setAddressModal] = useState({ open: false, editId: null });
  const [addressForm, setAddressForm] = useState({ type: "home", firstName: "", lastName: "", city: "", state: "", billing: false });

  // ==================== HANDLERS ====================
  const handleUserChange = (e) => setSelectedUser(Number(e.target.value));

  const openAddressModal = (id = null) => {
    if (id) {
      const addr = addresses.find(a => a.id === id);
      setAddressForm({ ...addr });
      setAddressModal({ open: true, editId: id });
    } else {
      setAddressForm({ type: "home", firstName: "", lastName: "", city: "", state: "", billing: false });
      setAddressModal({ open: true, editId: null });
    }
  };

  const saveAddress = (e) => {
    e.preventDefault();
    if (addressForm.billing) {
      setAddresses(prev => prev.map(a => a.userId === selectedUser ? { ...a, billing: false } : a));
    }

    if (addressModal.editId) {
      setAddresses(prev => prev.map(a => a.id === addressModal.editId ? { ...addressForm, id: addressModal.editId, userId: selectedUser } : a));
    } else {
      setAddresses(prev => [...prev, { ...addressForm, id: Date.now(), userId: selectedUser }]);
    }

    setAddressModal({ open: false, editId: null });
  };

  const deleteAddress = (id) => setAddresses(prev => prev.filter(a => a.id !== id));

  // Filtered data per selected user
  const userAddresses = addresses.filter(a => a.userId === selectedUser);

  return (
    <div className="container py-4">
      <h4 className="mb-4 text-primary">Admin: Addresses</h4>

      {/* USER SELECT */}
      <div className="mb-4">
        <label className="form-label">Select User:</label>
        <select className="form-select w-auto" value={selectedUser} onChange={handleUserChange}>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>

      {/* ADDRESSES */}
      <div className="row">
        <div className="col-12">
          <h5>Addresses</h5>
          {userAddresses.map(addr => (
            <div key={addr.id} className={`card mb-3 ${addr.billing ? "border-primary" : ""}`}>
              <div className="card-body">
                <h6 className="card-title">{addr.type.toUpperCase()} Address</h6>
                <p className="card-text">
                  {addr.firstName} {addr.lastName}, {addr.city}, {addr.state} 
                  {addr.billing && <span className="badge bg-primary ms-2">Billing</span>}
                </p>
                <div className="d-flex flex-wrap gap-2">
                  <button className="btn btn-sm btn-primary" onClick={() => openAddressModal(addr.id)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => deleteAddress(addr.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
          <button className="btn btn-primary" onClick={() => openAddressModal()}>Add New Address</button>
        </div>
      </div>

      {/* ADDRESS MODAL */}
      {addressModal.open && (
        <div className="modal d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{addressModal.editId ? "Edit Address" : "Add Address"}</h5>
                <button type="button" className="btn-close" onClick={() => setAddressModal({ open: false, editId: null })}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={saveAddress}>
                  <div className="mb-2">
                    <div className="form-check form-check-inline">
                      <input type="radio" className="form-check-input" checked={addressForm.type === "home"} onChange={() => setAddressForm(prev => ({ ...prev, type: "home" }))} />
                      <label className="form-check-label">Home</label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input type="radio" className="form-check-input" checked={addressForm.type === "office"} onChange={() => setAddressForm(prev => ({ ...prev, type: "office" }))} />
                      <label className="form-check-label">Office</label>
                    </div>
                  </div>
                  <input type="text" className="form-control mb-2" placeholder="First Name" value={addressForm.firstName} onChange={e => setAddressForm(prev => ({ ...prev, firstName: e.target.value }))} required />
                  <input type="text" className="form-control mb-2" placeholder="Last Name" value={addressForm.lastName} onChange={e => setAddressForm(prev => ({ ...prev, lastName: e.target.value }))} required />
                  <input type="text" className="form-control mb-2" placeholder="City" value={addressForm.city} onChange={e => setAddressForm(prev => ({ ...prev, city: e.target.value }))} required />
                  <input type="text" className="form-control mb-2" placeholder="State" value={addressForm.state} onChange={e => setAddressForm(prev => ({ ...prev, state: e.target.value }))} required />
                  <div className="form-check mb-2">
                    <input type="checkbox" className="form-check-input" checked={addressForm.billing} onChange={e => setAddressForm(prev => ({ ...prev, billing: e.target.checked }))} />
                    <label className="form-check-label">Use as billing</label>
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-secondary" onClick={() => setAddressModal({ open: false, editId: null })}>Close</button>
                    <button type="submit" className="btn btn-primary">{addressModal.editId ? "Save Changes" : "Add Address"}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BillingAddressAdminPage;
