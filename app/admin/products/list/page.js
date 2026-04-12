"use client";

import React, { useState, useEffect } from "react";
import ProtectedRoute from '../../../../components/ProtectedRoute'
import { showSuccess, showError } from "../../../../lib/toast";
import ConfirmDialog from "../../../../components/ConfirmDialog";
import { useFetchWithLoader } from "../../../../lib/fetchWithLoader";


const Page = () => {
  const [products, setProducts] = useState([]);
  const fetchWithLoader = useFetchWithLoader();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryProduct, setGalleryProduct] = useState(null);
  const [catalogs, setCatalogs] = useState([]);
  const [newCatalogName, setNewCatalogName] = useState("");
  const [alreadyAssignedCatalogs, setAlreadyAssignedCatalogs] = useState([]);

  const openGalleryModal = (product) => {
    setGalleryProduct(product);
    setShowGalleryModal(true);
  };

  const uploadToCloudinary = async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", "products"); // your preset name

    const res = await fetchWithLoader("https://api.cloudinary.com/v1_1/dxb1whlam/image/upload", {
      method: "POST",
      body: fd,
    });

    const data = await res.json();

    if (!res.ok) {
      console.log("Cloudinary Error:", data);
      throw new Error(data?.error?.message || "Cloudinary upload failed");
    }

    return data.secure_url;
  };



  const closeGalleryModal = () => {
    setGalleryProduct(null);
    setShowGalleryModal(false);
  };


  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // const filteredProducts = products.filter((p) => {
  //   const matchSearch =
  //     p.name.toLowerCase().includes(search.toLowerCase()) ||
  //     (p.sku || "").toLowerCase().includes(search.toLowerCase());


  //   const matchStatus = status === "All" || p.status === status;
  //   return matchSearch && matchStatus;
  // });

  // const paginatedProducts = filteredProducts.slice(
  //   (currentPage - 1) * itemsPerPage,
  //   currentPage * itemsPerPage
  // );


  const getPagination = () => {
    const pages = new Set(); // ✅ IMPORTANT

    const maxVisible = 5;

    let start = currentPage - Math.floor(maxVisible / 2);
    let end = currentPage + Math.floor(maxVisible / 2);

    if (start < 1) {
      start = 1;
      end = maxVisible;
    }

    if (end > totalPages) {
      end = totalPages;
      start = totalPages - maxVisible + 1;
    }

    if (start < 1) start = 1;

    // First
    if (start > 1) {
      pages.add(1);
      if (start > 2) pages.add("...");
    }

    for (let i = start; i <= end; i++) {
      pages.add(i);
    }

    // Last
    if (end < totalPages) {
      if (end < totalPages - 1) pages.add("...");
      pages.add(totalPages);
    }

    return Array.from(pages); // ✅ no duplicates
  };


  const normalizeImages = (images) => {
    if (Array.isArray(images)) return images;
    if (typeof images === "string") {
      try {
        const parsed = JSON.parse(images);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const openEditModal = (product) => {
    setSelectedProduct({
      ...product,
      size: product.size || "",
      weight: product.weight || "",
      barcode: product.barcode || "",
      featureImage: product.featureImage,   // URL
      images: normalizeImages(product.images), // ✅ FIX HERE
      // Array of URLs
    });
    setIsEditModalOpen(true);
  };


  const closeEditModal = () => {
    setSelectedProduct(null);
    setIsEditModalOpen(false);
  };

  const saveChanges = async () => {
    try {
      if (!selectedProduct?.id) return;
      // 🔐 FINAL INVENTORY vs STATUS VALIDATION (EDIT)

      const stockQty = Number(selectedProduct.stock);
      const statusVal = selectedProduct.status;

      // Out of Stock but stock > 0 ❌
      if (statusVal === "Out of Stock" && stockQty > 0) {
        showError("Stock must be 0 when status is Out of Stock");
        return;
      }

      // Available but stock = 0 ❌
      if (statusVal === "Available" && stockQty === 0) {
        showError("Stock must be greater than 0 when status is Available");
        return;
      }

      // ✅ Start from existing URL (keep old)
      let featuredImageUrl =
        typeof selectedProduct.featureImage === "string"
          ? selectedProduct.featureImage
          : null;

      // ✅ if user selected new featured file -> upload
      if (selectedProduct.featureImage instanceof File) {
        featuredImageUrl = await uploadToCloudinary(selectedProduct.featureImage);
      }

      // ✅ keep old gallery urls
      const oldGalleryUrls = (selectedProduct.images || []).filter(
        (img) => typeof img === "string" && img.startsWith("http")
      );

      // ✅ upload new gallery files
      const newGalleryFiles = (selectedProduct.images || []).filter(
        (img) => img instanceof File
      );

      let newGalleryUrls = [];
      if (newGalleryFiles.length > 0) {
        for (const file of newGalleryFiles) {
          const url = await uploadToCloudinary(file);
          newGalleryUrls.push(url);
        }
      }

      // ✅ final gallery = old + new
      const finalGallery = [...oldGalleryUrls, ...newGalleryUrls];

      const body = {
        name: selectedProduct.name,
        sku: selectedProduct.sku,
        hsn: selectedProduct.hsn,
        size: selectedProduct.size,
        barcode: selectedProduct.barcode,
        weight: selectedProduct.weight,
        stock: selectedProduct.stock,
        price: selectedProduct.price,
        status: selectedProduct.status,
        description: selectedProduct.description,
        featuredImage: featuredImageUrl,
        images: finalGallery,
        cgst_rate: selectedProduct.cgst_rate === "" ? null : Number(selectedProduct.cgst_rate),
        sgst_rate: selectedProduct.sgst_rate === "" ? null : Number(selectedProduct.sgst_rate),
        igst_rate: selectedProduct.igst_rate === "" ? null : Number(selectedProduct.igst_rate),
      };

      const res = await fetchWithLoader(`/api/products/${selectedProduct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      showSuccess("Product updated successfully!");

      // ✅ refresh list
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        search,
        status,
      });

      const listRes = await fetchWithLoader(`/api/products?${params.toString()}`);
      const listData = await listRes.json();
      setProducts(listData.products);
      setTotalPages(listData.pagination.totalPages);
      console.log("products", products)

      closeEditModal();
    } catch (err) {
      console.error("Update product error:", err);
      showError("❌ " + err.message);
    }
  };





  // --- Existing Delete Handlers ---
  const openDeleteModal = (product) => {
    setConfirmMsg(`Delete product "${product.name}" ?`);
    setConfirmAction(() => async () => {
      try {
        const res = await fetchWithLoader(`/api/products/${product.id}`, {
          method: "DELETE",
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Delete failed");

        setProducts((prev) => prev.filter((p) => p.id !== product.id));

        showSuccess("Product deleted successfully");
      } catch (err) {
        console.error("Delete product error:", err);
        showError(err.message);
      }
    });

    setConfirmOpen(true);
  };
  const closeDeleteModal = () => {
    setDeleteProduct(null);
    setIsDeleteModalOpen(false);
  };
  const confirmDelete = async () => {
    try {
      if (!deleteProduct?.id) return;



      const res = await fetchWithLoader(`/api/products/${deleteProduct.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Delete failed");

      // alert("✅ Product deleted successfully!");

      // ✅ update UI
      setProducts((prev) => prev.filter((p) => p.id !== deleteProduct.id));

      closeDeleteModal();
    } catch (err) {
      console.error("Delete product error:", err);
      showError("❌ " + err.message);
    }
  };



  const openAssignModal = async (product) => {
    try {
      const res = await fetchWithLoader(`/api/products/${product.id}/catalogs`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch product catalogs");

      setAlreadyAssignedCatalogs(data.catalogIds || []);

     setSelectedProduct({
  ...product,
  catalogs: data.catalogIds || [], // ✅ preload
});

      setIsAssignModalOpen(true);
      setNewCatalogName("");
    } catch (err) {
      console.error("openAssignModal error:", err);
      showError("❌ " + err.message);
    }
  };



  const closeAssignModal = () => {
    setSelectedProduct(null);
    setIsAssignModalOpen(false);
    setNewCatalogName("");
  };
const toggleCatalogSelection = (catalogId) => {
  setSelectedProduct((prev) => {
    const exists = prev.catalogs.includes(catalogId);

    return {
      ...prev,
      catalogs: exists
        ? prev.catalogs.filter((id) => id !== catalogId) // uncheck
        : [...prev.catalogs, catalogId], // check
    };
  });
};

  const fetchCatalogs = async () => {
    try {
      const res = await fetchWithLoader("/api/catalogs");
      const data = await res.json();

      setCatalogs(data.catalogs || []);
    } catch (err) {
      console.error("Fetch catalogs error:", err);
    }
  };

  useEffect(() => {
    fetchCatalogs();
  }, []);



const saveCatalogAssignment = async () => {
  try {
    if (!selectedProduct?.id) return;

    const selected = selectedProduct.catalogs;
    const already = alreadyAssignedCatalogs;

    // 🔥 1. Assign (new)
    const toAssign = selected.filter((id) => !already.includes(id));

    // 🔥 2. Unassign (removed)
    const toUnassign = already.filter((id) => !selected.includes(id));

    // ✅ Assign API
    for (const catalogId of toAssign) {
      await fetchWithLoader(`/api/catalogs/${catalogId}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: [selectedProduct.id] }),
      });
    }

    // ✅ Unassign API
    for (const catalogId of toUnassign) {
      await fetchWithLoader(`/api/catalogs/${catalogId}/products`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selectedProduct.id }),
      });
    }

    showSuccess("✅ Catalog updated (assign + unassign)");

    closeAssignModal();

  } catch (err) {
    console.error("Toggle assign error:", err);
    showError("❌ " + err.message);
  }
};

  const createNewCatalog = async () => {
    try {
      if (!newCatalogName.trim()) return;

      const res = await fetchWithLoader("/api/catalogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCatalogName,
          description: null,
          featured_image: null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Catalog create failed");

      showSuccess("Catalog created");

      setNewCatalogName("");

      // ✅ refresh catalogs list
      await fetchCatalogs();
    } catch (err) {
      console.error("Create catalog error:", err);
      showError("❌ " + err.message);
    }
  };

  const handleEditPriceChange = (e) => {
    const value = e.target.value;

    if (value === "") {
      setSelectedProduct((prev) => ({
        ...prev,
        price: "",
      }));
      return;
    }

    const regex = /^\d*\.?\d*(-\d*\.?\d*)?$/;

    if (regex.test(value)) {
      setSelectedProduct((prev) => ({
        ...prev,
        price: value,
      }));
    }
  };

  const changePage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  useEffect(() => {
    if (!selectedProduct) return;

    const textarea = document.getElementById("descBox");
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  }, [selectedProduct?.description]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {

        const params = new URLSearchParams({
          page: currentPage,
          limit: itemsPerPage,
          search,
          status,
        });

        const res = await fetchWithLoader(`/api/products?${params.toString()}`);
        const data = await res.json();
        console.log("DB PRODUCTS:", data);
        setProducts(data.products);
        setTotalPages(data.pagination.totalPages);
      } catch (err) {
        console.error("Fetch products error", err);
      } finally {
      }
    };

    fetchProducts();
  }, [currentPage, search, status]);

  const makeThumb = (url) =>
    url?.includes("/image/upload/")
      ? url.replace("/image/upload/", "/image/upload/w_80,h_80,c_fill,q_auto,f_auto/")
      : url;




  return (
    <ProtectedRoute>
      <div className="container-xxl flex-grow-1 container-p-y">


        <div className="card mb-4">
          <div className="card-body">
            <div className="text-end">
              <button
                className="btn btn-orange btn-sm mb-3"
                onClick={() => {
                  const params = new URLSearchParams({
                    search,
                    status,
                  });

                  window.location.href = `/api/products/bulk-export?${params.toString()}`;
                }}
              >
                <i className="bi bi-file-earmark-excel"></i> Export Excel
              </button>

            </div>
            <div className="row g-3">

              <div className="col-md-5">
                <label className="form-label">Search</label>
                <input
                  className="form-control"
                  placeholder="Product name or SKU"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1); // ✅ RESET HERE
                  }}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setCurrentPage(1); // ✅ RESET HERE
                  }}
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
                  <th>Sr. No</th>
                  <th>Image</th>
                  <th>Product</th>
                  <th>HSN</th>
                  <th>Size</th>
                  <th>Barcode</th>
                  <th>Weight</th>
                  <th>Stock</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>CGST %</th>
                  <th>SGST %</th>
                  <th>IGST %</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center text-muted py-4">
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((p, index) => (
                    <tr key={p.id}>
                      <td className="text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>

                      <td>
                        {p.featureImage ? (
                          <img
                            src={makeThumb(p.featureImage)}
                            width={50}
                            height={50}
                            loading="lazy"
                            style={{ objectFit: "cover", borderRadius: "8px" }}
                          />

                        ) : (
                          <span className="text-muted">No Image</span>
                        )}
                      </td>


                      <td>{p.name}</td>
                      <td>{p.hsn || "-"}</td>
                      <td>{p.size || "-"}</td>
                      <td>{p.barcode || "-"}</td>
                      <td>{p.weight || "-"}</td>

                      <td>{p.stock}</td>
                      <td>{p.sku || "-"}</td>
                      <td>Rs.{p.price}</td>
                      <td>{p.cgst_rate ?? 0}%</td>
                      <td>{p.sgst_rate ?? 0}%</td>
                      <td>{p.igst_rate ?? 0}%</td>
                      <td>
                        <span className={`badge ${p.status === "Available" ? "bg-success" : "bg-danger"}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="d-flex gap-2 justify-content-center ">
                          <button className="btn btn-sm btn-orange " onClick={() => openEditModal(p)}><i className="bi bi-pencil-square "></i></button>
                          {/* 🔹 GALLERY BUTTON */}
                          <button
                            className="btn btn-sm btn-outline-info"
                            onClick={() => openGalleryModal(p)}
                          >
                            <i className="bi bi-images"></i>
                          </button>
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

              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => changePage(currentPage - 1)}
              >
                Prev
              </button>

              {getPagination().map((p, i) =>
                p === "..." ? (
                  <span key={i} className="px-2">...</span>
                ) : (
                  <button
                    key={`${p}-${i}`}
                    className={`btn btn-sm ${currentPage === p ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => changePage(p)}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => changePage(currentPage + 1)}
              >
                Next
              </button>

            </div>
          )}

          {/* --- Assign to Catalog Modal --- */}
          {isAssignModalOpen && selectedProduct && (
            <div
              className="position-absolute top-50 start-50 translate-middle bg-white p-4 rounded shadow"
              style={{ maxWidth: "400px", zIndex: 20 }}
            >
              <h5 className="mb-3">Assign Product to Catalog</h5>

              <div className="d-flex flex-column gap-2">

              {catalogs.map((cat) => {
const isChecked = selectedProduct?.catalogs?.includes(cat.id);

  return (
    <div key={cat.id} className="form-check">
      <input
        className="form-check-input"
        type="checkbox"
        checked={isChecked}
        onChange={() => toggleCatalogSelection(cat.id)}
        id={`cat-${cat.id}`}
      />
      <label className="form-check-label" htmlFor={`cat-${cat.id}`}>
        {cat.name}
      </label>
    </div>
  );
})}


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
                <button className="btn btn-outline-orange" onClick={createNewCatalog}>Add</button>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-3">
                <button className="btn btn-secondary" onClick={closeAssignModal}>Cancel</button>
                <button className="btn btn-orange" onClick={saveCatalogAssignment}>Save</button>
              </div>
            </div>
          )}
          {/* 🔹 GALLERY MODAL */}
          {showGalleryModal && galleryProduct && (
            <>
              <div className="modal-backdrop fade show" style={{ zIndex: 10 }} />
              <div className="modal d-block" style={{ zIndex: 20 }}>
                <div className="modal-dialog modal-lg modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">
                        {galleryProduct.name} – Gallery
                      </h5>
                      <button
                        className="btn-close"
                        onClick={closeGalleryModal}
                      ></button>
                    </div>

                    <div className="modal-body">
                      <div className="row g-3">
                        {normalizeImages(galleryProduct.images).length > 0 ? (
                          normalizeImages(galleryProduct.images).map((img, i) => (
                            <div key={i} className="col-6 col-md-4 col-lg-3">
                              <div className="border rounded p-2 h-100 d-flex align-items-center justify-content-center">
                                <img
                                  src={img}
                                  alt={`gallery-${i}`}
                                  className="img-fluid rounded"
                                  style={{
                                    maxHeight: "150px",
                                    objectFit: "cover",
                                    width: "100%",
                                  }}
                                />
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted text-center">No gallery images found</p>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </>
          )}
          {/* --- Edit Product Modal --- */}
          {isEditModalOpen && selectedProduct && (
            <>
              {/* Backdrop */}
              <div className="modal-backdrop fade show" style={{ zIndex: 10 }}></div>

              {/* Modal */}
              <div className="modal d-block" tabIndex="-1" style={{ zIndex: 20 }}>
                <div className="modal-dialog modal-lg modal-dialog-centered">
                  <div className="modal-content">

                    {/* Header */}
                    <div className="modal-header py-2">


                      <h5 className="modal-title">Edit Product</h5>
                      <button type="button" className="btn-close" onClick={closeEditModal}></button>
                    </div>

                    {/* Body */}
                    <div className="modal-body">
                      <div className="row g-3">

                        {/* ================= ROW 1 ================= */}
                        <div className="col-md-4">
                          <label className="form-label">Product Name</label>
                          <input
                            className="form-control form-control-sm"
                            value={selectedProduct.name}
                            onChange={(e) =>
                              setSelectedProduct({ ...selectedProduct, name: e.target.value })
                            }
                          />
                        </div>

                        <div className="col-md-4">
                          <label className="form-label">SKU</label>
                          <input
                            className="form-control form-control-sm"
                            value={selectedProduct.sku}
                            onChange={(e) =>
                              setSelectedProduct({ ...selectedProduct, sku: e.target.value })
                            }
                          />
                        </div>

                        <div className="col-md-4">
                          <label className="form-label">HSN</label>
                          <input
                            className="form-control form-control-sm"
                            value={selectedProduct.hsn || ""}
                            onChange={(e) =>
                              setSelectedProduct({ ...selectedProduct, hsn: e.target.value })
                            }
                          />
                        </div>

                        {/* ================= ROW 2 ================= */}
                        <div className="col-md-4">
                          <label className="form-label">Size</label>
                          <input
                            className="form-control form-control-sm"
                            placeholder="12 x 10 x 8"
                            value={selectedProduct.size || ""}
                            onChange={(e) =>
                              setSelectedProduct({ ...selectedProduct, size: e.target.value })
                            }
                          />
                        </div>

                        <div className="col-md-4">
                          <label className="form-label">Weight</label>
                          <input
                            className="form-control form-control-sm"
                            placeholder="1.5 kg"
                            value={selectedProduct.weight || ""}
                            onChange={(e) =>
                              setSelectedProduct({ ...selectedProduct, weight: e.target.value })
                            }
                          />
                        </div>


                        <div className="col-md-4">
                          <label className="form-label">Barcode</label>
                          <input
                            className="form-control form-control-sm"
                            placeholder="7896"
                            value={selectedProduct.barcode || ""}
                            onChange={(e) =>
                              setSelectedProduct({ ...selectedProduct, barcode: e.target.value })
                            }
                          />
                        </div>

                        <div className="col-md-4">
                          <label className="form-label">Stock</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            value={selectedProduct.stock}
                            disabled={selectedProduct.status === "Out of Stock"}
                            onChange={(e) => {
                              const qty = Number(e.target.value);

                              setSelectedProduct({
                                ...selectedProduct,
                                stock: qty,
                                status: qty === 0 ? "Out of Stock" : "Available",
                              });
                            }}

                          />
                        </div>

                        {/* ================= ROW 3 ================= */}
                        <div className="col-md-4">
                          <label className="form-label">Price</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={selectedProduct.price || ""}
                            onChange={(e) => handleEditPriceChange(e)}
                          />
                        </div>

                        <div className="col-md-4">
                          <label className="form-label">Status</label>
                          <select
                            className="form-select form-select-sm"
                            value={selectedProduct.status}
                            onChange={(e) => {
                              const value = e.target.value;

                              setSelectedProduct({
                                ...selectedProduct,
                                status: value,
                                stock: value === "Out of Stock" ? 0 : selectedProduct.stock,
                              });
                            }}

                          >


                            <option value="Available">Available</option>
                            <option value="Out of Stock">Out of Stock</option>
                          </select>
                        </div>
                        {/* ================= TAX ROW ================= */}
                        <div className="col-md-4">
                          <label className="form-label">CGST (%)</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            value={selectedProduct.cgst_rate || ""}
                            onChange={(e) =>
                              setSelectedProduct({
                                ...selectedProduct,
                                cgst_rate: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="col-md-4">
                          <label className="form-label">SGST (%)</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            value={selectedProduct.sgst_rate || ""}
                            onChange={(e) =>
                              setSelectedProduct({
                                ...selectedProduct,
                                sgst_rate: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="col-md-4">
                          <label className="form-label">IGST (%)</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            value={selectedProduct.igst_rate || ""}
                            onChange={(e) =>
                              setSelectedProduct({
                                ...selectedProduct,
                                igst_rate: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="col-md-4"></div> {/* spacer for alignment */}


                        <div className="col-12">
                          <label className="form-label">Description</label>
                          <textarea
                            id="descBox"
                            className="form-control form-control-sm"
                            value={selectedProduct.description}
                            rows={1}
                            style={{ overflow: "hidden", resize: "none" }}
                            onChange={(e) => {
                              const value = e.target.value;

                              // auto resize logic
                              e.target.style.height = "auto";
                              e.target.style.height = e.target.scrollHeight + "px";

                              setSelectedProduct({
                                ...selectedProduct,
                                description: value,
                              });
                            }}
                          />
                        </div>
                        {/* ================= FEATURE IMAGE ================= */}
                        <div className="col-12">
                          <label className="form-label">Feature Image</label>
                          <input
                            type="file"
                            className="form-control form-control-sm"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setSelectedProduct({ ...selectedProduct, featureImage: file });
                              }
                            }}
                          />
                          <small className="text-muted d-block mt-1">
                            {selectedProduct.featureImage instanceof File
                              ? selectedProduct.featureImage.name
                              : selectedProduct.featureImage || "No image selected"}
                          </small>
                        </div>

                        {/* ================= GALLERY ================= */}
                        <div className="col-12">
                          <label className="form-label me-2">Gallery Images </label>

                          {(selectedProduct.images || []).map((img, index) => (
                            <div key={index} className="d-flex align-items-center gap-2 mb-2">
                              <input
                                type="file"
                                className="form-control form-control-sm"
                                style={{ maxWidth: 260 }}
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    const updated = [...selectedProduct.images];
                                    updated[index] = file;
                                    setSelectedProduct({ ...selectedProduct, images: updated });
                                  }
                                }}
                              />

                              <input
                                type="text"
                                className="form-control form-control-sm"
                                readOnly
                                value={
                                  img instanceof File ? img.name : img || "No image"
                                }
                              />

                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() =>
                                  setSelectedProduct({
                                    ...selectedProduct,
                                    images: selectedProduct.images.filter((_, i) => i !== index),
                                  })
                                }
                              >
                                ✕
                              </button>
                            </div>
                          ))}

                          <button
                            className="btn btn-sm btn-outline-orange"
                            onClick={() =>
                              setSelectedProduct({
                                ...selectedProduct,
                                images: [...(selectedProduct.images || []), null],
                              })
                            }
                          >
                            + Add Image
                          </button>
                        </div>

                      </div>
                    </div>


                    {/* Footer */}
                    <div className="modal-footer py-2">
                      <button className="btn btn-sm btn-secondary" onClick={closeEditModal}>
                        Cancel
                      </button>
                      <button className="btn btn-sm btn-orange" onClick={saveChanges}>
                        Save Changes
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            </>
          )}
          {isDeleteModalOpen && deleteProduct && (
            <>
              <div className="modal-backdrop fade show" style={{ zIndex: 10 }}></div>

              <div className="modal d-block" tabIndex="-1" style={{ zIndex: 20 }}>
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">

                    <div className="modal-header py-2">
                      <h5 className="modal-title text-danger">Delete Product</h5>
                      <button type="button" className="btn-close" onClick={closeDeleteModal}></button>
                    </div>

                    <div className="modal-body">
                      <p>
                        Are you sure you want to delete <b>{deleteProduct.name}</b> ?
                      </p>
                      <p className="text-muted mb-0">
                        This will also delete gallery images mapping.
                      </p>
                    </div>

                    <div className="modal-footer py-2">
                      <button className="btn btn-sm btn-secondary" onClick={closeDeleteModal}>
                        Cancel
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={confirmDelete}>
                        Delete
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            </>
          )}



        </div>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Product"
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
