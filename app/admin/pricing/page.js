"use client";
import React, { useEffect, useMemo, useState } from "react";
import ProtectedRoute from '../../../components/ProtectedRoute'
import ConfirmDialog from "../../../components/ConfirmDialog";
import { showSuccess, showError } from "../../../lib/toast";
import { useFetchWithLoader } from "../../../lib/fetchWithLoader";

const OrgPricingPage = () => {

  const [orgs, setOrgs] = useState([]);
  const [products, setProducts] = useState([]);
  const [pricing, setPricing] = useState([]);
  const fetchWithLoader = useFetchWithLoader();
  const [selectedOrg, setSelectedOrg] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingOrgId, setSavingOrgId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;

  // ✅ Fetch API data
  useEffect(() => {
    fetchData();
  }, []);


  // ✅ Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedProduct, minPrice, maxPrice]);



  useEffect(() => {
    // This runs only in the browser
    const someObj = window.someObj; // or fetch/init your data

    $.each(someObj?.pages || [], function (i, page) {
      console.log(page);
    });
  }, []);





  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetchWithLoader("/api/org-pricing");
      const data = await res.json();
       console.log("org",data)
      if (!res.ok) {
        return showError("❌ " + (data.message || "Failed to load pricing data"));
      }

      setOrgs(data.companies || []);
      setProducts(data.products || []);
      setPricing(
        (data.pricing || []).map((x) => ({
          orgId: x.companyId,    
          productId: x.productId,
          price: x.price == null ? "" : x.price,
          prefix: x.prefix || "",
        }))
      );
    } catch (err) {
      showError("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle price change
  // const handlePriceChange = (orgId, productId, value) => {
  //   const price = value === "" ? "" : Number(value);

  //   setPricing((prev) => {
  //     const existing = prev.find((p) => p.orgId === orgId && p.productId === productId);

  //     if (existing) {
  //       return prev.map((p) =>
  //         p.orgId === orgId && p.productId === productId ? { ...p, price } : p
  //       );
  //     }

  //     return [...prev, { orgId, productId, price }];
  //   });
  // };

  const handleFieldChange = (orgId, productId, field, value) => {
    setPricing((prev) => {
      const existing = prev.find(
        (p) => p.orgId === orgId && p.productId === productId
      );

      if (existing) {
        return prev.map((p) =>
          p.orgId === orgId && p.productId === productId
            ? { ...p, [field]: value }
            : p
        );
      }

      return [
        ...prev,
        {
          orgId,
          productId,
          price: "",
          prefix: "",
          [field]: value,
        },
      ];
    });
  };

  const getOrgPrefix = (orgId, productId) => {
    const entry = pricing.find(
      (p) => p.orgId === orgId && p.productId === productId
    );
    return entry ? entry.prefix || "" : "";
  };

const getOrgPrice = (orgId, productId) => {
  const entry = pricing.find(
    (p) => p.orgId === orgId && p.productId === productId
  );

  if (!entry || entry.price === null || entry.price === undefined) {
    return "";
  }

  return entry.price;
};

  const isPriceCustomized = (orgId, productId, basePrice) => {
    const price = getOrgPrice(orgId, productId);
    return price !== "" && Number(price) !== Number(basePrice);
  };

  // ✅ Save one org pricing
  const handleSaveOrgPricing = (orgId) => {
    setConfirmMsg("Save pricing changes for this organization?");

    setConfirmAction(() => async () => {
      try {
        setSavingOrgId(orgId);

        const orgPricing = pricing
          .filter((p) => p.orgId === orgId)
          .map((p) => ({
            productId: p.productId,
            price: p.price === "" ? null : Number(p.price),
            prefix: p.prefix?.trim() || null,
          }));

        const res = await fetchWithLoader(`/api/org-pricing/${orgId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pricing: orgPricing }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Save failed");

        showSuccess("Pricing saved successfully");
        fetchData();
      } catch (err) {
        showError(err.message);
      } finally {
        setSavingOrgId(null);
      }
    });

    setConfirmOpen(true);
  };

  // ✅ Filters
  const filteredOrgs =
    selectedOrg === "all" ? orgs : orgs.filter((o) => o.id === Number(selectedOrg));

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedProduct !== "all" && p.id !== Number(selectedProduct)) return false;
      if (minPrice !== "" && Number(p.basePrice) < Number(minPrice)) return false;
      if (maxPrice !== "" && Number(p.basePrice) > Number(maxPrice)) return false;
      return true;
    });
  }, [products, selectedProduct, minPrice, maxPrice]);

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE) || 1;

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  const handleImportPricing = async (file) => {
    const XLSX = await import("xlsx");
    const reader = new FileReader();

    reader.onload = async (e) => {
      const wb = XLSX.read(e.target.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws);

      const cleaned = json.map((r) => ({
        company_id: r["Company ID"],
        product_id: r["Product ID"],
        custom_price: r["Custom Price (₹)"],  // ✅ correct
         prefix: r["Prefix Line No"],
      }));

      const res = await fetchWithLoader("/api/org-pricing/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: cleaned }),
      });

      const data = await res.json();
      if (!res.ok) return showError("❌ " + data.message);

      showSuccess(data.message);
      fetchData();
    };

    reader.readAsBinaryString(file);
  };


  return (
    <ProtectedRoute>
      <div className="container-xxl container-p-y">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0 text-orange">Organization-Specific Pricing</h4>
          <button className="btn btn-sm btn-outline-orange" onClick={fetchData} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="d-flex justify-content-between align-center">
          {/* Filters */}
          <button
            className="btn btn-orange btn-sm mb-5"
            onClick={() => {
              const url =
                selectedOrg === "all"
                  ? "/api/org-pricing/export"
                  : `/api/org-pricing/export?companyId=${selectedOrg}`;

              window.location.href = url;
            }}
          >
            Export Pricing Excel
          </button>

          <div className="mb-3">
            <label htmlFor="importPricing" className="btn btn-sm btn-orange me-2">
              Import Pricing Excel
            </label>
            <input
              type="file"
              id="importPricing"
              accept=".xlsx, .xls"
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files.length) handleImportPricing(e.target.files[0]);
                e.target.value = ""; // reset input so same file can be re-uploaded if needed
              }}
            />
          </div>
        </div>

        <div className="row mb-4 g-3 align-items-end">
          <div className="col-md-4">

            <label className="form-label">Organization</label>
            <select
              className="form-select"
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
            >
              <option value="all">All Organizations</option>
              {orgs.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Product</label>
            <select
              className="form-select"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <option value="all">All Products</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>


          <div className="col-md-2">
            <label className="form-label">Min</label>
            <input
              type="number"
              className="form-control"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Max</label>
            <input
              type="number"
              className="form-control"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>

        {/* Loading State */}
        {/* {loading && (
        <div className="alert alert-info">
          Loading pricing data...
        </div>
      )} */}

        {/* No Orgs */}
        {!loading && filteredOrgs.length === 0 && (
          <div className="alert alert-warning">
            No organizations found.
          </div>
        )}

        {/* Pricing Tables */}
        {filteredOrgs.map((org) => (
          <div key={org.id} className="card mb-4">
            <div className="card-header bg-label-primary d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">{org.name}</h5>
                {/* <small className="text-muted">GST: {org.gst || "-"}</small> */}
              </div>

              <button
                className="btn btn-sm btn-orange"
                onClick={() => handleSaveOrgPricing(org.id)}
                disabled={savingOrgId === org.id}
              >
                {savingOrgId === org.id ? "Saving..." : "Save Pricing"}
              </button>
            </div>

            <div className="card-body">
              {paginatedProducts.length === 0 ? (
                <div className="alert alert-secondary mb-0">
                  No products match filters.
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-bordered align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Product</th>
                          <th>Base Price</th>
                          <th style={{ width: 220 }}>Org Price</th>
                          <th>Prefix Line No</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedProducts.map((product) => {
                          const customized = isPriceCustomized(org.id, product.id, product.basePrice);

                          return (
                            <tr key={product.id}>
                              <td>{product.name}</td>
                              <td>₹{product.basePrice}</td>
                              <td>
                                <input
                                  type="number"
                                  className={`form-control ${customized ? "border-primary" : ""}`}
                                  value={getOrgPrice(org.id, product.id) ?? ""}
                                  onChange={(e) =>
                                    handleFieldChange(org.id, product.id, "price", e.target.value)
                                  }
                                />
                              </td>

                              <td>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="e.g. L No 1"
                                  value={getOrgPrefix(org.id, product.id)}
                                  onChange={(e) =>
                                    handleFieldChange(org.id, product.id, "prefix", e.target.value)
                                  }
                                />
                              </td>


                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-end gap-2 mt-3">
                      <button
                        className="btn btn-sm btn-outline-orange"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                      >
                        Prev
                      </button>
                      <span className="align-self-center">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        className="btn btn-sm btn-outline-orange"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title="Confirm Action"
        message={confirmMsg}
        confirmText="Confirm"
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

export default OrgPricingPage;
