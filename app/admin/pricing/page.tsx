"use client";
import React, { useState } from "react";

interface Client {
  id: number;
  name: string;
  gst: string;
  primaryContact: string;
  email: string;
  phone: string;
  shippingAddresses: string[];
}

interface Product {
  id: number;
  name: string;
  basePrice: number;
}

interface Pricing {
  clientId: number;
  productId: number;
  price: number;
}

const ClientPricingPage: React.FC = () => {
  const [clients] = useState<Client[]>([
    {
      id: 1,
      name: "Client A",
      gst: "27ABCDE1234F1Z5",
      primaryContact: "John Doe",
      email: "john@acme.com",
      phone: "+911234567890",
      shippingAddresses: ["123 Main St, City A", "456 Side Rd, City B"],
    },
    {
      id: 2,
      name: "Client B",
      gst: "27XYZDE6789G1Z2",
      primaryContact: "Jane Smith",
      email: "jane@xyz.com",
      phone: "+919876543210",
      shippingAddresses: ["789 Market St, City C"],
    },
  ]);

  const [products] = useState<Product[]>([
    { id: 1, name: "Product X", basePrice: 100 },
    { id: 2, name: "Product Y", basePrice: 200 },
  ]);

  const [pricing, setPricing] = useState<Pricing[]>([
    { clientId: 1, productId: 1, price: 90 },
    { clientId: 2, productId: 1, price: 95 },
  ]);

  // Filters
  const [selectedClient, setSelectedClient] = useState<number | "all">("all");
  const [selectedProduct, setSelectedProduct] = useState<number | "all">("all");

  // Update client-specific price
  const handlePriceChange = (clientId: number, productId: number, value: string) => {
    const priceNumber = Number(value);
    setPricing((prev) => {
      const existing = prev.find(p => p.clientId === clientId && p.productId === productId);
      if (existing) {
        return prev.map(p =>
          p.clientId === clientId && p.productId === productId
            ? { ...p, price: priceNumber }
            : p
        );
      } else {
        return [...prev, { clientId, productId, price: priceNumber }];
      }
    });
  };

  const getClientPrice = (clientId: number, productId: number): number | "" => {
    const entry = pricing.find(p => p.clientId === clientId && p.productId === productId);
    return entry ? entry.price : "";
  };

  const handleSaveAll = () => {
    console.log("Saved Pricing Data:", pricing);
  };

  // Filter clients based on selection
  const filteredClients =
    selectedClient === "all"
      ? clients
      : clients.filter((c) => c.id === selectedClient);

  // Filter products based on selection
  const filteredProducts =
    selectedProduct === "all"
      ? products
      : products.filter((p) => p.id === selectedProduct);

  return (
    <div className="container-xxl flex-grow-1 container-p-y">

      {/* Header & Filters */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <h4>Client-Specific Pricing Management</h4>
        <button className="btn btn-primary" onClick={handleSaveAll}>
          Save All Changes
        </button>
      </div>

      <div className="row mb-4 g-3">
        <div className="col-md-6">
          <label className="form-label">Filter by Client</label>
          <select
            className="form-select"
            value={selectedClient}
            onChange={(e) =>
              setSelectedClient(e.target.value === "all" ? "all" : Number(e.target.value))
            }
          >
            <option value="all">All Clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">Filter by Product</label>
          <select
            className="form-select"
            value={selectedProduct}
            onChange={(e) =>
              setSelectedProduct(e.target.value === "all" ? "all" : Number(e.target.value))
            }
          >
            <option value="all">All Products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Client Cards */}
      {filteredClients.map((client) => (
        <div key={client.id} className="card mb-4 shadow-sm">
          <div className="card-header bg-label-primary text-white">
            <h5 className="mb-0">{client.name}</h5>
          </div>
          <div className="card-body">

            {/* Client Details */}
            <div className="mb-3 row">
              <div className="col-md-4"><strong>GST:</strong> {client.gst}</div>
              <div className="col-md-4"><strong>Primary Contact:</strong> {client.primaryContact}</div>
              <div className="col-md-4"><strong>Email:</strong> {client.email}</div>
              <div className="col-md-4 mt-2"><strong>Phone:</strong> {client.phone}</div>
              <div className="col-md-8 mt-2">
                <strong>Shipping Addresses:</strong>
                <ul className="mb-0 ps-3">
                  {client.shippingAddresses.map((addr, idx) => (
                    <li key={idx}>{addr}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Pricing Table */}
            <table className="table table-striped table-bordered">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Base Price</th>
                  <th>Client Price</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>₹{product.basePrice}</td>
                    <td>
                      <div className="form-floating form-floating-outline mb-2">
                        <input
                          type="number"
                          className="form-control"
                          min={0}
                          value={getClientPrice(client.id, product.id) || ""}
                          onChange={(e) =>
                            handlePriceChange(client.id, product.id, e.target.value)
                          }
                        />
                        <label className="active">Price</label>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-end mt-2">
              <button
                type="button"
                className="btn btn-success"
                onClick={() => console.log(`Saved pricing for client ${client.id}`)}
              >
                Save Client Prices
              </button>
            </div>

          </div>
        </div>
      ))}

    </div>
  );
};

export default ClientPricingPage;
