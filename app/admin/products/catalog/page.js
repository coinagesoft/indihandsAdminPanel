"use client";

import React, { useState } from "react";

const Page = () => {
  // Catalog state
  const [catalogs, setCatalogs] = useState([
    { id: 1, name: "Electronics Catalog" },
    { id: 2, name: "Festive Catalog" },
    { id: 3, name: "Office Supplies Catalog" },
  ]);
  const [selectedCatalog, setSelectedCatalog] = useState(catalogs[0]);
  const [newCatalogName, setNewCatalogName] = useState("");

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
  const addCatalog = () => {
    if (!newCatalogName.trim()) return;
    const newCatalog = { id: catalogs.length + 1, name: newCatalogName };
    setCatalogs([...catalogs, newCatalog]);
    setNewCatalogName("");
    setSelectedCatalog(newCatalog);
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
    <div className="container-xxl flex-grow-1 container-p-y">
{/* Catalog Section */}
<div className="card mb-4">
  <div className="card-header">
    <h5 className="card-title mb-0">Indihands Catalog</h5>
  </div>

  <div className="card-body">
    {/* New Catalog Form */}
    <div className="d-flex gap-2 mb-4 flex-wrap">
      <input
        className="form-control form-control-sm"
        placeholder="New catalog name"
        value={newCatalogName}
        onChange={(e) => setNewCatalogName(e.target.value)}
        style={{ maxWidth: "200px" }}
      />
      <input
        className="form-control form-control-sm"
        placeholder="Featured image file name"
        value={selectedCatalog?.featuredImage || ""}
        onChange={(e) => {
          if (!selectedCatalog) return;
          setSelectedCatalog({ ...selectedCatalog, featuredImage: e.target.value });
          setCatalogs(catalogs.map(c => c.id === selectedCatalog.id ? { ...c, featuredImage: e.target.value } : c));
        }}
        style={{ maxWidth: "300px" }}
      />
      <button className="btn btn-primary btn-sm" onClick={addCatalog}>Add Catalog</button>
    </div>

    {/* Catalog Cards */}
    <div className="d-flex flex-wrap gap-3">
      {catalogs.map((c) => (
        <div
          key={c.id}
          className="card shadow-sm"
          style={{ width: "250px", cursor: "pointer", position: "relative" }}
          onClick={() => setSelectedCatalog(c)}
        >
          {c.featuredImage && (
            <img
              src={process.env.PUBLIC_URL + "/catalog-images/" + c.featuredImage}
              alt={c.name}
              className="card-img-top"
              style={{ height: "150px", objectFit: "cover", borderTopLeftRadius: "4px", borderTopRightRadius: "4px" }}
            />
          )}
          <div className="card-body p-2">
            <h6 className="card-title text-truncate">{c.name}</h6>
            <p className="mb-1 text-muted" style={{ fontSize: "12px" }}>ART & CRAFT BY IndiHANDS</p>
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

        {/* Product Table */}
        <div className="card-datatable table-responsive">
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
                  <td colSpan="9" className="text-center py-4">No products found</td>
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
                      <span className={`badge ${p.status === "Available" ? "bg-success" : "bg-danger"}`}>{p.status}</span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        {/* <button className="btn btn-sm btn-primary" onClick={() => openEditModal(p)}>Edit</button> */}
                        <button className="btn btn-sm btn-danger" onClick={() => openDeleteModal(p)}>Delete</button>
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
    </div>
  );
};

export default Page;
