"use client";
import React, { useState } from "react";

const SecuritySettingsPage = () => {
  const [clients, setClients] = useState([
    { id: 1, name: "Client A", email: "clienta@example.com", username: "clientA", selected: false },
    { id: 2, name: "Client B", email: "clientb@example.com", username: "clientB", selected: false },
    { id: 3, name: "Client C", email: "clientc@example.com", username: "clientC", selected: false },
  ]);

  const [filterText, setFilterText] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");

  // Filtered clients based on search
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(filterText.toLowerCase()) ||
    client.email.toLowerCase().includes(filterText.toLowerCase())
  );

  // Only allow selecting one client at a time
  const handleSelectClient = (id) => {
    setClients(prev =>
      prev.map(client => ({
        ...client,
        selected: client.id === id ? !client.selected : false // deselect all others
      }))
    );

    // Set the current username of the selected client
    const selected = clients.find(c => c.id === id);
    setNewUsername(selected ? selected.username : "");
  };

  const handleResetPassword = () => {
    const selectedClient = clients.find(c => c.selected);
    if (!selectedClient) {
      alert("Please select one client!");
      return;
    }
    if (!newPassword) {
      alert("Please enter a new password!");
      return;
    }
    if (!newUsername) {
      alert("Please enter a username!");
      return;
    }

    console.log(
      `Username for ${selectedClient.name} changed to: ${newUsername}, password reset to: ${newPassword}`
    );
    // TODO: Call API to update username, reset password & send email

    alert(`Username & password updated for ${selectedClient.name}`);

    setNewPassword("");
    setNewUsername("");
    setClients(prev => prev.map(c => ({ ...c, selected: false }))); // reset selection
  };

  const selectedClient = clients.find(c => c.selected);

  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      <h4 className="mb-4">Security Settings - Reset Client Password & Update Username</h4>

      {/* Filter */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Filter clients by name or email..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>

      {/* Clients Table */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Select Client</h5>
        </div>
        <div className="table-responsive">
          <table className="table table-striped table-hover mb-0">
            <thead>
              <tr>
                <th>Select</th>
                <th>Client Name</th>
                <th>Username</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-muted">
                    No clients found.
                  </td>
                </tr>
              )}
              {filteredClients.map(client => (
                <tr key={client.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={client.selected}
                      onChange={() => handleSelectClient(client.id)}
                    />
                  </td>
                  <td>{client.name}</td>
                  <td>{client.username}</td>
                  <td>{client.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Password & Username Reset Form */}
      {selectedClient && (
        <div className="card mb-6">
          <div className="card-header">
            <h5 className="mb-0">Update Username & Reset Password for {selectedClient.name}</h5>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">New Username</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter new username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" onClick={handleResetPassword}>
              Update Username & Reset Password
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecuritySettingsPage;
