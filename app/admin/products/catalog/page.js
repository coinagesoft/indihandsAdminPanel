"use client";

import React, { useState, useEffect } from "react";

const Page = () => {
  const [catalogs, setCatalogs] = useState([]);
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [loading, setLoading] = useState(false);


  /* ===================== CATALOG MODAL STATE ===================== */
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [editingCatalog, setEditingCatalog] = useState(null);
  const [catalogName, setCatalogName] = useState("");
  const [catalogDesc, setCatalogDesc] = useState("");
  const [catalogImagePreview, setCatalogImagePreview] = useState(null);
const [catPage, setCatPage] = useState(1);
const catItemsPerPage = 5;

  const [allProducts, setAllProducts] = useState([]);          // modal साठी
  const [catalogProducts, setCatalogProducts] = useState([]);  // table साठी

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
    setCatalogImagePreview(catalog.image || null);
    setIsCatalogModalOpen(true);
  };
  const handleCatalogImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCatalogImageFile(file);
    setCatalogImagePreview(URL.createObjectURL(file));
  };
const uploadCatalogToCloudinary = async (file) => {
  try {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", "catalogs"); // must be unsigned

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dxb1whlam/image/upload",
      { method: "POST", body: fd }
    );

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData?.error?.message || "Upload failed");
    }

    const data = await res.json();
    return data.secure_url;
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
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
      if (!catalogName.trim()) return alert("❌ Catalog name required");

      let imageUrl = editingCatalog?.image || null;

      // ✅ upload only if new file selected
      if (catalogImageFile instanceof File) {
        imageUrl = await uploadCatalogToCloudinary(catalogImageFile);
      }

      const body = {
        name: catalogName,
        description: catalogDesc || null,
        featured_image: imageUrl,
      };

      let res;

      if (editingCatalog) {
        // ✅ PATCH
        res = await fetch(`/api/products/${editingCatalog.id}/catalogs`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        // ✅ POST
        res = await fetch("/api/catalogs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Save failed");

      alert("✅ Catalog saved successfully!");

      await fetchCatalogs();

      setIsCatalogModalOpen(false);
      setEditingCatalog(null);
      setCatalogName("");
      setCatalogDesc("");
      setCatalogImagePreview(null);
      setCatalogImageFile(null);
    } catch (err) {
      console.error("Save catalog error:", err);
      alert("❌ " + err.message);
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
  console.log("id",catalogId)
  const res = await fetch(`/api/catalogs/${catalogId}/products`);
  const data = await res.json();
  console.log("catpro",data)
  setCatalogProducts(data.products || []);
};
  const addSelectedProductsToCatalog = async () => {
    try {
      if (!selectedCatalog?.id) return alert("Select catalog first");
      if (selectedProductsToAdd.length === 0) return alert("Select products first");

      const res = await fetch(`/api/catalogs/${selectedCatalog.id}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: selectedProductsToAdd }),
      });

      const data = await res.json();
      console.log("selectedcat")
      if (!res.ok) throw new Error(data.message || "Failed to add products");

      alert("✅ Products added to catalog");

      setIsAddExistingModalOpen(false);
      setSelectedProductsToAdd([]);

      // ✅ refresh products list (if your product list shows catalog mapping)
 await fetchCatalogProducts(selectedCatalog.id);
    } catch (err) {
      console.error("Add products to catalog error:", err);
      alert("❌ " + err.message);
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

      const res = await fetch(`/api/catalogs/${selectedCatalog.id}/products`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Remove failed");

      alert("✅ Product removed from catalog");

      await fetchCatalogProducts(selectedCatalog.id);
    } catch (err) {
      console.error("Remove product error:", err);
      alert("❌ " + err.message);
    }
  };


  const fetchCatalogs = async () => {
    try {
      const res = await fetch("/api/catalogs");
      const data = await res.json();

      const formatted = (data.catalogs || []).map((c) => ({
        id: c.id,
        name: c.name,
        desc: c.description || "",
        image: c.featured_image || "",
      }));
   console.log("cat",data)
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

      const res = await fetch(`/api/products?${params.toString()}`);
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


const deleteCatalog = async (catalogId) => {
  if (!confirm("Are you sure?")) return;

  const res = await fetch(`/api/catalogs/${catalogId}`, {
    method: "DELETE",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);

  alert("✅ Catalog deleted");
  fetchCatalogs();
};



  useEffect(() => {
    fetchCatalogs()
    fetchAllProducts();
  }, []);

  const totalCatPages = Math.ceil(catalogProducts.length / catItemsPerPage);

const paginatedCatalogProducts = catalogProducts.slice(
  (catPage - 1) * catItemsPerPage,
  catPage * catItemsPerPage
);

  /* ===================== UI ===================== */
  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      {/* ===================== CATALOGS ===================== */}
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
      paddingTop: "75%", // maintain aspect ratio (4:3)
      position: "relative",
      overflow: "hidden",
      borderTopLeftRadius: "12px",
      borderTopRightRadius: "12px",
    }}
  >
    {c.image ? (
      <img
        src={c.image}
        alt={c.name}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover", // ensures full coverage
          transition: "transform 0.3s",
        }}
      />
    ) : (
      <div
        className="bg-light d-flex justify-content-center align-items-center text-muted"
        style={{ height: "100%", position: "absolute", top: 0, left: 0 }}
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
        deleteCatalog(c.id);
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
        <div className="card-header d-flex justify-content-between">
          <h5 className="mb-0">
            Products in "{selectedCatalog?.name || "Select Catalog"}"
          </h5>
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
              {paginatedCatalogProducts.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{p.subCategory}</td>
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
                      onClick={() => removeProductFromCatalog(p.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
        </div>

        {totalCatPages > 1 && (
  <div className="d-flex justify-content-center align-items-center mt-3 mb-2 gap-2 flex-wrap">
    <button
      className="btn btn-outline-secondary btn-sm"
      disabled={catPage === 1}
      onClick={() => setCatPage((prev) => prev - 1)}
    >
      Prev
    </button>

    {Array.from({ length: totalCatPages }, (_, i) => (
      <button
        key={i}
        className={`btn btn-sm ${
          catPage === i + 1 ? "btn-primary" : "btn-outline-primary"
        }`}
        onClick={() => setCatPage(i + 1)}
      >
        {i + 1}
      </button>
    ))}

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
                      {allProducts
                        .filter((p) => !catalogProducts.some((cp) => cp.id === p.id))
                        .map((p) => (
                          <tr key={p.id}>
                            <td>
                              <input
                                type="checkbox"
                                checked={selectedProductsToAdd.includes(p.id)}
                                onChange={() => toggleProductSelection(p.id)}
                              />
                            </td>

                            <td className="text-truncate" style={{ maxWidth: "200px" }}>
                              {p.name}
                            </td>

                            <td className="text-truncate" style={{ maxWidth: "150px" }}>
                              {p.category}
                            </td>

                            <td className="text-truncate" style={{ maxWidth: "150px" }}>
                              {p.subCategory}
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
