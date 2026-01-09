"use client";
import React, { useState } from "react";

const Page = () => {
  const [featuredPreview, setFeaturedPreview] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [excelFile, setExcelFile] = useState(null);

  const handleFeaturedChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFeaturedPreview(URL.createObjectURL(file));
    }
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

  // Publish single product
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const featuredImage = formData.get("featuredImage");
    const galleryFiles = e.target.galleryImages.files;
    for (let i = 0; i < galleryFiles.length; i++) {
      formData.append("galleryImages[]", galleryFiles[i]);
    }

    console.log("Single Product Data:");
    console.log({
      productName: formData.get("productName"),
      sku: formData.get("sku"),
      barcode: formData.get("barcode"),
      description: formData.get("description"),
      stockQty: formData.get("stockQty"),
      basePrice: formData.get("basePrice"),
      category: formData.get("category"),
      subCategory: formData.get("subCategory"),
      status: formData.get("status"),
      featuredImage,
      galleryFiles,
    });

    alert("Single product published! Check console for details.");
  };

  // Import products from Excel
  const handleExcelImport = async () => {
    if (!excelFile) return alert("Please select an Excel file");

    // dynamic import to fix Next.js build issue
    const XLSX = await import("xlsx");

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      setProducts((prev) => [...prev, ...jsonData]);
      alert(`${jsonData.length} products imported successfully`);
      console.log("Imported Products:", jsonData);
    };
    reader.readAsBinaryString(excelFile);
  };

  return (
    <form className="container-xxl flex-grow-1 container-p-y" onSubmit={handleSubmit}>
      <div className="app-ecommerce">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-6 row-gap-4">
          <div>
            <h4 className="mb-1">Add New Product</h4>
            <p className="mb-0">Create product for RFQ & proposal flow</p>
          </div>
          <div className="d-flex gap-3">
            <button type="button" className="btn btn-outline-secondary">Discard</button>
            <button type="submit" className="btn btn-primary">Publish Product</button>
          </div>
        </div>

        {/* Excel Import Section */}
        <div className="card mb-6">
          <div className="card-header"><h5 className="mb-0">Import Products from Excel</h5></div>
          <div className="card-body">
            <input
              type="file"
              accept=".xlsx,.xls"
              className="form-control mb-3"
              onChange={handleExcelChange}
            />
            <button
              type="button"
              className="btn btn-success"
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
              <div className="card-header"><h5 className="mb-0">Product Information</h5></div>
              <div className="card-body">
                <div className="form-floating form-floating-outline mb-5">
                  <input type="text" className="form-control" name="productName" placeholder="Product Name" required />
                  <label>Product Name</label>
                </div>

                <div className="row gx-5">
                  <div className="col">
                    <div className="form-floating form-floating-outline">
                      <input type="text" className="form-control" name="sku" placeholder="SKU" />
                      <label>SKU</label>
                    </div>
                  </div>
                  <div className="col">
                    <div className="form-floating form-floating-outline">
                      <input type="text" className="form-control" name="barcode" placeholder="Barcode (Optional)" />
                      <label>Barcode</label>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <p>Description (Optional)</p>
                  <textarea className="form-control" rows={4} name="description" placeholder="Product description" />
                </div>
              </div>
            </div>

            {/* Product Images */}
            <div className="card mb-6">
              <div className="card-header"><h5 className="mb-0">Product Images</h5></div>
              <div className="card-body">
                {/* Featured Image */}
                <div className="mb-4">
                  <label className="form-label">Featured Image</label>
                  <input type="file" className="form-control" name="featuredImage" accept="image/*" onChange={handleFeaturedChange} />
                  {featuredPreview && <img src={featuredPreview} alt="Featured Preview" className="mt-2" style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "4px" }} />}
                </div>

                {/* Gallery Images */}
                <div className="border rounded p-4 text-center">
                  <p className="mb-1 fw-medium">Additional Images</p>
                  <small className="text-muted">Multiple images allowed</small>
                  <input type="file" className="form-control mt-3" name="galleryImages" multiple accept="image/*" onChange={handleGalleryChange} />
                  {galleryPreviews.length > 0 && (
                    <div className="d-flex flex-wrap mt-3 gap-2 justify-content-center">
                      {galleryPreviews.map((src, idx) => (
                        <img key={idx} src={src} alt={`Gallery Preview ${idx + 1}`} style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "4px" }} />
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
              <div className="card-header"><h5 className="mb-0">Base Pricing</h5></div>
              <div className="card-body">
                <div className="form-floating form-floating-outline mb-3">
                  <input type="number" min="0" className="form-control" name="basePrice" placeholder="Base Price" required />
                  <label>Base Price (Admin)</label>
                </div>
                <small className="text-muted">Client pricing will be handled during RFQ.</small>
              </div>
            </div>

            {/* Organize */}
            <div className="card mb-6">
              <div className="card-header"><h5 className="mb-0">Organize</h5></div>
              <div className="card-body">
                <div className="form-floating form-floating-outline mb-4">
                  <select className="form-select" name="category" required>
                    <option value="">Select Category</option>
                    <option>Electronics</option>
                    <option>Eco Friendly</option>
                    <option>Office Supplies</option>
                  </select>
                  <label>Category</label>
                </div>

                <div className="form-floating form-floating-outline mb-4">
                  <select className="form-select" name="subCategory">
                    <option value="">Select Sub Category</option>
                    <option>Festive Gifts</option>
                    <option>Employee Onboarding</option>
                    <option>Corporate Gifting</option>
                  </select>
                  <label>Sub Category</label>
                </div>

                <div className="form-floating form-floating-outline">
                  <select className="form-select" name="status">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
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
