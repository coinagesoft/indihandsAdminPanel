"use client";
import React, { useState } from "react";

const Page = () => {

  const [products, setProducts] = useState([
    { id: 1, name: "Product X", category: "Electronics", stock: 120, sku: "ELEC-X-001", price: 100, qty: 0, status: "Available" },
    { id: 2, name: "Product Y", category: "Electronics", stock: 0, sku: "ELEC-Y-002", price: 200, qty: 0, status: "Out of Stock" },
    { id: 3, name: "Product Z", category: "Eco-friendly", stock: 50, sku: "ECO-Z-003", price: 50, qty: 0, status: "Available" },
    { id: 4, name: "Product A", category: "Festive", stock: 300, sku: "FEST-A-004", price: 75, qty: 0, status: "Available" },
  ]);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🔹 Filter states
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");

  const categories = ["All", ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());

    const matchCategory = category === "All" || p.category === category;
    const matchStatus = status === "All" || p.status === status;

    return matchSearch && matchCategory && matchStatus;
  });

  const openModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  return (
    <div className="container-xxl flex-grow-1 container-p-y">

      {/* ================= FILTERS ================= */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Search</label>
              <input
                className="form-control"
                placeholder="Product name or SKU"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Available">Available</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-4">Products</h5>
        </div>

        <div className="card-datatable table-responsive">
          <table className="table table-striped table-hover mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product</th>
                <th>Category</th>
                <th>Stock</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center text-muted py-4">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>{p.stock}</td>
                    <td>{p.sku}</td>
                    <td>${p.price}</td>
                    <td>{p.qty}</td>
                    <td>
                      <span className={`badge ${p.status === "Available" ? "bg-label-success" : "bg-label-danger"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => openModal(p)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {isModalOpen && selectedProduct && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Product - {selectedProduct.name}</h5>
                <button className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <p><strong>SKU:</strong> {selectedProduct.sku}</p>
                <p><strong>Category:</strong> {selectedProduct.category}</p>
                <p><strong>Stock:</strong> {selectedProduct.stock}</p>
                <p><strong>Price:</strong> ${selectedProduct.price}</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>Close</button>
                <button className="btn btn-primary">Save Changes</button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </div>
      )}
    </div>
  );
};

export default Page;
