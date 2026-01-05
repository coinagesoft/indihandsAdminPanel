"use client";
import React, { useState } from "react";

const ClientPricingPage = () => {
  const [clients] = useState([
    {
      id: 1,
      name: "Client A",
      gst: "27ABCDE1234F1Z5",
      primaryContact: "John Doe",
      email: "john@acme.com",
      phone: "+911234567890",
    },
    {
      id: 2,
      name: "Client B",
      gst: "27XYZDE6789G1Z2",
      primaryContact: "Jane Smith",
      email: "jane@xyz.com",
      phone: "+919876543210",
    },
  ]);

  const [products] = useState([
    { id: 1, name: "Product X", basePrice: 100 },
    { id: 2, name: "Product Y", basePrice: 200 },
  ]);

  const [pricing, setPricing] = useState([
    { clientId: 1, productId: 1, price: 90 },
    { clientId: 2, productId: 1, price: 95 },
  ]);

  const [selectedClient, setSelectedClient] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState("all");

  const handlePriceChange = (clientId, productId, value) => {
    const price = Number(value);
    setPricing(prev => {
      const existing = prev.find(
        p => p.clientId === clientId && p.productId === productId
      );
      return existing
        ? prev.map(p =>
            p.clientId === clientId && p.productId === productId
              ? { ...p, price }
              : p
          )
        : [...prev, { clientId, productId, price }];
    });
  };

  const getClientPrice = (clientId, productId) => {
    const entry = pricing.find(
      p => p.clientId === clientId && p.productId === productId
    );
    return entry ? entry.price : "";
  };

  const isPriceOverridden = (clientId, productId, basePrice) => {
    const price = getClientPrice(clientId, productId);
    return price !== "" && price !== basePrice;
  };

  const handleSaveClientPricing = (clientId) => {
    const clientPricing = pricing.filter(p => p.clientId === clientId);

    console.log("Saving pricing for client:", clientId, clientPricing);

    // 🔌 API READY
    // await api.post(`/admin/client-pricing/${clientId}`, clientPricing);

    alert("Client pricing saved successfully");
  };

  const filteredClients =
    selectedClient === "all"
      ? clients
      : clients.filter(c => c.id === Number(selectedClient));

  const filteredProducts =
    selectedProduct === "all"
      ? products
      : products.filter(p => p.id === Number(selectedProduct));

  return (
    <div className="container-xxl container-p-y">
      <h4 className="mb-4 text-primary">Client-Specific Pricing</h4>

      {/* Filters */}
      <div className="row mb-4 g-3">
        <div className="col-md-6">
          <label className="form-label">Client</label>
          <select
            className="form-select"
            value={selectedClient}
            onChange={e => setSelectedClient(e.target.value)}
          >
            <option value="all">All Clients</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Product</label>
          <select
            className="form-select"
            value={selectedProduct}
            onChange={e => setSelectedProduct(e.target.value)}
          >
            <option value="all">All Products</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Pricing Cards */}
      {filteredClients.map(client => (
        <div key={client.id} className="card mb-4">
          <div className="card-header bg-label-primary d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">{client.name}</h5>
              <small className="text-muted">GST: {client.gst}</small>
            </div>

            <button
              className="btn btn-sm btn-primary"
              onClick={() => handleSaveClientPricing(client.id)}
            >
              Save Pricing
            </button>
          </div>

          <div className="card-body">
            {filteredProducts.length === 0 ? (
              <p className="text-muted">No products available.</p>
            ) : (
              <table className="table table-bordered align-middle">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Base Price</th>
                    <th>Client Price</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => {
                    const overridden = isPriceOverridden(
                      client.id,
                      product.id,
                      product.basePrice
                    );

                    return (
                      <tr key={product.id}>
                        <td>{product.name}</td>
                        <td>₹{product.basePrice}</td>
                        <td>
                          <input
                            type="number"
                            className={`form-control ${
                              overridden ? "border-primary" : ""
                            }`}
                            placeholder="Enter client price"
                            value={getClientPrice(client.id, product.id)}
                            onChange={e =>
                              handlePriceChange(
                                client.id,
                                product.id,
                                e.target.value
                              )
                            }
                          />
                          {overridden && (
                            <small className="text-primary">
                              Custom price applied
                            </small>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClientPricingPage;
