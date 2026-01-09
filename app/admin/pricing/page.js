"use client";
import React, { useState, useMemo } from "react";

const OrgPricingPage = () => {
  const [orgs] = useState([
    { id: 1, name: "Alpha Industries", gst: "27ABCDE1234F1Z5", primaryContact: "Rohit Sharma", email: "rohit@alpha.com", phone: "+911111111111" },
    { id: 2, name: "Beta Enterprises", gst: "27XYZDE6789G1Z2", primaryContact: "Neha Verma", email: "neha@beta.com", phone: "+922222222222" },
    { id: 3, name: "Gamma Solutions", gst: "27LMNOP4567Q1Z9", primaryContact: "Amit Patel", email: "amit@gamma.com", phone: "+933333333333" },
  ]);

  const [products] = useState([
    { id: 1, name: "Product X", basePrice: 100, category: "Electronics", subcategory: "Mobile" },
    { id: 2, name: "Product Y", basePrice: 200, category: "Furniture", subcategory: "Chair" },
    { id: 3, name: "Product Z", basePrice: 150, category: "Electronics", subcategory: "Laptop" },
    { id: 4, name: "Product A", basePrice: 180, category: "Electronics", subcategory: "Mobile" },
    { id: 5, name: "Product B", basePrice: 300, category: "Furniture", subcategory: "Table" },
  ]);

  const [pricing, setPricing] = useState([
    { orgId: 1, productId: 1, price: 90 },
    { orgId: 2, productId: 1, price: 95 },
  ]);

  const [selectedOrg, setSelectedOrg] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 3;

  const handlePriceChange = (orgId, productId, value) => {
    const price = Number(value);
    setPricing(prev => {
      const existing = prev.find(p => p.orgId === orgId && p.productId === productId);
      return existing
        ? prev.map(p => (p.orgId === orgId && p.productId === productId ? { ...p, price } : p))
        : [...prev, { orgId, productId, price }];
    });
  };

  const getOrgPrice = (orgId, productId) => {
    const entry = pricing.find(p => p.orgId === orgId && p.productId === productId);
    return entry ? entry.price : "";
  };

  const isPriceCustomized = (orgId, productId, basePrice) => {
    const price = getOrgPrice(orgId, productId);
    return price !== "" && price !== basePrice;
  };

  const handleSaveOrgPricing = (orgId) => {
    const orgPricing = pricing.filter(p => p.orgId === orgId);
    console.log("Saving pricing for org:", orgId, orgPricing);
    alert("Organization pricing saved successfully");
  };

  const filteredOrgs =
    selectedOrg === "all"
      ? orgs
      : orgs.filter(o => o.id === Number(selectedOrg));

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (selectedProduct !== "all" && p.id !== Number(selectedProduct)) return false;
      if (selectedCategory !== "all" && p.category !== selectedCategory) return false;
      if (selectedSubcategory !== "all" && p.subcategory !== selectedSubcategory) return false;
      if (minPrice !== "" && p.basePrice < Number(minPrice)) return false;
      if (maxPrice !== "" && p.basePrice > Number(maxPrice)) return false;
      return true;
    });
  }, [
    products,
    selectedProduct,
    selectedCategory,
    selectedSubcategory,
    minPrice,
    maxPrice
  ]);

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const categories = ["all", ...new Set(products.map(p => p.category))];
  const subcategories = ["all", ...new Set(products.map(p => p.subcategory))];

  return (
    <div className="container-xxl container-p-y">
      <h4 className="mb-4 text-primary">Organization-Specific Pricing</h4>

      {/* Filters */}
      <div className="row mb-4 g-3 align-items-end">
        <div className="col-md-3">
          <label className="form-label">Organization</label>
          <select className="form-select" value={selectedOrg} onChange={e => setSelectedOrg(e.target.value)}>
            <option value="all">All Organizations</option>
            {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </div>

        <div className="col-md-3">
          <label className="form-label">Product</label>
          <select className="form-select" value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
            <option value="all">All Products</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="col-md-2">
          <label className="form-label">Category</label>
          <select className="form-select" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="col-md-2">
          <label className="form-label">Subcategory</label>
          <select className="form-select" value={selectedSubcategory} onChange={e => setSelectedSubcategory(e.target.value)}>
            {subcategories.map(sc => <option key={sc} value={sc}>{sc}</option>)}
          </select>
        </div>

        <div className="col-md-1">
          <label className="form-label">Min</label>
          <input type="number" className="form-control" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
        </div>

        <div className="col-md-1">
          <label className="form-label">Max</label>
          <input type="number" className="form-control" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
        </div>
      </div>

      {/* Pricing Tables */}
      {filteredOrgs.map(org => (
        <div key={org.id} className="card mb-4">
          <div className="card-header bg-label-primary d-flex justify-content-between">
            <div>
              <h5 className="mb-0">{org.name}</h5>
              <small className="text-muted">GST: {org.gst}</small>
            </div>
            <button className="btn btn-sm btn-primary" onClick={() => handleSaveOrgPricing(org.id)}>
              Save Pricing
            </button>
          </div>

          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Subcategory</th>
                    <th>Base Price</th>
                    <th>Org Price</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map(product => {
                    const customized = isPriceCustomized(org.id, product.id, product.basePrice);
                    return (
                      <tr key={product.id}>
                        <td>{product.name}</td>
                        <td>{product.category}</td>
                        <td>{product.subcategory}</td>
                        <td>₹{product.basePrice}</td>
                        <td>
                          <input
                            type="number"
                            className={`form-control ${customized ? "border-primary" : ""}`}
                            value={getOrgPrice(org.id, product.id)}
                            onChange={e => handlePriceChange(org.id, product.id, e.target.value)}
                          />
                          {customized && <small className="text-primary">Custom price applied</small>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="d-flex justify-content-end gap-2 mt-3">
                <button className="btn btn-sm btn-outline-primary" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
                <span className="align-self-center">Page {currentPage} of {totalPages}</span>
                <button className="btn btn-sm btn-outline-primary" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrgPricingPage;
