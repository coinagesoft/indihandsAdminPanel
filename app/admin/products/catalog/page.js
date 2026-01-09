"use client";

import React, { useState } from "react";

const Page = () => {
  /* ===================== CATALOG STATE ===================== */
  const [catalogs, setCatalogs] = useState([
    { id: 1, name: "indihands_Stationary", desc: "", image: "/materialize/assets/img/backgrounds/Price-Range-1000-to-2000-INR.png" },
    { id: 2, name: "indihands-art-n-craft_Price range up to 1000 INR", desc: "", image: "/materialize/assets/img/backgrounds/Price-Range-up-to-1000-INR.png" },
    { id: 3, name: "indihands-art-n-craft_Price range 1000 to 2000 INR", desc: "", image: "/materialize/assets/img/backgrounds/The-Stationary-Catalogue.png" },
  ]);
  const [selectedCatalog, setSelectedCatalog] = useState(catalogs[0]);

  /* ===================== CATALOG MODAL STATE ===================== */
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [editingCatalog, setEditingCatalog] = useState(null);
  const [catalogName, setCatalogName] = useState("");
  const [catalogDesc, setCatalogDesc] = useState("");
  const [catalogImagePreview, setCatalogImagePreview] = useState(null);

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
      catalogId: null,
      name: "Product A",
      category: "Festive",
      subCategory: "Gifts",
      stock: 50,
      sku: "FEST-A-001",
      price: 75,
      status: "Available",
    },
    {
      id: 4,
      catalogId: null,
      name: "Product B",
      category: "Office Supplies",
      subCategory: "Stationery",
      stock: 20,
      sku: "OFF-B-002",
      price: 40,
      status: "Available",
    },
  ]);

  /* ===================== ADD EXISTING PRODUCT TO CATALOG MODAL ===================== */
  const [isAddExistingModalOpen, setIsAddExistingModalOpen] = useState(false);
  const [selectedProductsToAdd, setSelectedProductsToAdd] = useState([]);

  /* ===================== HANDLERS ===================== */
  const openEditCatalogModal = (catalog) => {
    setEditingCatalog(catalog);
    setCatalogName(catalog.name);
    setCatalogDesc(catalog.desc || "");
    setCatalogImagePreview(catalog.image || null);
    setIsCatalogModalOpen(true);
  };

  const handleCatalogImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCatalogImagePreview(URL.createObjectURL(file));
  };

  const saveCatalog = () => {
    if (!catalogName.trim()) return;

    if (editingCatalog) {
      setCatalogs((prev) =>
        prev.map((c) =>
          c.id === editingCatalog.id
            ? { ...c, name: catalogName, desc: catalogDesc, image: catalogImagePreview }
            : c
        )
      );
      if (selectedCatalog.id === editingCatalog.id) {
        setSelectedCatalog({ ...editingCatalog, name: catalogName, desc: catalogDesc, image: catalogImagePreview });
      }
    }
    setIsCatalogModalOpen(false);
  };

  /* ===================== ADD EXISTING PRODUCTS ===================== */
  const openAddExistingProductsModal = () => {
    setSelectedProductsToAdd([]);
    setIsAddExistingModalOpen(true);
  };

  const toggleProductSelection = (id) => {
    setSelectedProductsToAdd((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const addSelectedProductsToCatalog = () => {
    setProducts((prev) =>
      prev.map((p) =>
        selectedProductsToAdd.includes(p.id) ? { ...p, catalogId: selectedCatalog.id } : p
      )
    );
    setIsAddExistingModalOpen(false);
  };

  const removeProductFromCatalog = (id) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, catalogId: null } : p))
    );
  };

  /* ===================== UI ===================== */
  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      {/* ===================== CATALOGS ===================== */}
   <div className="card mb-4">
  <div className="card-header d-flex justify-content-between align-items-center">
    <h5 className="mb-0">Catalogs</h5>
    <button
      className="btn btn-orange btn-sm"
      onClick={() => {
        setEditingCatalog(null);
        setCatalogName("");
        setCatalogDesc("");
        setCatalogImagePreview(null);
        setIsCatalogModalOpen(true);
      }}
    >
      Add Catalog
    </button>
  </div>

  <div className="card-body">
    <div className="row g-3">
      {catalogs.map((c) => (
        <div key={c.id} className="col-md-3 col-sm-6">
          <div
            className={`card h-100 catalog-card ${
              selectedCatalog.id === c.id ? "active" : ""
            }`}
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
                <div className="bg-light py-4 text-muted">No Image</div>
              )}
              <h6 className="mb-0">{c.name}</h6>
              <small className="text-muted">{c.desc}</small>
            </div>

            <div className="card-footer text-center">
              <button
                className="btn btn-sm btn-outline-orange"
                onClick={(e) => {
                  e.stopPropagation(); 
                  openEditCatalogModal(c);
                }}
              >
                Edit Catalog
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>


      {/* ===================== PRODUCTS IN CATALOG ===================== */}
      <div className="card">
        <div className="card-header d-flex justify-content-between">
          <h5 className="mb-0">Products in "{selectedCatalog.name}"</h5>
          <button className="btn btn-orange btn-sm" onClick={openAddExistingProductsModal}>Add Product to Catalog</button>
        </div>
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
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.filter(p => p.catalogId === selectedCatalog.id).map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{p.subCategory}</td>
                  <td>{p.stock}</td>
                  <td>{p.sku}</td>
                  <td>₹{p.price}</td>
                  <td>
                    <span className={`badge ${p.status === "Available" ? "bg-success" : "bg-danger"}`}>{p.status}</span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => removeProductFromCatalog(p.id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================== ADD EXISTING PRODUCT MODAL ===================== */}
      {isAddExistingModalOpen && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal d-block" tabIndex="-1">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add Existing Products to "{selectedCatalog.name}"</h5>
                  <button className="btn-close" onClick={() => setIsAddExistingModalOpen(false)}></button>
                </div>
                <div className="modal-body table-responsive">
                  <table className="table table-striped table-hover mb-0">
                    {/* Force column widths */}
                    <colgroup>
                      <col style={{ width: "50px" }} />   {/* Select */}
                      <col style={{ width: "200px" }} />  {/* Product */}
                      <col style={{ width: "150px" }} />  {/* Category */}
                      <col style={{ width: "150px" }} />  {/* Subcategory */}
                      <col style={{ width: "80px" }} />   {/* Stock */}
                      <col style={{ width: "200px" }} />  {/* SKU */}
                      <col style={{ width: "100px" }} />  {/* Price */}
                    </colgroup>
                    <thead>
                      <tr>
                        <th>Select</th>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Subcategory</th>
                        <th>Stock</th>
                        <th>SKU</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products
                        .filter((p) => p.catalogId !== selectedCatalog.id)
                        .map((p) => (
                          <tr key={p.id}>
                            <td>
                              <input
                                type="checkbox"
                                checked={selectedProductsToAdd.includes(p.id)}
                                onChange={() => toggleProductSelection(p.id)}
                              />
                            </td>
                            <td className="text-truncate" style={{ maxWidth: "200px" }}>{p.name}</td>
                            <td className="text-truncate" style={{ maxWidth: "150px" }}>{p.category}</td>
                            <td className="text-truncate" style={{ maxWidth: "150px" }}>{p.subCategory}</td>
                            <td>{p.stock}</td>
                            <td
                              style={{
                                maxWidth: "200px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {p.sku}
                            </td>

                            <td>₹{p.price}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setIsAddExistingModalOpen(false)}>Cancel</button>
                  <button className="btn btn-orange" onClick={addSelectedProductsToCatalog}>Add Selected</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}


      {/* ===================== EDIT CATALOG MODAL ===================== */}
      {isCatalogModalOpen && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{editingCatalog ? "Edit Catalog" : "Add Catalog"}</h5>
                  <button className="btn-close" onClick={() => setIsCatalogModalOpen(false)}></button>
                </div>
                <div className="modal-body">
                  <input className="form-control mb-2" placeholder="Catalog Name" value={catalogName} onChange={(e) => setCatalogName(e.target.value)} />
                  <textarea className="form-control mb-2" placeholder="Description" value={catalogDesc} onChange={(e) => setCatalogDesc(e.target.value)} />
                  <input type="file" className="form-control mb-2" accept="image/*" onChange={handleCatalogImageChange} />
                  {catalogImagePreview && <img src={catalogImagePreview} alt="Preview" className="img-fluid mt-2" style={{ height: 100, objectFit: "cover" }} />}
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setIsCatalogModalOpen(false)}>Cancel</button>
                  <button className="btn btn-orange" onClick={saveCatalog}>Save</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Page;
