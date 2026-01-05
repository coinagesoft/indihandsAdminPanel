import React from "react";

const Page = () => {
  return (
    <form className="container-xxl flex-grow-1 container-p-y">
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
            <button type="submit" className="btn btn-primary">
              Publish Product
            </button>
          </div>
        </div>

        <div className="row">
          {/* LEFT */}
          <div className="col-12 col-lg-8">
            {/* Product Info */}
            <div className="card mb-6">
              <div className="card-header">
                <h5 className="mb-0">Product Information</h5>
              </div>
              <div className="card-body">
                <div className="form-floating form-floating-outline mb-5">
                  <input
                    type="text"
                    className="form-control"
                    id="productName"
                    placeholder="Product Name"
                  />
                  <label htmlFor="productName">Product Name</label>
                </div>

                <div className="row gx-5">
                  <div className="col">
                    <div className="form-floating form-floating-outline">
                      <input
                        type="text"
                        className="form-control"
                        id="productSku"
                        placeholder="SKU"
                      />
                      <label htmlFor="productSku">SKU</label>
                    </div>
                  </div>
                  <div className="col">
                    <div className="form-floating form-floating-outline">
                      <input
                        type="text"
                        className="form-control"
                        id="productBarcode"
                        placeholder="Barcode"
                      />
                      <label htmlFor="productBarcode">Barcode</label>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <p>Description (Optional)</p>
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="Product description"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="card mb-6">
              <div className="card-header">
                <h5 className="mb-0">Product Images</h5>
              </div>
              <div className="card-body">
                <div className="dropzone needsclick text-center p-5 border rounded">
                  <i className="ri-upload-2-line ri-32px mb-2"></i>
                  <p className="mb-1">Drag & drop images here</p>
                  <small className="text-muted">or click to browse</small>
                  <input type="file" className="form-control mt-3" multiple />
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="card mb-6">
              <div className="card-header">
                <h5 className="mb-0">Inventory</h5>
              </div>
              <div className="card-body">
                <div className="form-floating form-floating-outline">
                  <input
                    type="number"
                    className="form-control"
                    id="stockQty"
                    placeholder="Stock Quantity"
                  />
                  <label htmlFor="stockQty">Stock Quantity</label>
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
                <div className="form-floating form-floating-outline mb-4">
                  <input
                    type="number"
                    className="form-control"
                    id="basePrice"
                    placeholder="Base Price"
                  />
                  <label htmlFor="basePrice">Base Price (Admin)</label>
                </div>
                <small className="text-muted">
                  Client-specific pricing will be managed separately.
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
                  <select className="form-select" id="category">
                    <option value="">Select Category</option>
                    <option>Electronics</option>
                    <option>Eco Friendly</option>
                    <option>Office Supplies</option>
                  </select>
                  <label htmlFor="category">Category</label>
                </div>
                <div className="form-floating form-floating-outline mb-4">
                  <select className="form-select" id="type">
                    <option value="">Select Type</option>
                    <option>Festive</option>
                    <option>Onboarding</option>
                    <option>Corporate Gifting</option>
                  </select>
                  <label htmlFor="type">Product Type</label>
                </div>


                <div className="form-floating form-floating-outline">
                  <select className="form-select" id="status">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <label htmlFor="status">Status</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Page;
