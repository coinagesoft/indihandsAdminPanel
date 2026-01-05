"use client";
import React, { useState } from "react";
import jsPDF from "jspdf";

const ProposalPage = () => {
  const [clients] = useState([
    { id: 1, name: "Client A", email: "clientA@example.com" },
    { id: 2, name: "Client B", email: "clientB@example.com" },
  ]);

  const [products] = useState([
    { id: 1, name: "Product X", quantity: 5, unitPrice: 100 },
    { id: 2, name: "Product Y", quantity: 2, unitPrice: 200 },
  ]);

  const [selectedClientId, setSelectedClientId] = useState("");
  const [proposalProducts, setProposalProducts] = useState(products);
  const [gst, setGst] = useState(0);
  const [delivery, setDelivery] = useState(0);
  const [branding, setBranding] = useState(0);

  const subtotal = proposalProducts.reduce(
    (sum, p) => sum + p.quantity * p.unitPrice,
    0
  );

  const total = subtotal + gst + delivery + branding;

  const handleQuantityChange = (productId, value) => {
    setProposalProducts(prev =>
      prev.map(p =>
        p.id === productId
          ? { ...p, quantity: Number(value || 0) }
          : p
      )
    );
  };

  const generatePDF = () => {
    if (!selectedClientId) {
      alert("Please select a client first");
      return;
    }

    const client = clients.find(c => c.id === Number(selectedClientId));
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(`Proposal for ${client.name}`, 20, 20);

    let y = 35;
    doc.setFontSize(12);

    proposalProducts.forEach(p => {
      doc.text(
        `${p.name} | Qty: ${p.quantity} | ₹${p.unitPrice} | Total: ₹${p.quantity * p.unitPrice}`,
        20,
        y
      );
      y += 8;
    });

    y += 5;
    doc.text(`Subtotal: ₹${subtotal}`, 20, y);
    y += 8;
    doc.text(`GST: ₹${gst}`, 20, y);
    y += 8;
    doc.text(`Delivery: ₹${delivery}`, 20, y);
    y += 8;
    doc.text(`Branding: ₹${branding}`, 20, y);
    y += 10;

    doc.setFontSize(14);
    doc.text(`Final Amount: ₹${total}`, 20, y);

    doc.save(`Proposal_${client.name}.pdf`);
  };

  const sendEmail = () => {
    if (!selectedClientId) {
      alert("Please select a client first");
      return;
    }
    const client = clients.find(c => c.id === Number(selectedClientId));
    alert(`Proposal sent to ${client.email} (mock)`);
  };

  return (
    <div className="container-xxl container-p-y">
      <h4 className="mb-4">Proposal Management</h4>

      <div className="mb-4">
        <label className="form-label">Select Client</label>
        <select
          className="form-select"
          value={selectedClientId}
          onChange={e => setSelectedClientId(e.target.value)}
        >
          <option value="">-- Select Client --</option>
          {clients.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="card mb-4">
        <div className="card-header">Products</div>
        <div className="card-body">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Product</th>
                <th>Unit Price (₹)</th>
                <th>Quantity</th>
                <th>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {proposalProducts.map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.unitPrice}</td>
                  <td style={{ width: 120 }}>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={p.quantity}
                      onChange={e =>
                        handleQuantityChange(p.id, e.target.value)
                      }
                    />
                  </td>
                  <td>{p.quantity * p.unitPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">Additional Costs</div>
        <div className="card-body row g-3">
          <div className="col-md-4">
            <label className="form-label">GST (₹)</label>
            <input
              type="number"
              className="form-control"
              value={gst}
              onChange={e => setGst(Number(e.target.value || 0))}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Delivery (₹)</label>
            <input
              type="number"
              className="form-control"
              value={delivery}
              onChange={e => setDelivery(Number(e.target.value || 0))}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Branding (₹)</label>
            <input
              type="number"
              className="form-control"
              value={branding}
              onChange={e => setBranding(Number(e.target.value || 0))}
            />
          </div>
        </div>
      </div>

      <h5 className="mb-3">Final Amount: ₹{total}</h5>

      <div className="d-flex gap-2">
        <button className="btn btn-primary" onClick={generatePDF}>
          Generate PDF
        </button>
        <button className="btn btn-success" onClick={sendEmail}>
          Send Proposal to Email
        </button>
      </div>
    </div>
  );
};

export default ProposalPage;
