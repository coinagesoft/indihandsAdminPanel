"use client";
import React, { useState, useMemo } from "react";
import jsPDF from "jspdf";

const GST_RATE = 18; // default GST %

const ProposalPage = () => {
  // ================= CLIENTS =================
  const [clients] = useState([
    { id: 1, name: "Client A", email: "clientA@example.com" },
    { id: 2, name: "Client B", email: "clientB@example.com" },
  ]);

  // ================= PRODUCTS =================
  const [products] = useState([
    { id: 1, name: "Product X", quantity: 5, unitPrice: 100 },
    { id: 2, name: "Product Y", quantity: 2, unitPrice: 200 },
  ]);

  const [selectedClientId, setSelectedClientId] = useState("");
  const [proposalProducts, setProposalProducts] = useState(products);

  // ================= EXTRA COSTS =================
  const [delivery, setDelivery] = useState(0);
  const [branding, setBranding] = useState(0);

  // ================= CALCULATIONS =================
  const productSubtotal = useMemo(
    () =>
      proposalProducts.reduce(
        (sum, p) => sum + p.quantity * p.unitPrice,
        0
      ),
    [proposalProducts]
  );

  const taxableValue = productSubtotal + delivery + branding;

  const gstAmount = useMemo(
    () => (taxableValue * GST_RATE) / 100,
    [taxableValue]
  );

  const finalAmount = taxableValue + gstAmount;

  // ================= HANDLERS =================
  const handleQuantityChange = (productId, value) => {
    setProposalProducts((prev) =>
      prev.map((p) =>
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

    const client = clients.find(
      (c) => c.id === Number(selectedClientId)
    );

    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.text(`Proposal`, 20, y);
    y += 10;

    doc.setFontSize(12);
    doc.text(`Client: ${client.name}`, 20, y);
    y += 10;

    proposalProducts.forEach((p) => {
      doc.text(
        `${p.name} | Qty: ${p.quantity} | ₹${p.unitPrice} | ₹${p.quantity * p.unitPrice}`,
        20,
        y
      );
      y += 7;
    });

    y += 5;
    doc.text(`Product Subtotal: ₹${productSubtotal}`, 20, y);
    y += 7;
    doc.text(`Delivery Charges: ₹${delivery}`, 20, y);
    y += 7;
    doc.text(`Branding Charges: ₹${branding}`, 20, y);
    y += 7;
    doc.text(`Taxable Value: ₹${taxableValue}`, 20, y);
    y += 7;
    doc.text(`GST @ ${GST_RATE}%: ₹${gstAmount}`, 20, y);
    y += 10;

    doc.setFontSize(14);
    doc.text(`Final Amount: ₹${finalAmount}`, 20, y);

    doc.save(`Proposal_${client.name}.pdf`);
  };

  const sendEmail = () => {
    if (!selectedClientId) {
      alert("Please select a client first");
      return;
    }
    const client = clients.find(
      (c) => c.id === Number(selectedClientId)
    );
    alert(`Proposal sent to ${client.email} (mock)`);
  };

  // ================= UI =================
  return (
    <div className="container-xxl container-p-y">
      <h4 className="mb-4">Proposal Management</h4>

      {/* CLIENT */}
      <div className="mb-4">
        <label className="form-label">Select Client</label>
        <select
          className="form-select"
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
        >
          <option value="">-- Select Client --</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* PRODUCTS */}
      <div className="card mb-4">
        <div className="card-header">Products</div>
        <div className="card-body">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Product</th>
                <th>Unit Price (₹)</th>
                <th width="120">Qty</th>
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
                      min="0"
                      className="form-control"
                      value={p.quantity}
                      onChange={(e) =>
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

      {/* EXTRA COSTS */}
      <div className="card mb-4">
        <div className="card-header">Additional Costs</div>
        <div className="card-body row g-3">
          <div className="col-md-6">
            <label className="form-label">Delivery Charges (₹)</label>
            <input
              type="number"
              className="form-control"
              value={delivery}
              onChange={(e) =>
                setDelivery(Number(e.target.value || 0))
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Branding Charges (₹)</label>
            <input
              type="number"
              className="form-control"
              value={branding}
              onChange={(e) =>
                setBranding(Number(e.target.value || 0))
              }
            />
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="card mb-4">
        <div className="card-body">
          <p>Product Subtotal: ₹{productSubtotal}</p>
          <p>Taxable Value: ₹{taxableValue}</p>
          <p>GST @ {GST_RATE}%: ₹{gstAmount}</p>
          <h5 className="mt-2">Final Amount: ₹{finalAmount}</h5>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="d-flex gap-2">
        <button className="btn btn-primary" onClick={generatePDF}>
          Generate Proposal PDF
        </button>
        <button className="btn btn-success" onClick={sendEmail}>
          Send Proposal Email
        </button>
      </div>
    </div>
  );
};

export default ProposalPage;
