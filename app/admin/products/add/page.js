"use client";
import React, { useState, useEffect } from "react";

const Page = () => {
  const [featuredPreview, setFeaturedPreview] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [excelFile, setExcelFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subcategories, setSubcategories] = useState([]);

  const handleFeaturedChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFeaturedPreview(URL.createObjectURL(file));
    }
  };
  useEffect(() => {
    const fetchCategories = async () => {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    };

    fetchCategories();
  }, []);

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);

    const selected = categories.find(c => c.name === value);
    setSubcategories(selected?.subcategories || []);
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setGalleryPreviews(previews);
  };

  const handleExcelChange = (e) => {
    const file = e.target.files[0];
    if (file) setExcelFile(file);
  };
  const uploadToCloudinary = async (file) => {
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", "products");

      console.log("➡️ Cloudinary request start...");

      const res = await fetch("https://api.cloudinary.com/v1_1/dxb1whlam/image/upload", {
        method: "POST",
        body: fd,
      });

      console.log("✅ Cloudinary status:", res.status);

      const data = await res.json();
      console.log("✅ Cloudinary response:", data);

      if (!res.ok) throw new Error(data?.error?.message || "Cloudinary upload failed");

      return data.secure_url;
    } catch (err) {
      console.error("❌ Cloudinary upload failed:", err);
      throw err;
    }
  };

  // Publish single product
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;

    let featuredImageUrl = null;
    if (form.featuredImage.files[0]) {
      featuredImageUrl = await uploadToCloudinary(form.featuredImage.files[0]);
    }

    const galleryUrls = [];
    for (const file of Array.from(form.galleryImages.files)) {
      const url = await uploadToCloudinary(file);
      galleryUrls.push(url);
    }

    const body = {
      product_name: form.productName.value.trim(),
      sku: form.sku.value.trim(),
      barcode: form.barcode.value.trim(),           // ✅ added
      description: form.description.value.trim(),   // ✅ added

      category: form.category.value,
      subCategory: form.subCategory.value,

      hsn: form.hsn.value.trim(),
      size: form.size.value.trim(),     // ✅ ADD
      weight: form.weight.value.trim(),                 // ✅ added
      stock: Number(form.stockQty.value),
      price: Number(form.basePrice.value),

      status: form.status.value,                    // ✅ fixed (no "active" check)

      featuredImage: featuredImageUrl,
      images: galleryUrls,
    };

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      alert("❌ " + (data?.message || data?.error || "Failed to create product"));
      return;
    }

    alert("✅ Product created");
  };




  // --- helper to convert file to base64
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });
  }


  const handleExcelImport = async () => {
    if (!excelFile) return alert("Please select an Excel file");

    const XLSX = await import("xlsx");
    const reader = new FileReader();

    reader.onload = async (evt) => {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) return alert("Excel empty आहे");

    const mapped = jsonData.map((x, index) => ({
  productName: x["Product Name"]?.toString().trim() || "",
  sku: x["SKU"]?.toString().trim() || "",
  barcode: x["Barcode"]?.toString().trim() || "",
  category: x["Category"]?.toString().trim() || "",
  subCategory: x["Sub Category"]?.toString().trim() || "",
  hsn: x["HSN"]?.toString().trim() || "",
  size: x["Size"]?.toString().trim() || "",
  weight: x["Weight"]?.toString().trim() || "",
  description: x["Description"]?.toString().trim() || "",
  stockQty: Number(x["Stock Qty"] ?? 0),
  basePrice: Number(x["Base Price"] ?? 0),
  status: x["Status"]?.toString().trim() || "Available",

  // 🔍 helpful for debugging
  __row: index + 2,
}));


      setProducts(mapped);

      const res = await fetch("/api/products/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: mapped }),
      });

      const result = await res.json();

      console.log("excel data", result)
      if (!res.ok) return alert("❌ " + result.message);
      alert(result.message);
    };

    reader.readAsBinaryString(excelFile);
  };



  return (
    <form
      className="container-xxl flex-grow-1 container-p-y"
      onSubmit={handleSubmit}
    >
      <div className="app-ecommerce">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-6 row-gap-4">
          <div>
            <h4 className="mb-1">Add New Product</h4>
            <p className="mb-0">Create product for RFQ & proposal flow</p>
          </div>
          <div className="d-flex gap-3">
            <button type="button" className="btn btn-outline-secondary">
              Discard
            </button>
            <button type="submit" className="btn btn-publish">
              Publish Product
            </button>
          </div>
        </div>

        {/* Excel Import Section */}
        <div className="card mb-6">
          <div className="card-header">
            <h5 className="mb-0">Import Products from Excel</h5>
          </div>
          <div className="card-body">
            <input
              type="file"
              accept=".xlsx,.xls"
              className="form-control mb-3"
              onChange={handleExcelChange}
            />
            <button
              type="button"
              className="btn  btn-orange"
              onClick={handleExcelImport}
            >
              Publish Excel Products
            </button>
          </div>
        </div>

        {/* Show Imported Products */}
        {products.length > 0 && (
          <div className="card mb-6">
            <div className="card-header">Imported Products</div>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Subcategory</th>
                    <th>HSN</th>
                    <th>Size</th>
                    <th>Weight</th>
                    <th>Stock</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, idx) => (
                    <tr key={idx}>
                      <td>{p.productName}</td>
                      <td>{p.sku}</td>
                      <td>{p.category}</td>
                      <td>{p.subCategory}</td>
                      <td>{p.hsn}</td>
                      <td>{p.size || "-"}</td>
                      <td>{p.weight || "-"}</td>
                      <td>{p.stockQty}</td>
                      <td>₹{p.basePrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Original Form Sections */}
        <div className="row">
          {/* LEFT */}
          <div className="col-12 col-lg-8">
            {/* Product Information */}
            <div className="card mb-6">
              <div className="card-header">
                <h5 className="mb-0">Product Information</h5>
              </div>
              <div className="card-body">
                <div className="form-floating form-floating-outline mb-5">
                  <input
                    type="text"
                    className="form-control"
                    name="productName"
                    placeholder="Product Name"
                    required
                  />
                  <label>Product Name</label>
                </div>

                <div className="row gx-5">
                  <div className="col">
                    <div className="form-floating form-floating-outline">
                      <input
                        type="text"
                        className="form-control"
                        name="sku"
                        placeholder="SKU"
                      />
                      <label>SKU</label>
                    </div>
                  </div>
                  <div className="col">
                    <div className="form-floating form-floating-outline">
                      <input
                        type="text"
                        className="form-control"
                        name="barcode"
                        placeholder="Barcode (Optional)"
                      />
                      <label>Barcode</label>
                    </div>
                  </div>
                </div>
                <div className="form-floating form-floating-outline mt-4">
                  <input
                    type="text"
                    className="form-control"
                    name="hsn"
                    placeholder="HSN Code"
                  />
                  <label>HSN Code</label>
                </div>
                <div className="row gx-5 mt-4">
                  <div className="col">
                    <div className="form-floating form-floating-outline">
                      <input
                        type="text"
                        className="form-control"
                        name="size"
                        placeholder="Size (e.g. 12x10 inch, Large)"
                      />
                      <label>Size</label>
                    </div>
                  </div>

                  <div className="col">
                    <div className="form-floating form-floating-outline">
                      <input
                        type="text"
                        className="form-control"
                        name="weight"
                        placeholder="Weight (e.g. 1.5 kg, 800 g)"
                      />
                      <label>Weight</label>
                    </div>
                  </div>
                </div>



                <div className="mt-5">
                  <p>Description (Optional)</p>
                  <textarea
                    className="form-control"
                    rows={4}
                    name="description"
                    placeholder="Product description"
                  />
                </div>
              </div>
            </div>

            {/* Product Images */}
            <div className="card mb-6">
              <div className="card-header">
                <h5 className="mb-0">Product Images</h5>
              </div>
              <div className="card-body">
                {/* Featured Image */}
                <div className="mb-4">
                  <label className="form-label">Featured Image</label>
                  <input
                    type="file"
                    className="form-control"
                    name="featuredImage"
                    accept="image/*"
                    onChange={handleFeaturedChange}
                  />
                  {featuredPreview && (
                    <img
                      src={featuredPreview}
                      alt="Featured Preview"
                      className="mt-2"
                      style={{
                        width: "120px",
                        height: "120px",
                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                    />
                  )}
                </div>

                {/* Gallery Images */}
                <div className="border rounded p-4 text-center">
                  <p className="mb-1 fw-medium">Additional Images</p>
                  <small className="text-muted">Multiple images allowed</small>
                  <input
                    type="file"
                    className="form-control mt-3"
                    name="galleryImages"
                    multiple
                    accept="image/*"
                    onChange={handleGalleryChange}
                  />
                  {galleryPreviews.length > 0 && (
                    <div className="d-flex flex-wrap mt-3 gap-2 justify-content-center">
                      {galleryPreviews.map((src, idx) => (
                        <img
                          key={idx}
                          src={src}
                          alt={`Gallery Preview ${idx + 1}`}
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                            borderRadius: "4px",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>



          </div>

          {/* RIGHT */}
          <div className="col-12 col-lg-4">
            {/* Pricing */}
            <div className="card mb-6">
              <div className="card-header">
                <h5 className="mb-0">Base Pricing</h5>
              </div>
              <div className="card-body">
                <div className="form-floating form-floating-outline mb-3">
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    name="basePrice"
                    placeholder="Base Price"
                    required
                  />
                  <label>Base Price (Admin)</label>
                </div>
                <small className="text-muted">
                  Client pricing will be handled during RFQ.
                </small>
              </div>
            </div>

            {/* Organize */}
            <div className="card mb-6">
              <div className="card-header">
                <h5 className="mb-0">Organize</h5>
              </div>
              <div className="card-body">
                <div className="form-floating form-floating-outline mb-4">
                  <select
                    className="form-select"
                    name="category"
                    required
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <label>Category</label>
                </div>

                <div className="form-floating form-floating-outline mb-4">
                  <select className="form-select" name="subCategory">
                    <option value="">Select SubCategory</option>
                    {subcategories.map(sc => (
                      <option key={sc.name} value={sc.name}>
                        {sc.name}
                      </option>
                    ))}
                  </select>

                  <label>Sub Category</label>
                </div>

                <div className="form-floating form-floating-outline">
                  <select className="form-select" name="status">
                    <option value="Available">Available</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                  <label>Status</label>
                </div>

              </div>

            </div>
            {/* Inventory */}
            <div className="card mb-6">
              <div className="card-header"><h5 className="mb-0">Inventory</h5></div>
              <div className="card-body">
                <div className="form-floating form-floating-outline">
                  <input type="number" min="0" className="form-control" name="stockQty" placeholder="Stock Quantity" required />
                  <label>Stock Quantity</label>
                </div>
                <small className="text-muted d-block mt-2">Stock status will be managed automatically.</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Page;
