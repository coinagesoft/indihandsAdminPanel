"use client";

import React, { useState, useEffect } from "react";
import ProtectedRoute from '../../../../components/ProtectedRoute'
import ConfirmDialog from "../../../../components/ConfirmDialog";
import { showSuccess, showError } from "../../../../lib/toast";
import { useFetchWithLoader } from "../../../../lib/fetchWithLoader";

const Page = () => {
  const [catalogs, setCatalogs] = useState([]);
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const fetchWithLoader = useFetchWithLoader();

  /* ===================== CATALOG MODAL STATE ===================== */
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [editingCatalog, setEditingCatalog] = useState(null);
  const [catalogName, setCatalogName] = useState("");
  const [catalogDesc, setCatalogDesc] = useState("");
  const [catalogImagePreview, setCatalogImagePreview] = useState(null);
  const [catPage, setCatPage] = useState(1);
  const catItemsPerPage = 5;

  const [allProducts, setAllProducts] = useState([]);          // modal
  const [catalogProducts, setCatalogProducts] = useState([]);  // table 

  /* ===================== PRODUCTS STATE ===================== */
  const [products, setProducts] = useState([]);

  /* ===================== ADD EXISTING PRODUCT TO CATALOG MODAL ===================== */
  const [isAddExistingModalOpen, setIsAddExistingModalOpen] = useState(false);
  const [selectedProductsToAdd, setSelectedProductsToAdd] = useState([]);
  const [catalogImageFile, setCatalogImageFile] = useState(null);



/* ===================== HANDLERS ===================== */

const openEditCatalogModal = (catalog) => {
  setEditingCatalog(catalog);

  setCatalogName(catalog.name);

  setCatalogDesc(catalog.desc || "");

  // Existing VPS image URL
  setCatalogImagePreview(catalog.image || null);

  // Important: clear previous selected file
  setCatalogImageFile(null);

  setIsCatalogModalOpen(true);
};


const handleCatalogImageChange = (e) => {
  const file = e.target.files[0];

  if (!file) return;

  setCatalogImageFile(file);

  setCatalogImagePreview(URL.createObjectURL(file));
};


/* ===================== VPS IMAGE UPLOAD ===================== */

const uploadCatalogToStorage = async (file) => {
  try {
    if (!file) {
      throw new Error("Image file is required");
    }

    const fd = new FormData();

    // Must match:
    // upload.single("image")
    fd.append("image", file, file.name);

    const res = await fetchWithLoader(
      "https://storage.indihands.com/api/upload/category",
      {
        method: "POST",
        body: fd,
      }
    );

    const data = await res.json();

    console.log("VPS Catalog Upload Response:", data);

    if (!res.ok || !data.success) {
      throw new Error(
        data?.message || "Catalog image upload failed"
      );
    }

    return data.imageUrl;

  } catch (err) {
    console.error("VPS catalog upload failed:", err);
    throw err;
  }
};


  useEffect(() => {
    if (selectedCatalog?.id) {
      setCatPage(1); // ✅ reset page
      fetchCatalogProducts(selectedCatalog.id);
    }
  }, [selectedCatalog]);

  const saveCatalog = async () => {
  try {
    if (!catalogName.trim()) {
      return showError("❌ Catalog name required");
    }

    // Keep existing image when editing
    let imageUrl = editingCatalog?.image || null;

    // ============================================
    // UPLOAD NEW IMAGE TO VPS
    // ============================================

    if (catalogImageFile instanceof File) {
      imageUrl = await uploadCatalogToStorage(
        catalogImageFile
      );
    }

    // ============================================
    // REQUEST BODY
    // ============================================

    const body = {
      name: catalogName.trim(),
      description: catalogDesc?.trim() || null,
      featured_image: imageUrl,
    };

    let res;

    // ============================================
    // UPDATE CATALOG
    // ============================================

    if (editingCatalog) {
      res = await fetchWithLoader(
        `/api/products/${editingCatalog.id}/catalogs`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
    }

    // ============================================
    // CREATE CATALOG
    // ============================================

    else {
      res = await fetchWithLoader(
        "/api/catalogs",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
    }

    // ============================================
    // HANDLE RESPONSE
    // ============================================

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data?.message ||
        data?.error ||
        "Save failed"
      );
    }

    showSuccess(
      editingCatalog
        ? "Catalog updated successfully!"
        : "Catalog created successfully!"
    );

    // Refresh catalog list
    await fetchCatalogs();

    // Close modal
    setIsCatalogModalOpen(false);

    // Reset state
    setEditingCatalog(null);
    setCatalogName("");
    setCatalogDesc("");
    setCatalogImagePreview(null);
    setCatalogImageFile(null);

  } catch (err) {

    console.error(
      "Save catalog error:",
      err
    );

    showError(
      "❌ " +
      (err.message || "Failed to save catalog")
    );

  }
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
  const fetchCatalogProducts = async (catalogId) => {
    console.log("id", catalogId)
    const res = await fetchWithLoader(`/api/catalogs/${catalogId}/products`);
    const data = await res.json();
    console.log("catpro", data)
    setCatalogProducts(data.products || []);
  };
  const addSelectedProductsToCatalog = async () => {
    try {
      if (!selectedCatalog?.id) return showError("Select catalog first");
      if (selectedProductsToAdd.length === 0) return showError("Select products first");

      const res = await fetchWithLoader(`/api/catalogs/${selectedCatalog.id}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: selectedProductsToAdd }),
      });

      const data = await res.json();
      console.log("selectedcat")
      if (!res.ok) throw new Error(data.message || "Failed to add products");

      showSuccess("Products added to catalog");

      setIsAddExistingModalOpen(false);
      setSelectedProductsToAdd([]);

      // ✅ refresh products list (if your product list shows catalog mapping)
      await fetchCatalogProducts(selectedCatalog.id);
    } catch (err) {
      console.error("Add products to catalog error:", err);
      showError("❌ " + err.message);
    }
  };




  useEffect(() => {
    if (selectedCatalog?.id) {
      fetchCatalogProducts(selectedCatalog.id);
    }
  }, [selectedCatalog]);


  const removeProductFromCatalog = async (productId) => {
    try {
      if (!selectedCatalog?.id) return;

      const res = await fetchWithLoader(`/api/catalogs/${selectedCatalog.id}/products`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Remove failed");

      showSuccess("Product removed from catalog");

      await fetchCatalogProducts(selectedCatalog.id);
    } catch (err) {
      console.error("Remove product error:", err);
      showError("❌ " + err.message);
    }
  };


  const fetchCatalogs = async () => {
    try {
      const res = await fetchWithLoader("/api/catalogs");
      const data = await res.json();

      const formatted = (data.catalogs || []).map((c) => ({
        id: c.id,
        name: c.name,
        desc: c.description || "",
        image: c.featured_image || "",
      }));
      console.log("cat", data)
      setCatalogs(formatted);

      if (formatted.length > 0) {
        setSelectedCatalog(formatted[0]);
      }
    } catch (err) {
      console.error("Fetch catalogs error:", err);
    }
  };

  const fetchAllProducts = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: 1,
        limit: 1000,
        search: "",
        category: "All",
        subCategory: "All",
        status: "All",
      });

      const res = await fetchWithLoader(`/api/products?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch all products");
      console.log("products", data.products)
      setAllProducts(data.products || []);
    } catch (err) {
      console.error("Fetch all products error:", err);
    } finally {
      setLoading(false);
    }
  };


  const deleteCatalog = (catalog) => {
    setConfirmMsg(`Delete catalog "${catalog.name}" ?`);

    setConfirmAction(() => async () => {
      try {
        const res = await fetchWithLoader(`/api/catalogs/${catalog.id}`, {
          method: "DELETE",
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        showSuccess("Catalog deleted");
        fetchCatalogs();
      } catch (err) {
        console.error("Delete catalog error:", err);
        showError(err.message);
      }
    });

    setConfirmOpen(true);
  };




  useEffect(() => {
    fetchCatalogs()
    fetchAllProducts();
  }, []);

  // const totalCatPages = Math.ceil(catalogProducts.length / catItemsPerPage);

 const filteredProducts = catalogProducts.filter((p) =>
  p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
);

const totalCatPages = Math.ceil(filteredProducts.length / catItemsPerPage);

const paginatedCatalogProducts = filteredProducts.slice(
  (catPage - 1) * catItemsPerPage,
  catPage * catItemsPerPage
);


  
const getPagination = (current, total) => {
  const delta = 1; // how many pages around current
  const range = [];
  const rangeWithDots = [];

  for (let i = 1; i <= total; i++) {
    if (
      i === 1 ||
      i === total ||
      (i >= current - delta && i <= current + delta)
    ) {
      range.push(i);
    }
  }

  let prev;
  for (let i of range) {
    if (prev) {
      if (i - prev === 2) {
        rangeWithDots.push(prev + 1);
      } else if (i - prev > 2) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(i);
    prev = i;
  }

  return rangeWithDots;
};
  const pages = getPagination(catPage, totalCatPages);
  const isPopularCatalog =
  selectedCatalog?.name === "Popular Products";
  /* ===================== UI ===================== */
  return (
    <ProtectedRoute>
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
            <div
              className="d-flex gap-3 overflow-auto"
              style={{
                paddingBottom: "10px",
                scrollbarWidth: "thin",
              }}
            >
              {catalogs.map((c) => (
                <div
                  key={c.id}
                  className={`card catalog-card shadow-sm ${selectedCatalog?.id === c.id ? "border-primary" : ""}`}
                  onClick={() => setSelectedCatalog(c)}
                  style={{
                    minWidth: "220px",
                    cursor: "pointer",
                    borderRadius: "12px",
                    flex: "0 0 auto",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                >
                  {/* Image */}
                  <div

                    style={{
                      width: "100%",
                      height: "180px",   // ✅ fixed equal height
                      position: "relative",
                      overflow: "hidden",
                      borderTopLeftRadius: "12px",
                      borderTopRightRadius: "12px",
                      background: "#f6f6f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}

                  >
                    {c.image ? (
                      <img
                        src={c.image}
                        alt={c.name}
                        style={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          objectFit: "contain"
                        }}
                      />
                    ) : (
                      <div
                        className="bg-light d-flex justify-content-center align-items-center text-muted"
                        style={{ position: "absolute", inset: 0 }}
                      >
                        No Image
                      </div>
                    )}
                  </div>





                  {/* Title & Description */}
                  <div className="card-body text-center py-3">
                    <h6 className="mb-1 fw-bold">{c.name}</h6>
                    <small className="text-muted">{c.desc}</small>
                  </div>

                  {/* Footer Buttons */}
                  <div className="card-footer text-center d-flex gap-2 justify-content-center py-2">
                    <button
                      className="btn btn-sm btn-outline-orange"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditCatalogModal(c);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCatalog(c);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

              ))}
            </div>
          </div>
        </div>



        {/* ===================== PRODUCTS IN CATALOG ===================== */}
        <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
  <h5 className="mb-0">
    Products in "{selectedCatalog?.name || "Select Catalog"}"
  </h5>

  <div className="d-flex gap-2">
    {/* 🔍 SEARCH INPUT */}
    <input
      type="text"
      className="form-control form-control-sm"
      placeholder="Search product..."
      style={{ width: "220px" }}
      value={searchTerm}
      onChange={(e) => {
        setSearchTerm(e.target.value);
        setCatPage(1); // reset pagination on search
      }}
    />

    <button
      className="btn btn-orange btn-sm"
        disabled={isPopularCatalog}
  onClick={() => {
    if (isPopularCatalog) return;
    openAddExistingProductsModal();
  }}
    >
      Add Product to Catalog
    </button>
  </div>
</div>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>SR NO </th>
                  <th>Product</th>
                  <th>Stock</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
              {paginatedCatalogProducts.length > 0 ? (
  paginatedCatalogProducts.map((p, index) => (
    <tr key={p.id}>
      <td>{(catPage - 1) * catItemsPerPage + index + 1}</td>
      <td>{p.name}</td>
      <td>{p.stock}</td>
      <td>{p.sku}</td>
      <td>₹{p.price}</td>
      <td>
        <span className={`badge ${p.status === "Available" ? "bg-success" : "bg-danger"}`}>
          {p.status}
        </span>
      </td>
      <td>
        <button
          className="btn btn-sm btn-outline-danger"
           disabled={isPopularCatalog}
  onClick={() => {
    if (isPopularCatalog) return;
    removeProductFromCatalog(p.id);
  }}
        >
          Remove
        </button>
      </td>
    </tr>
  ))
) : (
  <tr>
    <td colSpan="7" className="text-center py-4 text-muted">
      {searchTerm
        ? "No matching product found in this catalog"
        : "No products found in this catalog"}
    </td>
  </tr>
)}

              </tbody>
            </table>
          </div>

          {totalCatPages > 1 && (
          <div className="d-flex justify-content-center align-items-center mt-3 mb-2 gap-2"
     style={{ overflowX: "auto" }}>

  {/* Prev */}
  <button
    className="btn btn-outline-secondary btn-sm"
    disabled={catPage === 1}
    onClick={() => setCatPage((prev) => prev - 1)}
  >
    Prev
  </button>

  {/* Pages */}
  {pages.map((p, index) =>
    p === "..." ? (
      <span key={index} className="px-2">...</span>
    ) : (
      <button
        key={index}
        className={`btn btn-sm ${
          catPage === p ? "btn-primary" : "btn-outline-primary"
        }`}
        onClick={() => setCatPage(p)}
      >
        {p}
      </button>
    )
  )}

  {/* Next */}
  <button
    className="btn btn-outline-secondary btn-sm"
    disabled={catPage === totalCatPages}
    onClick={() => setCatPage((prev) => prev + 1)}
  >
    Next
  </button>
</div>
          )}

        </div>

        {/* ===================== ADD EXISTING PRODUCT MODAL ===================== */}
        {isAddExistingModalOpen && (
          <>
            <div className="modal-backdrop fade show"></div>
            <div className="modal d-block" tabIndex="-1">
              <div className="modal-dialog modal-xl">
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
                        <col style={{ width: "80px" }} />   {/* Stock */}
                        <col style={{ width: "200px" }} />  {/* SKU */}
                        <col style={{ width: "100px" }} />  {/* Price */}
                      </colgroup>
                      <thead>
                        <tr>
                          <th>Select</th>
                          <th>Product</th>
                          <th>Stock</th>
                          <th>SKU</th>
                          <th>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allProducts
                          .filter((p) => !catalogProducts.some((cp) => cp.id === p.id))
                          .map((p) => (
                            <tr key={p.id} >
                              <td>
                                <td className="text-center">
                                  <input
                                    type="checkbox"
                                    className="form-check-input border-1"
                                    style={{
                                      width: "20px",
                                      height: "20px",
                                      transform: "scale(1.4)",
                                      cursor: "pointer"
                                    }}
                                    checked={selectedProductsToAdd.includes(p.id)}
                                    onChange={() => toggleProductSelection(p.id)}
                                  />
                                </td>
                              </td>

                              <td className="text-truncate" style={{ maxWidth: "200px" }}>
                                {p.name}
                              </td>


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
                    <button className="btn btn-orange" onClick={saveCatalog}>{editingCatalog ? "Update" : "Save"}</button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Catalog"
        message={confirmMsg}
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          setConfirmOpen(false);
          if (confirmAction) await confirmAction();
        }}
      />
    </ProtectedRoute>
  );
};

export default Page;
