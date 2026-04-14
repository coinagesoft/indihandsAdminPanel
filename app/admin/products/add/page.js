"use client";
import React, { useState, useEffect } from "react";
import ProtectedRoute from '../../../../components/ProtectedRoute'
import ConfirmDialog from "../../../../components/ConfirmDialog";
import { showSuccess, showError } from "../../../../lib/toast";
import { useFetchWithLoader } from "../../../../lib/fetchWithLoader";


const Page = () => {
  const [featuredPreview, setFeaturedPreview] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [excelFile, setExcelFile] = useState(null);
  const [status, setStatus] = useState("Available");
  const [stockQty, setStockQty] = useState(0);
  const [publishing, setPublishing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [basePrice, setBasePrice] = useState("");
  const fetchWithLoader = useFetchWithLoader();

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
  const uploadToCloudinary = async (file) => {
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", "products");

      console.log("➡️ Cloudinary request start...");

      const res = await fetchWithLoader("https://api.cloudinary.com/v1_1/dxb1whlam/image/upload", {
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

  const handleStatusChange = (e) => {
    const value = e.target.value;
    setStatus(value);

    if (value === "Out of Stock") {
      setStockQty(0); // auto fix
    }
  };

  const handleStockChange = (e) => {
    const val = e.target.value;

    // allow empty while typing
    if (val === "") {
      setStockQty("");
      return;
    }

    const qty = Number(val);
    setStockQty(qty);
  };

  // Publish single product


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (publishing) return;
    setPublishing(true);

    try {
      const form = e.target;

      const status = form.status.value;

      const rawStock = form.stockQty.value;
      const stockQty = rawStock === "" ? null : Number(rawStock);

      if (status === "Available" && (!stockQty || stockQty <= 0)) {
        showError("If status is Available, inventory must be greater than 0");
        return;
      }

      if (status === "Out of Stock" && stockQty > 0) {
        showError("If status is Out of Stock, inventory must be 0");
        return;
      }

      let featuredImageUrl = null;
      if (form.featuredImage.files[0]) {
        featuredImageUrl = await uploadToCloudinary(form.featuredImage.files[0]);
      }

      const galleryUrls = [];
      for (const file of Array.from(form.galleryImages.files)) {
        const url = await uploadToCloudinary(file);
        galleryUrls.push(url);
      }

      const price = form.basePrice.value.trim();

      // strict validation
      const finalRegex = /^\d+(-\d+)?$/;

      if (!price) {
        showError("Price is required");
        setPublishing(false);
        return;
      }

      if (!finalRegex.test(price)) {
        showError("Enter valid price (e.g. 100 or 100-200)");
        setPublishing(false);
        return;
      }


      const body = {
        product_name: form.productName.value.trim(),
        sku: form.sku.value.trim(),
        barcode: form.barcode.value.trim(),
        description: form.description.value,
        hsn: form.hsn.value.trim(),
        size: form.size.value.trim(),
        weight: form.weight.value.trim(),
        stock: Number(form.stockQty.value),
        price: form.basePrice.value.trim(),
        status: form.status.value,
        featuredImage: featuredImageUrl,
        images: galleryUrls,

          // ✅ ADD THIS
  cgst_rate: Number(form.cgst.value || 0),
  sgst_rate: Number(form.sgst.value || 0),
  igst_rate: Number(form.igst.value || 0),
      };

      const res = await fetchWithLoader("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        showError("❌ " + (data?.message || data?.error || "Failed to create product"));
        return;
      }

      showSuccess("Product created");

      e.target.reset();
      setFeaturedPreview(null);
      setGalleryPreviews([]);
      setStockQty(0);
      setStatus("Available");
      setBasePrice("");

    } catch (err) {
      console.error(err);
      showError("❌ Failed to publish");
    } finally {
      setPublishing(false);  // ✅ enable button again
    }
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;

    // allow only numbers and one dash
    const regex = /^\d*(-\d*)?$/;

    if (regex.test(value)) {
      setBasePrice(value);
    }
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
    if (!excelFile) return showError("Please select an Excel file");

    const XLSX = await import("xlsx");
    const reader = new FileReader();

    reader.onload = async (evt) => {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) return showError("Excel is empty");

  const mapped = jsonData.map((x, index) => ({
  id: x["ID"], // ✅ ADD THIS

  productName: x["Product Name"]?.toString().trim() || "",
  sku: x["SKU"]?.toString().trim() || "",
  barcode: x["Barcode"]?.toString().trim() || "",
  hsn: x["HSN"]?.toString().trim() || "",
  size: x["Size"]?.toString().trim() || "",
  weight: x["Weight"]?.toString().trim() || "",
  description: x["Description"]?.toString().trim() || "",
  stockQty: x["Stock Qty"] !== undefined ? Number(x["Stock Qty"]) : null,
basePrice: x["Base Price"]?.toString().trim() || "",
  cgst: x["CGST"],
  sgst: x["SGST"],
  igst: x["IGST"],
}));


      setProducts(mapped);

      const res = await fetchWithLoader("/api/products/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: mapped }),
      });

      const result = await res.json();

      console.log("excel data", result)
      if (!res.ok) return showError("❌ " + result.message);
      showError(result.message);
    };

    reader.readAsBinaryString(excelFile);
  };
  const handleDiscard = () => {
    // reset form fields
    const form = document.querySelector("form");
    form?.reset();

    // reset states
    setFeaturedPreview(null);
    setGalleryPreviews([]);
    setStockQty(0);
    setStatus("Available");
    setExcelFile(null);
    setProducts([]);
  };


  return (
    <ProtectedRoute>
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
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleDiscard}
              >
                Discard
              </button>
              <button
                type="submit"
                className="btn btn-orange "
                disabled={publishing}
              >
                {publishing ? "Publishing..." : "Publish Product"}
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
            {Object.keys(products[0]).map((key) => (
              key !== "__row" && ( // optional: skip debug field
                <th key={key}>{key}</th>
              )
            ))}
          </tr>
        </thead>

        <tbody>
          {products.map((p, idx) => (
            <tr key={idx}>
              {Object.keys(p).map((key) => (
                key !== "__row" && (
                  <td key={key}>
                    {p[key] !== undefined && p[key] !== ""
                      ? p[key].toString()
                      : "-"}
                  </td>
                )
              ))}
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

                  <div className="row gx-3 mt-4">
  <div className="col">
    <div className="form-floating form-floating-outline">
      <input
        type="number"
        step="0.01"
        className="form-control"
        name="cgst"
        placeholder="CGST %"
      />
      <label>CGST (%)</label>
    </div>
  </div>

  <div className="col">
    <div className="form-floating form-floating-outline">
      <input
        type="number"
        step="0.01"
        className="form-control"
        name="sgst"
        placeholder="SGST %"
      />
      <label>SGST (%)</label>
    </div>
  </div>

  <div className="col">
    <div className="form-floating form-floating-outline">
      <input
        type="number"
        step="0.01"
        className="form-control"
        name="igst"
        placeholder="IGST %"
      />
      <label>IGST (%)</label>
    </div>
  </div>
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
                      type="text"
                      className="form-control"
                      name="basePrice"
                      placeholder="Base Price (e.g. 100 or 100-200)"
                      value={basePrice}
                      onChange={handlePriceChange}
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



                  <div className="form-floating form-floating-outline">
                    <select
                      className="form-select"
                      name="status"
                      value={status}
                      onChange={handleStatusChange}
                    >
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
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      name="stockQty"
                      placeholder="Stock Quantity"
                      value={stockQty}
                      onChange={handleStockChange}
                      onBlur={() => {
                        if (stockQty === 0 || stockQty === "") {
                          setStatus("Out of Stock");
                        } else {
                          setStatus("Available");
                        }
                      }}
                      disabled={status === "Out of Stock"}
                      required
                    />
                    <label>Stock Quantity</label>
                  </div>

                  <small className="text-muted d-block mt-2">Stock status will be managed automatically.</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      <ConfirmDialog
        open={confirmOpen}
        title="Confirm Action"
        message={confirmMsg}
        confirmText="Yes"
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
