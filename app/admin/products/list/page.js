"use client";

import React, { useState } from "react";

const Page = () => {
  const [products, setProducts] = useState([
    { id: 1, name: "Product X", category: "Electronics", subCategory: "Mobile", stock: 120, sku: "ELEC-X-001", price: 100, status: "Available", catalogs: [] },
    { id: 2, name: "Product Y", category: "Electronics", subCategory: "Laptop", stock: 0, sku: "ELEC-Y-002", price: 200, status: "Out of Stock", catalogs: [] },
    { id: 3, name: "Product Z", category: "Eco-friendly", subCategory: "Reusable Bags", stock: 50, sku: "ECO-Z-003", price: 50, status: "Available", catalogs: [] },
    { id: 4, name: "Product A", category: "Festive", subCategory: "Gifts", stock: 300, sku: "FEST-A-004", price: 75, status: "Available", catalogs: [] },
    { id: 5, name: "Product B", category: "Festive", subCategory: "Decor", stock: 20, sku: "FEST-B-005", price: 85, status: "Available", catalogs: [] },
    { id: 6, name: "Product C", category: "Office Supplies", subCategory: "Stationery", stock: 15, sku: "OFF-C-006", price: 55, status: "Available", catalogs: [] },
    { id: 7, name: "Product D", category: "Electronics", subCategory: "Headphones", stock: 60, sku: "ELEC-D-007", price: 120, status: "Available", catalogs: [] },
    { id: 8, name: "Product E", category: "Office Supplies", subCategory: "Chairs", stock: 0, sku: "OFF-E-008", price: 500, status: "Out of Stock", catalogs: [] },
    { id: 9, name: "Product F", category: "Eco-friendly", subCategory: "Water Bottles", stock: 90, sku: "ECO-F-009", price: 30, status: "Available", catalogs: [] },
    { id: 10, name: "Product G", category: "Festive", subCategory: "Candles", stock: 50, sku: "FEST-G-010", price: 40, status: "Available", catalogs: [] },
  ]);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [subCategory, setSubCategory] = useState("All");
  const [status, setStatus] = useState("All");

  const categories = ["All", ...new Set(products.map((p) => p.category))];
  const subCategories = ["All", ...new Set(products.map((p) => p.subCategory))];

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "All" || p.category === category;
    const matchSubCategory = subCategory === "All" || p.subCategory === subCategory;
    const matchStatus = status === "All" || p.status === status;
    return matchSearch && matchCategory && matchSubCategory && matchStatus;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- Existing Edit Handlers ---
  const openEditModal = (product) => {
    setSelectedProduct({ ...product });
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setSelectedProduct(null);
    setIsEditModalOpen(false);
  };
  const saveChanges = () => {
    setProducts((prev) =>
      prev.map((p) => (p.id === selectedProduct.id ? selectedProduct : p))
    );
    closeEditModal();
  };

  // --- Existing Delete Handlers ---
  const openDeleteModal = (product) => {
    setDeleteProduct(product);
    setIsDeleteModalOpen(true);
  };
  const closeDeleteModal = () => {
    setDeleteProduct(null);
    setIsDeleteModalOpen(false);
  };
  const confirmDelete = () => {
    setProducts((prev) => prev.filter((p) => p.id !== deleteProduct.id));
    closeDeleteModal();
  };

  // --- Assign to Catalog ---
  const [catalogs, setCatalogs] = useState([
    { id: 1, name: "Electronics Catalog" },
    { id: 2, name: "Festive Catalog" },
    { id: 3, name: "Eco-friendly Catalog" },
  ]);
  const [newCatalogName, setNewCatalogName] = useState("");

  const openAssignModal = (product) => {
    setSelectedProduct({ ...product });
    setIsAssignModalOpen(true);
    setNewCatalogName("");
  };
  const closeAssignModal = () => {
    setSelectedProduct(null);
    setIsAssignModalOpen(false);
    setNewCatalogName("");
  };
  const toggleCatalogSelection = (catalogId) => {
    setSelectedProduct((prev) => {
      const isAssigned = prev.catalogs.includes(catalogId);
      return {
        ...prev,
        catalogs: isAssigned
          ? prev.catalogs.filter((id) => id !== catalogId)
          : [...prev.catalogs, catalogId],
      };
    });
  };
  const saveCatalogAssignment = () => {
    setProducts((prev) =>
      prev.map((p) => (p.id === selectedProduct.id ? selectedProduct : p))
    );
    closeAssignModal();
  };
  const createNewCatalog = () => {
    if (!newCatalogName.trim()) return;
    const newCatalog = { id: Date.now(), name: newCatalogName };
    setCatalogs((prev) => [...prev, newCatalog]);
    setSelectedProduct((prev) => ({ ...prev, catalogs: [...prev.catalogs, newCatalog.id] }));
    setNewCatalogName("");
  };

  const changePage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Search</label>
              <input
                className="form-control"
                placeholder="Product name or SKU"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Subcategory</label>
              <select
                className="form-select"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
              >
                {subCategories.map((sc) => (
                  <option key={sc} value={sc}>{sc}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
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

      {/* Products Table */}
      <div className="card position-relative">
        <div className="card-header">
          <h5 className="card-title mb-0">Products</h5>
        </div>
        <div className="card-datatable table-responsive" style={{ overflowX: "auto" }}>
          <table className="table table-striped table-hover mb-0 text-nowrap">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product</th>
                <th>Category</th>
                <th>Subcategory</th>
                <th>Stock</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center text-muted py-4">
                    No products found
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>{p.subCategory}</td>
                    <td>{p.stock}</td>
                    <td>{p.sku}</td>
                    <td>Rs.{p.price}</td>
                    <td>
                      <span className={`badge ${p.status === "Available" ? "bg-success" : "bg-danger"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="d-flex gap-2 justify-content-center ">
                        <button className="btn btn-sm btn-orange " onClick={() => openEditModal(p)}><i className="bi bi-pencil-square "></i></button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => openDeleteModal(p)}><i className="bi bi-trash text-danger"></i></button>
                        <button className="btn btn-sm btn-outline-success" onClick={() => openAssignModal(p)}><i className="bi bi-box-arrow-in-down-right text-success"></i> </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center align-items-center mt-3 mb-2 gap-2 flex-wrap pagination-custom">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => changePage(currentPage - 1)}>Prev</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`btn btn-sm ${currentPage === i + 1 ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => changePage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button className="btn btn-outline-secondary btn-sm" onClick={() => changePage(currentPage + 1)}>Next</button>
          </div>
        )}

        {/* --- Assign to Catalog Modal --- */}
        {isAssignModalOpen && selectedProduct && (
          <div
            className="position-absolute top-50 start-50 translate-middle bg-white p-4 rounded shadow"
            style={{ maxWidth: "400px", zIndex: 20 }}
          >
            <h5 className="mb-3">Assign Product to Catalog</h5>

            {/* Existing Catalogs */}
            <div className="d-flex flex-column gap-2">
              {catalogs.map((cat) => (
                <div key={cat.id} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={selectedProduct.catalogs.includes(cat.id)}
                    onChange={() => toggleCatalogSelection(cat.id)}
                    id={`cat-${cat.id}`}
                  />
                  <label className="form-check-label" htmlFor={`cat-${cat.id}`}>
                    {cat.name}
                  </label>
                </div>
              ))}
            </div>

            {/* Add New Catalog */}
            <div className="mt-3 d-flex gap-2">
              <input
                type="text"
                className="form-control"
                placeholder="New catalog name"
                value={newCatalogName}
                onChange={(e) => setNewCatalogName(e.target.value)}
              />
              <button className="btn btn-outline-primary" onClick={createNewCatalog}>Add</button>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-3">
              <button className="btn btn-secondary" onClick={closeAssignModal}>Cancel</button>
              <button className="btn btn-success" onClick={saveCatalogAssignment}>Save</button>
            </div>
          </div>
        )}

{/* --- Edit Product Modal --- */}
{isEditModalOpen && selectedProduct && (
  <>
    {/* Backdrop */}
    <div
      className="modal-backdrop fade show"
      style={{ zIndex: 10 }}
    ></div>

    {/* Modal */}
    <div
      className="modal d-block"
      tabIndex="-1"
      style={{ zIndex: 20 }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Product</h5>
            <button
              type="button"
              className="btn-close"
              onClick={closeEditModal}
            ></button>
          </div>

          <div className="modal-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Product Name</label>
                <input
                  className="form-control"
                  value={selectedProduct.name}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Category</label>
                <input
                  className="form-control"
                  value={selectedProduct.category}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      category: e.target.value,
                    })
                  }
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Subcategory</label>
                <input
                  className="form-control"
                  value={selectedProduct.subCategory}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      subCategory: e.target.value,
                    })
                  }
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">SKU</label>
                <input
                  className="form-control"
                  value={selectedProduct.sku}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      sku: e.target.value,
                    })
                  }
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Stock</label>
                <input
                  type="number"
                  className="form-control"
                  value={selectedProduct.stock}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      stock: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Price</label>
                <input
                  type="number"
                  className="form-control"
                  value={selectedProduct.price}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      price: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={selectedProduct.status}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="Available">Available</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={closeEditModal}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={saveChanges}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
)}

      </div>
    </div>
  );
};

export default Page;
