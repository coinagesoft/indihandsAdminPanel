"use client";

import React, { useState, useEffect } from "react";

const Page = () => {
  const [products, setProducts] = useState([]);


  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [subCategory, setSubCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryProduct, setGalleryProduct] = useState(null);
  const [catalogs, setCatalogs] = useState([]);
  const [newCatalogName, setNewCatalogName] = useState("");
  const [alreadyAssignedCatalogs, setAlreadyAssignedCatalogs] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [subCategoryList, setSubCategoryList] = useState([]);

  const openGalleryModal = (product) => {
    setGalleryProduct(product);
    setShowGalleryModal(true);
  };

  const uploadToCloudinary = async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", "products"); // your preset name

    const res = await fetch("https://api.cloudinary.com/v1_1/dxb1whlam/image/upload", {
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

  const fetchCategoryFilters = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();

      const cats = data.categories || [];

      // ✅ only category names
      const categoryNames = cats.map((c) => c.name);

      setCategoryList(categoryNames);

      // ✅ subcategory names based on selected category
      if (category !== "All") {
        const selected = cats.find((c) => c.name === category);

        const subNames = (selected?.subcategories || []).map((s) => s.name);
        setSubCategoryList(subNames);
      } else {
        // if category = All, show all subcategories
        const allSubs = cats.flatMap((c) => (c.subcategories || []).map((s) => s.name));
        setSubCategoryList(allSubs);
      }
    } catch (err) {
      console.error("fetchCategoryFilters error:", err);
    }
  };

  useEffect(() => {
    fetchCategoryFilters();
  }, [category]);


  const closeGalleryModal = () => {
    setGalleryProduct(null);
    setShowGalleryModal(false);
  };


  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredProducts = products.filter((p) => {
  const matchSearch =
  p.name.toLowerCase().includes(search.toLowerCase()) ||
  (p.sku || "").toLowerCase().includes(search.toLowerCase());

    const matchCategory = category === "All" || p.category === category;
    const matchSubCategory = subCategory === "All" || p.subCategory === subCategory;
    const matchStatus = status === "All" || p.status === status;
    return matchSearch && matchCategory && matchSubCategory && matchStatus;
  });

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- Existing Edit Handlers ---
  // const openEditModal = (product) => {
  //   setSelectedProduct({
  //     ...product,
  //     images: Array.isArray(product.images) ? product.images : [],
  //     catalogs: Array.isArray(product.catalogs) ? product.catalogs : [],
  //   });
  //   setIsEditModalOpen(true);
  // };
  const openEditModal = (product) => {
    setSelectedProduct({
      ...product,
      featureImage: product.featureImage,   // URL
      images: product.images || [],
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
        category: selectedProduct.category,
        subCategory: selectedProduct.subCategory,
         hsn: selectedProduct.hsn,
        stock: selectedProduct.stock,
        price: selectedProduct.price,
        status: selectedProduct.status,

        featuredImage: featuredImageUrl,
        images: finalGallery, // ✅ always array
      };

      const res = await fetch(`/api/products/${selectedProduct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      alert("✅ Product updated successfully!");

      // ✅ refresh list
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        search,
        category,
        subCategory,
        status,
      });

      const listRes = await fetch(`/api/products?${params.toString()}`);
      const listData = await listRes.json();
      setProducts(listData.products);
      setTotalPages(listData.pagination.totalPages);

      closeEditModal();
    } catch (err) {
      console.error("Update product error:", err);
      alert("❌ " + err.message);
    }
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
  const confirmDelete = async () => {
    try {
      if (!deleteProduct?.id) return;



      const res = await fetch(`/api/products/${deleteProduct.id}`, {
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
      alert("❌ " + err.message);
    }
  };



  const openAssignModal = async (product) => {
    try {
      const res = await fetch(`/api/products/${product.id}/catalogs`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch product catalogs");

      setAlreadyAssignedCatalogs(data.catalogIds || []); // ✅ fixed list (hide)

      setSelectedProduct({
        ...product,
        catalogs: [], // ✅ user selection empty initially (NOT same as assigned)
      });

      setIsAssignModalOpen(true);
      setNewCatalogName("");
    } catch (err) {
      console.error("openAssignModal error:", err);
      alert("❌ " + err.message);
    }
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

  const fetchCatalogs = async () => {
    try {
      const res = await fetch("/api/catalogs");
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

      // ✅ assign product to all selected catalogs
      for (const catalogId of selectedProduct.catalogs) {
        await fetch(`/api/catalogs/${catalogId}/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productIds: [selectedProduct.id] }),
        });
      }

      alert("✅ Product assigned to catalogs");

      closeAssignModal();
      await fetchCatalogs(); // optional

    } catch (err) {
      console.error("Assign product error:", err);
      alert("❌ " + err.message);
    }
  };

  const createNewCatalog = async () => {
    try {
      if (!newCatalogName.trim()) return;

      const res = await fetch("/api/catalogs", {
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

      alert("✅ Catalog created");

      setNewCatalogName("");

      // ✅ refresh catalogs list
      await fetchCatalogs();
    } catch (err) {
      console.error("Create catalog error:", err);
      alert("❌ " + err.message);
    }
  };


  const changePage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams({
          page: currentPage,
          limit: itemsPerPage,
          search,
          category,
          subCategory,
          status,
        });

        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        setProducts(data.products);
        setTotalPages(data.pagination.totalPages);
      } catch (err) {
        console.error("Fetch products error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, search, category, subCategory, status]);

  const makeThumb = (url) =>
    url?.includes("/image/upload/")
      ? url.replace("/image/upload/", "/image/upload/w_80,h_80,c_fill,q_auto,f_auto/")
      : url;

  useEffect(() => {
    const loadSubcategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        const cats = data.categories || [];

        const selectedCat = cats.find((c) => c.name === selectedProduct?.category);

        setSubCategoryList((selectedCat?.subcategories || []).map((s) => s.name));
      } catch (err) {
        console.error("loadSubcategories error:", err);
      }
    };

    if (selectedProduct?.category) {
      loadSubcategories();
    }
  }, [selectedProduct?.category]);


  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      {/* Filters */}
      {loading && (
        <div className="text-center py-5">
          <span className="spinner-border text-primary"></span>
        </div>
      )}

      <div className="card mb-4">
        
        <div className="card-body">
   <div className="text-end">
   <button
  className="btn btn-success btn-sm mb-3"
  onClick={() => {
    const params = new URLSearchParams({
      search,
      category,
      subCategory,
      status,
    });

    window.location.href = `/api/products/bulk-export?${params.toString()}`;
  }}
>
  <i className="bi bi-file-earmark-excel"></i> Export Excel
</button>

   </div>
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
  className="form-select form-select-sm"
  value={category}
  onChange={(e) => {
    setCategory(e.target.value);
    setSubCategory("All");
    setCurrentPage(1);
  }}
>
  <option value="All">All</option>
  {categoryList.map((c) => (
    <option key={c} value={c}>
      {c}
    </option>
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
                <option value="All">All</option>
              {subCategoryList.map((sc, index) => (
  <option key={`${sc}-${index}`} value={sc}>
    {sc}
  </option>
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
                <th>Image</th>
                <th>Product</th>
                <th>Category</th>
                <th>Subcategory</th>
                <th>HSN</th>
                <th>Stock</th>
                <th>SKU</th>
                <th>Price</th>
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
                products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>

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
                    <td>{p.category}</td>
                    <td>{p.subCategory}</td>
                    <td>{p.hsn}</td>
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
            {/* Existing Catalogs */}
            <div className="d-flex flex-column gap-2">

              {catalogs
                .filter((cat) => !alreadyAssignedCatalogs.includes(cat.id))
                .map((cat) => (
                  <div key={cat.id} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={selectedProduct?.catalogs?.includes(cat.id)}
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
                      {Array.isArray(galleryProduct.images) && galleryProduct.images.length > 0 ? (
                        galleryProduct.images.map((img, i) => (
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
                    <div className="row g-2">

                      {/* Product Name */}
                      <div className="col-md-4">
                        <label className="form-label mb-1">Product Name</label>
                        <input
                          className="form-control form-control-sm"
                          value={selectedProduct.name}
                          onChange={(e) =>
                            setSelectedProduct({ ...selectedProduct, name: e.target.value })
                          }
                        />
                      </div>

                      {/* SKU */}
                      <div className="col-md-4">
                        <label className="form-label mb-1">SKU</label>
                        <input
                          className="form-control form-control-sm"
                          value={selectedProduct.sku}
                          onChange={(e) =>
                            setSelectedProduct({ ...selectedProduct, sku: e.target.value })
                          }
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label mb-1">HSN</label>
                        <input
                          className="form-control form-control-sm"
                          value={selectedProduct.hsn}
                          onChange={(e) =>
                            setSelectedProduct({ ...selectedProduct, hsn: e.target.value })
                          }
                        />
                      </div>

                      {/* Category */}
                      <div className="col-md-6">
                        <label className="form-label mb-1">Category</label>

                        <select
                          className="form-select form-select-sm"
                          value={selectedProduct.category || ""}
                          onChange={(e) => {
                            setSelectedProduct({
                              ...selectedProduct,
                              category: e.target.value,
                              subCategory: "", // ✅ reset subcategory when category changes
                            });
                          }}
                        >
                          <option value="">Select Category</option>
                          {categoryList.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label mb-1">Subcategory</label>

                        <select
                          className="form-select form-select-sm"
                          value={selectedProduct.subCategory || ""}
                          onChange={(e) =>
                            setSelectedProduct({ ...selectedProduct, subCategory: e.target.value })
                          }
                          disabled={!selectedProduct.category}
                        >
                          <option value="">Select Subcategory</option>

                          {subCategoryList.map((sc) => (
                            <option key={sc} value={sc}>
                              {sc}
                            </option>
                          ))}
                        </select>
                      </div>


                      {/* Stock */}
                      <div className="col-md-4">
                        <label className="form-label mb-1">Stock</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={selectedProduct.stock}
                          onChange={(e) =>
                            setSelectedProduct({
                              ...selectedProduct,
                              stock: Number(e.target.value),
                            })
                          }
                        />
                      </div>

                      {/* Price */}
                      <div className="col-md-4">
                        <label className="form-label mb-1">Price</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={selectedProduct.price}
                          onChange={(e) =>
                            setSelectedProduct({
                              ...selectedProduct,
                              price: Number(e.target.value),
                            })
                          }
                        />
                      </div>

                      {/* Status */}
                      <div className="col-md-4">
                        <label className="form-label mb-1">Status</label>
                        <select
                          className="form-select form-select-sm"
                          value={selectedProduct.status}
                          onChange={(e) =>
                            setSelectedProduct({ ...selectedProduct, status: e.target.value })
                          }
                        >
                          <option value="Available">Available</option>
                          <option value="Out of Stock">Out of Stock</option>
                        </select>
                      </div>

                      {/* Feature Image (FILE + PATH DISPLAY) */}
                      <div className="col-12">
                        <label className="form-label mb-1">Feature Image</label>
                        <input
                          type="file"
                          className="form-control form-control-sm"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setSelectedProduct({
                                ...selectedProduct,
                                featureImage: file,
                              });
                            }
                          }}
                        />

                        <small className="text-muted">
                          Selected :
                          {" "}
                          {selectedProduct.featureImage
                            ? selectedProduct.featureImage instanceof File
                              ? selectedProduct.featureImage.name
                              : selectedProduct.featureImage
                            : "No image selected"}
                        </small>
                      </div>

                      {/* Gallery Images (FILE + PATH DISPLAY) */}
                      <div className="col-12">
                        <label className="form-label mb-1">Gallery Images</label>

                        {(selectedProduct.images || []).map((img, index) => (
                          <div
                            key={index}
                            className="d-flex align-items-center gap-2 mb-1"
                          >
                            {/* File picker */}
                            <input
                              type="file"
                              className="form-control form-control-sm"
                              style={{ width: 400 }}   // 🔒 fixed width
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  const newImages = [...selectedProduct.images];
                                  newImages[index] = file;
                                  setSelectedProduct({
                                    ...selectedProduct,
                                    images: newImages,
                                  });
                                }
                              }}
                            />

                            {/* Path / filename */}
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              readOnly
                              style={{
                                width: 360,            // 🔒 fixed width
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                              title={
                                img
                                  ? img instanceof File
                                    ? img.name
                                    : img
                                  : "No image"
                              }
                              value={
                                img
                                  ? img instanceof File
                                    ? img.name
                                    : img
                                  : "No image"
                              }
                            />

                            {/* Remove */}
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => {
                                const newImages = selectedProduct.images.filter(
                                  (_, i) => i !== index
                                );
                                setSelectedProduct({
                                  ...selectedProduct,
                                  images: newImages,
                                });
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}

                        <button
                          className="btn btn-sm btn-outline-primary mt-1"
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
                    <button className="btn btn-sm btn-primary" onClick={saveChanges}>
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
  );
};

export default Page;
