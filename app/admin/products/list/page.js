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

  // Filter states
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");

  const categories = ["All", ...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "All" || p.category === category;
    const matchStatus = status === "All" || p.status === status;
    return matchSearch && matchCategory && matchStatus;
  });

  const openModal = (product) => {
    // Convert numbers to strings for safe typing
    setSelectedProduct({
      ...product,
      stock: product.stock.toString(),
      qty: product.qty.toString(),
      price: product.price.toString(),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  const saveChanges = () => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === selectedProduct.id
          ? {
              ...selectedProduct,
              stock: Number(selectedProduct.stock),
              qty: Number(selectedProduct.qty),
              price: Number(selectedProduct.price),
            }
          : p
      )
    );
    closeModal();
  };

  const updateQty = (productId, value) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, qty: Number(value) } : p))
    );
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
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
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
                   
                    <td>
                      <span
                        className={`badge ${
                          p.status === "Available" ? "bg-success" : "bg-danger"
                        }`}
                      >
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

      {/* ================= EDIT MODAL ================= */}
      {isModalOpen && selectedProduct && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeModal} // click outside closes
        >
          <div
            className="bg-white p-6 rounded shadow-lg w-96"
            onClick={(e) => e.stopPropagation()} // prevent closing on modal click
          >
            <h5 className="text-xl font-bold mb-4">
              Edit Product - {selectedProduct.name}
            </h5>

        <div className="flex flex-col gap-3">
  <div>
    <label className="form-label">Name</label>
    <input
      type="text"
      className="form-control"
      value={selectedProduct.name}
      onChange={(e) =>
        setSelectedProduct({ ...selectedProduct, name: e.target.value })
      }
    />
  </div>

  <div>
    <label className="form-label">Price</label>
    <input
      type="number"
      className="form-control"
      value={selectedProduct.price}
      onChange={(e) =>
        setSelectedProduct({ ...selectedProduct, price: e.target.value })
      }
    />
  </div>

  <div>
    <label className="form-label">Stock</label>
    <input
      type="number"
      className="form-control"
      value={selectedProduct.stock}
      onChange={(e) =>
        setSelectedProduct({ ...selectedProduct, stock: e.target.value })
      }
    />
  </div>

  <div>
    <label className="form-label">Status</label>
    <select
      className="form-select"
      value={selectedProduct.status}
      onChange={(e) =>
        setSelectedProduct({ ...selectedProduct, status: e.target.value })
      }
    >
      <option value="Available">Available</option>
      <option value="Out of Stock">Out of Stock</option>
    </select>
  </div>
</div>


            <div className="flex justify-end gap-2 mt-4">
              <button className="btn btn-secondary me-4" onClick={closeModal}>
                Close
              </button>
              <button className="btn btn-primary" onClick={saveChanges}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
