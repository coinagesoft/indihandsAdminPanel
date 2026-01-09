"use client";

import React, { useState, useRef } from "react";

const Page = () => {
  /* ===================== CATALOG STATE ===================== */
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

  /* ===================== PRODUCTS STATE ===================== */
  const [products, setProducts] = useState([
    {
      id: 1,
      catalogId: 1,
      name: "Product X",
      category: "Electronics",
      subCategory: "Mobile",
      stock: 120,
      sku: "ELEC-X-001",
      price: 100,
      status: "Available",
    },
    {
      id: 2,
      catalogId: 1,
      name: "Product Y",
      category: "Electronics",
      subCategory: "Laptop",
      stock: 0,
      sku: "ELEC-Y-002",
      price: 200,
      status: "Out of Stock",
    },
    {
      id: 3,
      catalogId: 2,
      name: "Product A",
      category: "Festive",
      subCategory: "Gifts",
      stock: 300,
      sku: "FEST-A-004",
      price: 75,
      status: "Available",
    },
    {
      id: 4,
      catalogId: 3,
      name: "Product C",
      category: "Office Supplies",
      subCategory: "Stationery",
      stock: 15,
      sku: "OFF-C-006",
      price: 55,
      status: "Available",
    },
  ]);

  /* ===================== MODALS ===================== */
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [deleteProduct, setDeleteProduct] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  /* ===================== FILTERS ===================== */
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [subCategory, setSubCategory] = useState("All");
  const [status, setStatus] = useState("All");

  const categories = ["All", ...new Set(products.map((p) => p.category))];
  const subCategories = ["All", ...new Set(products.map((p) => p.subCategory))];

  /* ===================== PAGINATION ===================== */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  /* ===================== FILTER LOGIC ===================== */
  const filteredProducts = products
    .filter((p) => p.catalogId === selectedCatalog.id)
    .filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === "All" || p.category === category;
      const matchSubCategory =
        subCategory === "All" || p.subCategory === subCategory;
      const matchStatus = status === "All" || p.status === status;

      return (
        matchSearch &&
        matchCategory &&
        matchSubCategory &&
        matchStatus
      );
    });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* ===================== HANDLERS ===================== */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewCatalogImage(file);
    setNewCatalogImagePreview(URL.createObjectURL(file));
  };

  const addCatalog = () => {
    if (!newCatalogName.trim()) return;

    const newCatalog = {
      id: catalogs.length + 1,
      name: newCatalogName,
      image: newCatalogImagePreview,
    };

    setCatalogs([...catalogs, newCatalog]);
    setSelectedCatalog(newCatalog);

    setNewCatalogName("");
    setNewCatalogImage(null);
    setNewCatalogImagePreview(null);

    const modal = bootstrap.Modal.getInstance(addCatalogModalRef.current);
    modal.hide();
  };

  const openEditModal = (product) => {
    setSelectedProduct({ ...product });
    setIsEditModalOpen(true);
  };

  const saveChanges = () => {
    setProducts((prev) =>
      prev.map((p) => (p.id === selectedProduct.id ? selectedProduct : p))
    );
    setIsEditModalOpen(false);
  };

  const openDeleteModal = (product) => {
    setDeleteProduct(product);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    setProducts((prev) => prev.filter((p) => p.id !== deleteProduct.id));
    setIsDeleteModalOpen(false);
  };

  const changePage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  /* ===================== UI ===================== */
  return (
    <>
      <div className="container-xxl flex-grow-1 container-p-y">
        {/* ===================== CATALOGS ===================== */}
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between">
            <h5 className="mb-0">Catalogs</h5>
            <button
              className="btn btn-primary btn-sm"
              onClick={() =>
                new bootstrap.Modal(addCatalogModalRef.current).show()
              }
            >
              Add Catalog
            </button>
          </div>

          <div className="card-body">
            <div className="row g-3">
              {catalogs.map((c) => (
                <div key={c.id} className="col-md-3 col-sm-6">
                  <div
                    className={`card h-100 ${
                      selectedCatalog.id === c.id ? "border-primary" : ""
                    }`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedCatalog(c)}
                  >
                    <div className="card-body text-center">
                      {c.image ? (
                        <img
                          src={c.image}
                          alt={c.name}
                          className="img-fluid mb-2"
                          style={{ height: 100, objectFit: "cover" }}
                        />
                      ) : (
                        <div className="bg-light py-4 text-muted">
                          No Image
                        </div>
                      )}
                      <h6 className="mb-0">{c.name}</h6>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===================== PRODUCTS ===================== */}
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">
              Products in "{selectedCatalog.name}"
            </h5>
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
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                >
                  {subCategories.map((sc) => (
                    <option key={sc}>{sc}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option>All</option>
                  <option>Available</option>
                  <option>Out of Stock</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="table table-striped">
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
                    <td colSpan="9" className="text-center py-4">
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
                      <td>₹{p.price}</td>
                      <td>
                        <span
                          className={`badge ${
                            p.status === "Available"
                              ? "bg-success"
                              : "bg-danger"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary me-2"
                          onClick={() => openEditModal(p)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => openDeleteModal(p)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-end gap-2 p-3">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => changePage(currentPage - 1)}
              >
                Prev
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`btn btn-sm ${
                    currentPage === i + 1
                      ? "btn-primary"
                      : "btn-outline-primary"
                  }`}
                  onClick={() => changePage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => changePage(currentPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Page;
