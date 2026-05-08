"use client";
import React, { useEffect, useMemo, useState } from "react";
import ProtectedRoute from '../../../../components/ProtectedRoute'
import ConfirmDialog from "../../../../components/ConfirmDialog";
import { showSuccess, showError } from "../../../../lib/toast";
import { useFetchWithLoader } from "../../../../lib/fetchWithLoader";

const OrgPricingPage = () => {

  const [products, setProducts] = useState([]);
  const [pricing, setPricing] = useState([]);
  const fetchWithLoader = useFetchWithLoader();
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [loading, setLoading] = useState(false);
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
      const res = await fetchWithLoader("/api/cust_pricing");
      const data = await res.json();
       console.log("org",data)
      if (!res.ok) {
        return showError("❌ " + (data.message || "Failed to load pricing data"));
      }

    
      setProducts(data.products || []);
     setPricing(
  (data.pricing || []).map((x) => ({
    productId: x.productId,
    price:
      x.price == null
        ? ""
        : x.price,
  }))
);
    } catch (err) {
      showError("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };


const handleFieldChange = (
  productId,
  value
) => {

  setPricing((prev) => {

    const existing = prev.find(
      (p) =>
        p.productId === productId
    );

    if (existing) {

      return prev.map((p) =>

        p.productId === productId
          ? {
              ...p,
              price: value,
            }
          : p
      );
    }

    return [
      ...prev,
      {
        productId,
        price: value,
      },
    ];
  });
};



const getPrice = (
  productId
) => {

  const entry = pricing.find(
    (p) =>
      p.productId === productId
  );

  if (
    !entry ||
    entry.price === null ||
    entry.price === undefined
  ) {
    return "";
  }

  return entry.price;
};

const isPriceCustomized = (
  productId,
  basePrice
) => {

  const price =
    getPrice(productId);

  return (
    price !== "" &&
    Number(price) !==
      Number(basePrice)
  );
};

const handleSavePricing = () => {

  setConfirmMsg(
    "Save B2C pricing changes?"
  );

  setConfirmAction(
    () => async () => {

      try {

        setLoading(true);

        const payload = pricing.map(
          (p) => ({

            productId:
              p.productId,

            price:
              p.price === ""
                ? null
                : Number(p.price),
          })
        );

        const res =
          await fetchWithLoader(
            "/api/cust_pricing/save",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                pricing: payload,
              }),
            }
          );

        const data =
          await res.json();

        if (!res.ok) {

          throw new Error(
            data.message ||
            "Save failed"
          );
        }

        showSuccess(
          "B2C pricing saved successfully"
        );

        fetchData();

      } catch (err) {

        showError(err.message);

      } finally {

        setLoading(false);
      }
    }
  );

  setConfirmOpen(true);
};



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

  productId:
    r["Product ID"],

  price:
    r["Custom Price (₹)"],
}));

      const res = await fetchWithLoader("/api/cust_pricing/import", {
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
          <h4 className="mb-0 text-orange">Global B2C Pricing</h4>
          <button className="btn btn-sm btn-outline-orange" onClick={fetchData} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="d-flex justify-content-between align-center">
          {/* Filters */}
          <button
            className="btn btn-orange btn-sm mb-5"
            onClick={() => {
           window.location.href =
  "/api/cust_pricing/export";
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
       {!loading && products.length === 0 && (
          <div className="alert alert-warning">
            No organizations found.
          </div>
        )}

        {/* Pricing Tables */}
       <div className="card mb-4">
          <div  className="card mb-4">
            <div className="card-header bg-label-primary d-flex justify-content-between align-items-center">
              <div>
               <h5 className="mb-0">
  Global B2C Pricing
</h5>
                {/* <small className="text-muted">GST: {org.gst || "-"}</small> */}
              </div>

              <button
                className="btn btn-sm btn-orange"
              onClick={handleSavePricing}
               disabled={loading}
              >
                {loading ? "Saving..." : "Save Pricing"}
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
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedProducts.map((product) => {
const customized = isPriceCustomized(
  product.id,
  product.basePrice
);
                          return (
                            <tr key={product.id}>
                              <td>{product.name}</td>
                              <td>₹{product.basePrice}</td>
                              <td>
                                <input
                                  type="number"
                                  className={`form-control ${customized ? "border-primary" : ""}`}
                                  value={getPrice(
                                         product.id
                                       )}
                                  onChange={(e) =>
                                   handleFieldChange(
                                     product.id,
                                     e.target.value
                                   )
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
        </div>
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
