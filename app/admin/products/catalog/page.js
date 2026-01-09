"use client";

import React, { useState, useRef } from "react";

const Page = () => {
  // Catalog state
  const [catalogs, setCatalogs] = useState([
    { id: 1, name: "Electronics Catalog", image: null },
    { id: 2, name: "Festive Catalog", image: null },
    { id: 3, name: "Office Supplies Catalog", image: null },
  ]);
  const [selectedCatalog, setSelectedCatalog] = useState(catalogs[0]);
  const [newCatalogName, setNewCatalogName] = useState("");
  const [newCatalogImage, setNewCatalogImage] = useState(null);
  const [newCatalogImagePreview, setNewCatalogImagePreview] = useState(null);
  const addCatalogModalRef = useRef(null);

  // Products state
  const [products, setProducts] = useState([
    { id: 1, catalogId: 1, name: "Product X", category: "Electronics", subCategory: "Mobile", stock: 120, sku: "ELEC-X-001", price: 100, status: "Available" },
    { id: 2, catalogId: 1, name: "Product Y", category: "Electronics", subCategory: "Laptop", stock: 0, sku: "ELEC-Y-002", price: 200, status: "Out of Stock" },
    { id: 3, catalogId: 2, name: "Product A", category: "Festive", subCategory: "Gifts", stock: 300, sku: "FEST-A-004", price: 75, status: "Available" },
    { id: 4, catalogId: 3, name: "Product C", category: "Office Supplies", subCategory: "Stationery", stock: 15, sku: "OFF-C-006", price: 55, status: "Available" },
  ]);

  // Product modal state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [subCategory, setSubCategory] = useState("All");
  const [status, setStatus] = useState("All");

  const categories = ["All", ...new Set(products.map((p) => p.category))];
  const subCategories = ["All", ...new Set(products.map((p) => p.subCategory))];

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filtered products based on selected catalog and filters
  const filteredProducts = products
    .filter((p) => p.catalogId === selectedCatalog.id)
    .filter((p) => {
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

  // Handlers
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewCatalogImage(file);
      setNewCatalogImagePreview(URL.createObjectURL(file));
    }
  };

  const addCatalog = () => {
    if (!newCatalogName.trim()) return;
    const newCatalog = { id: catalogs.length + 1, name: newCatalogName, image: newCatalogImagePreview };
    setCatalogs([...catalogs, newCatalog]);
    setNewCatalogName("");
    setNewCatalogImage(null);
    setNewCatalogImagePreview(null);
    setSelectedCatalog(newCatalog);
    // Close modal
    const modalEl = bootstrap.Modal.getInstance(addCatalogModalRef.current);
    modalEl.hide();
  };

  const openEditModal = (product) => {
    setSelectedProduct({ ...product });
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => setIsEditModalOpen(false);
  const saveChanges = () => {
    setProducts((prev) =>
      prev.map((p) => (p.id === selectedProduct.id ? selectedProduct : p))
    );
    closeEditModal();
  };

  const openDeleteModal = (product) => {
    setDeleteProduct(product);
    setIsDeleteModalOpen(true);
  };
  const closeDeleteModal = () => setIsDeleteModalOpen(false);
  const confirmDelete = () => {
    setProducts((prev) => prev.filter((p) => p.id !== deleteProduct.id));
    closeDeleteModal();
  };

  const changePage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <>
      <div className="container-xxl flex-grow-1 container-p-y">
        {/* Catalog Section */}
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">Catalogs</h5>
            <button className="btn btn-primary btn-sm" onClick={() => addCatalogModalRef.current && new bootstrap.Modal(addCatalogModalRef.current).show()}>Add Catalog</button>
          </div>
          <div className="card-body">
            <div className="row g-3">
              {catalogs.map((c) => (
                <div key={c.id} className="col-md-3 col-sm-6">
                  <div
                    className={`card h-100 ${selectedCatalog.id === c.id ? "border-primary" : ""}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedCatalog(c)}
                  >
                    <div className="card-body text-center">
                      {c.image ? (
                        <img
                          src={c.image}
                          alt={c.name}
                          className="img-fluid mb-2"
                          style={{ height: "100px", objectFit: "cover", borderRadius: "4px" }}
                        />
                      ) : (
                        <div
                          className="bg-light d-flex align-items-center justify-content-center mb-2"
                          style={{ height: "100px", borderRadius: "4px" }}
                        >
                          <span className="text-muted">No Image</span>
                        </div>
                      )}
                      <h6 className="card-title mb-0">{c.name}</h6>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Section */}
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="card-title mb-0">Products in "{selectedCatalog.name}"</h5>
          </div>

          {/* Filters */}
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-3">
                <input
                  className="form-control"
                  placeholder="Search product or SKU"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <select className="form-select" value={subCategory} onChange={(e) => setSubCategory(e.target.value)}>
                  {subCategories.map((sc) => (
                    <option key={sc} value={sc}>{sc}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="All">All</option>
                  <option value="Available">Available</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Cards */}
          <div className="card-body">
            {paginatedProducts.length === 0 ? (
              <div className="text-center py-4">No products found</div>
            ) : (
              <div className="row g-4">
                {paginatedProducts.map((p) => (
                  <div key={p.id} className="col-12 col-xxl-4 col-md-6">
                    <div className="card h-100">
                      <div className="card-body">
                        <div className="bg-label-primary text-center mb-3 pt-2 rounded-3">
                          <span className="avatar-initial rounded-3 bg-label-primary">
                            <i className="ri-shopping-bag-line ri-24px"></i>
                          </span>
                        </div>
                        <h5 className="mb-1">{p.name}</h5>
                        <p className="mb-3 text-muted">{p.category} - {p.subCategory}</p>
                        <div className="row mb-3 g-2">
                          <div className="col-6">
                            <div className="d-flex align-items-center">
                              <div className="avatar flex-shrink-0 me-2">
                                <span className="avatar-initial rounded-3 bg-label-info">
                                  <i className="ri-hashtag ri-20px"></i>
                                </span>
                              </div>
                              <div>
                                <h6 className="mb-0 text-nowrap fw-normal">{p.sku}</h6>
                                <small>SKU</small>
                              </div>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="d-flex align-items-center">
                              <div className="avatar flex-shrink-0 me-2">
                                <span className="avatar-initial rounded-3 bg-label-warning">
                                  <i className="ri-money-dollar-circle-line ri-20px"></i>
                                </span>
                              </div>
                              <div>
                                <h6 className="mb-0 text-nowrap fw-normal">Rs.{p.price}</h6>
                                <small>Price</small>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="row mb-3 g-2">
                          <div className="col-6">
                            <div className="d-flex align-items-center">
                              <div className="avatar flex-shrink-0 me-2">
                                <span className="avatar-initial rounded-3 bg-label-success">
                                  <i className="ri-archive-line ri-20px"></i>
                                </span>
                              </div>
                              <div>
                                <h6 className="mb-0 text-nowrap fw-normal">{p.stock}</h6>
                                <small>Stock</small>
                              </div>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="d-flex align-items-center">
                              <div className="avatar flex-shrink-0 me-2">
                                <span className={`avatar-initial rounded-3 ${p.status === "Available" ? "bg-label-success" : "bg-label-danger"}`}>
                                  <i className={`ri-${p.status === "Available" ? "check" : "close"}-line ri-20px`}></i>
                                </span>
                              </div>
                              <div>
                                <h6 className="mb-0 text-nowrap fw-normal">{p.status}</h6>
                                <small>Status</small>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="d-flex gap-2">
                          <button className="btn btn-outline-primary flex-fill" onClick={() => openEditModal(p)}><i class="bi bi-pencil-square text-primary"></i></button>
                          <button className="btn btn-outline-danger flex-fill" onClick={() => openDeleteModal(p)}><i class="bi bi-trash text-danger"></i></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-end align-items-center mt-3 gap-2 flex-wrap">
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
        </div>
      </div>

      {/* Edit Product Modal */}
      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeEditModal}>
          <div className="bg-white p-4 rounded shadow w-96" onClick={(e) => e.stopPropagation()}>
            <h5 className="mb-3">Edit Product</h5>
            <div className="d-flex flex-column gap-2">
              <input
                type="text"
                className="form-control"
                value={selectedProduct.name}
                onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
              />
              <select
                className="form-select"
                value={selectedProduct.category}
                onChange={(e) => setSelectedProduct({ ...selectedProduct, category: e.target.value })}
              >
                {categories.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                className="form-select"
                value={selectedProduct.subCategory}
                onChange={(e) => setSelectedProduct({ ...selectedProduct, subCategory: e.target.value })}
              >
                {subCategories.filter(sc => sc !== "All").map(sc => <option key={sc} value={sc}>{sc}</option>)}
              </select>
              <input
                type="number"
                className="form-control"
                value={selectedProduct.stock}
                onChange={(e) => setSelectedProduct({ ...selectedProduct, stock: e.target.value })}
              />
              <input
                type="number"
                className="form-control"
                value={selectedProduct.price}
                onChange={(e) => setSelectedProduct({ ...selectedProduct, price: e.target.value })}
              />
              <select
                className="form-select"
                value={selectedProduct.status}
                onChange={(e) => setSelectedProduct({ ...selectedProduct, status: e.target.value })}
              >
                <option value="Available">Available</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <button className="btn btn-secondary" onClick={closeEditModal}>Cancel</button>
              <button className="btn btn-primary" onClick={saveChanges}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Product Modal */}
      {isDeleteModalOpen && deleteProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeDeleteModal}>
          <div className="bg-white p-4 rounded shadow w-96" onClick={(e) => e.stopPropagation()}>
            <h5 className="mb-3">Delete Product</h5>
            <p>Are you sure you want to delete <strong>{deleteProduct.name}</strong>?</p>
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={closeDeleteModal}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Catalog Modal */}
      <div className="modal fade" ref={addCatalogModalRef} tabIndex="-1" aria-labelledby="addCatalogModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="addCatalogModalLabel">Add New Catalog</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="d-flex flex-column gap-3">
                <div>
                  <label className="form-label">Catalog Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter catalog name"
                    value={newCatalogName}
                    onChange={(e) => setNewCatalogName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Catalog Image</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {newCatalogImagePreview && (
                    <img
                      src={newCatalogImagePreview}
                      alt="Preview"
                      style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "4px", marginTop: "10px" }}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" className="btn btn-primary" onClick={addCatalog}>Add Catalog</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
