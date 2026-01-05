"use client";
import React, { useState } from "react";
import jsPDF from "jspdf";

interface Product {
  id: number;
  name: string;
  quantity: number;
  unitPrice: number;
}

interface Client {
  id: number;
  name: string;
  email: string;
}

interface Proposal {
  id: number;
  clientId: number;
  products: Product[];
  gst: number;
  delivery: number;
  branding: number;
}

const ProposalPage: React.FC = () => {
  const [clients] = useState<Client[]>([
    { id: 1, name: "Client A", email: "clientA@example.com" },
    { id: 2, name: "Client B", email: "clientB@example.com" },
  ]);

  const [products] = useState<Product[]>([
    { id: 1, name: "Product X", quantity: 5, unitPrice: 100 },
    { id: 2, name: "Product Y", quantity: 2, unitPrice: 200 },
  ]);

  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [proposalProducts, setProposalProducts] = useState<Product[]>([...products]);
  const [gst, setGst] = useState<number>(0);
  const [delivery, setDelivery] = useState<number>(0);
  const [branding, setBranding] = useState<number>(0);

  // Calculate subtotal and total
  const subtotal = proposalProducts.reduce(
    (sum, p) => sum + p.quantity * p.unitPrice,
    0
  );
  const total = subtotal + gst + delivery + branding;

  const handleQuantityChange = (productId: number, value: number) => {
    setProposalProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, quantity: value } : p))
    );
  };

  // Generate PDF using jsPDF
  const generatePDF = () => {
    if (!selectedClientId) return alert("Select a client first!");

    const client = clients.find((c) => c.id === selectedClientId);
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(`Proposal for ${client?.name}`, 20, 20);

    let y = 30;
    doc.setFontSize(12);
    proposalProducts.forEach((p) => {
      doc.text(
        `${p.name} - Qty: ${p.quantity} x ₹${p.unitPrice} = ₹${p.quantity * p.unitPrice}`,
        20,
        y
      );
      y += 8;
    });

    doc.text(`Subtotal: ₹${subtotal}`, 20, y);
    y += 8;
    doc.text(`GST: ₹${gst}`, 20, y);
    y += 8;
    doc.text(`Delivery: ₹${delivery}`, 20, y);
    y += 8;
    doc.text(`Branding: ₹${branding}`, 20, y);
    y += 8;
    doc.text(`Total: ₹${total}`, 20, y);

    doc.save(`Proposal_${client?.name}.pdf`);
  };

  // Mock send email
  const sendEmail = () => {
    if (!selectedClientId) return alert("Select a client first!");
    const client = clients.find((c) => c.id === selectedClientId);
    alert(`Proposal sent to ${client?.email}! (mocked)`);
  };

  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      <h4 className="mb-4">Proposal Management</h4>

      {/* Select Client */}
      <div className="mb-3">
        <label className="form-label">Select Client</label>
        <select
          className="form-select"
          value={selectedClientId ?? ""}
          onChange={(e) => setSelectedClientId(Number(e.target.value))}
        >
          <option value="">-- Select Client --</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
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
              {proposalProducts.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.unitPrice}</td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      className="form-control"
                      value={p.quantity}
                      onChange={(e) =>
                        handleQuantityChange(p.id, Number(e.target.value))
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

      {/* Extra Costs */}
      <div className="card mb-4">
        <div className="card-header">Additional Costs</div>
        <div className="card-body row g-3">
          <div className="col-md-4">
            <label className="form-label">GST (₹)</label>
            <input
              type="number"
              min={0}
              className="form-control"
              value={gst}
              onChange={(e) => setGst(Number(e.target.value))}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Delivery Charges (₹)</label>
            <input
              type="number"
              min={0}
              className="form-control"
              value={delivery}
              onChange={(e) => setDelivery(Number(e.target.value))}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Branding Charges (₹)</label>
            <input
              type="number"
              min={0}
              className="form-control"
              value={branding}
              onChange={(e) => setBranding(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="mb-3">
        <h5>Total Amount: ₹{total}</h5>
      </div>

      {/* Actions */}
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
