"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Suspense } from "react";
import ProtectedRoute from '../../../../components/ProtectedRoute'
import { showSuccess, showError } from "../../../../lib/toast";
import { useFetchWithLoader } from "../../../../lib/fetchWithLoader";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

const RFQ_STATUSES = ["Submitted", "Under Review", "Accepted", "Rejected"];

const RFQPageInner = () => {
  const [organizations, setOrganizations] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState("all");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [statusLoading, setStatusLoading] = useState(null);
  const searchParams = useSearchParams();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRFQ, setEditingRFQ] = useState(null);
  const rfqIdFromUrl = searchParams.get("rfqId");
  const [productSearch, setProductSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const fetchWithLoader = useFetchWithLoader();
  const [quotationSearch, setQuotationSearch] = useState("");
  const router = useRouter();
  /* ---------------- API ---------------- */

  useEffect(() => {
    fetchRfqs();
  }, []);

  const fetchRfqs = async () => {
    try {
      const res = await fetchWithLoader("/api/rfqs");
      const data = await res.json();
      console.log("rfq", data)
      if (!res.ok) throw new Error(data.message || "Failed to load RFQs");

      setOrganizations(data.organizations || []);
      setRfqs(data.rfqs || []);
    } catch (err) {
      showError("❌ " + err.message);
    }
  };


const searchProducts = async (value) => {

  setProductSearch(value);

  try {

    const res = await fetch(
      `/api/products/search?search=${value}&company_id=${editingRFQ.orgId}`
    );

    const data = await res.json();

    setSearchResults(data.products || []);

  } catch (err) {

    console.error(err);

  }
};
  const updateStatus = async (rfqId, status) => {
    const key = `${rfqId}-${status}`;
    setStatusLoading(key);

    try {
      const res = await fetchWithLoader(`/api/rfqs/${rfqId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      if (data.emailSent) {
        showSuccess(` Status "${status}" & email sent`);
      } else if (data.emailError) {
        showError(` Status updated but email failed`);
      } else {
        showSuccess(`Status updated`);
      }

      setRfqs(prev =>
        prev.map(r => (r.id === rfqId ? { ...r, status } : r))
      );

    } catch (e) {
      showError("❌ " + e.message);
    } finally {
      setStatusLoading(null);
    }

  };


  /* ---------------- FILTER HELPERS ---------------- */
  const openEditModal = (rfq) => {

  setEditingRFQ(
    JSON.parse(JSON.stringify(rfq))
  );

  setShowEditModal(true);
  };


  const allProducts = useMemo(() => {
    const map = new Map();
    rfqs.forEach((r) =>
      r.products.forEach((p) => {
        if (!map.has(p.id)) map.set(p.id, { id: p.id, name: p.name });
      })
    );
    return Array.from(map.values());
  }, [rfqs]);


  const availableBranches = useMemo(() => {
    if (selectedOrg === "all") return [];
    const org = organizations.find((o) => o.id === Number(selectedOrg));
    return org?.branches || [];
  }, [selectedOrg, organizations]);


const filteredRfqs = rfqs.filter((rfq) => {

  const orgMatch =
    selectedOrg === "all" ||
    rfq.orgId === Number(selectedOrg);

  const branchMatch =
    selectedBranch === "all" ||
    rfq.branch === selectedBranch;

  const statusMatch =
    selectedStatus === "all" ||
    rfq.status === selectedStatus;

  const productMatch =
    selectedProduct === "all" ||
    rfq.products.some(
      (p) => p.id === Number(selectedProduct)
    );

  // ✅ only RFQs having quotation
  const hasQuotation =
    !!rfq.proposal_number;

  // ✅ search by quotation number
  const quotationNumberMatch =
    !quotationSearch ||
    (rfq.proposal_number || "")
      .toLowerCase()
      .includes(
        quotationSearch.toLowerCase()
      );

  // ✅ search by client name
  const clientNameMatch =
    !quotationSearch ||
    (rfq.clientName || "")
      .toLowerCase()
      .includes(
        quotationSearch.toLowerCase()
      );

  // ✅ combined search
  const quotationMatch =
    quotationNumberMatch ||
    clientNameMatch;

  return (
    orgMatch &&
    branchMatch &&
    statusMatch &&
    productMatch &&
    (
      !quotationSearch ||
      (
        hasQuotation &&
        quotationMatch
      )
    )
  );
});

  const saveRFQChanges = async () => {

  try {
 console.log("editingRFQ",editingRFQ)
    const res = await fetch(
      `/api/rfqs/${editingRFQ.id}/update-products`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          client_name: editingRFQ.clientName,
          client_phone: editingRFQ.clientPhone,
          client_email: editingRFQ.clientEmail,
          products: editingRFQ.products.map(p => ({
            product_id: p.id,
            quantity: p.quantity,
            quoted_price: p.custom_price &&
             Number(p.custom_price) > 0
             ? p.custom_price
             : p.rate || 0,
            
          }))
        })
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message);
    }

    showSuccess("RFQ updated");

    setShowEditModal(false);

    fetchRfqs();

  } catch (err) {

    showError(err.message);

  }
};



  const statusBadgeClass = (status) => {
    switch (status) {
      case "Submitted":
        return "bg-label-primary";
      case "Under Review":
        return "bg-label-warning";
      case "Accepted":
        return "bg-label-success";
      case "Rejected":
        return "bg-label-danger";
      default:
        return "bg-label-secondary";
    }
  };

const addProductToRFQ = (product) => {
console.log("add product",product)
  const alreadyExists =
    editingRFQ.products.some(
      x => x.id === product.id
    );

  if (alreadyExists) {

    showError("Product already added");

    return;
  }

  setEditingRFQ({

    ...editingRFQ,

    products: [

      ...editingRFQ.products,

      {

        id: product.id,

        name: product.product_name,

        quantity: 1,

        rate:
             product.custom_price &&
             Number(product.custom_price) > 0
             ? product.custom_price
             : product.base_price || 0,

        hsn: product.hsn,

        code: product.barcode
      }
    ]
  });

  /* OPTIONAL UX */

  setProductSearch("");

  setSearchResults([]);
};

  const addEmptyProduct = () => {

  setEditingRFQ({
    ...editingRFQ,

    products: [
      ...editingRFQ.products,

      {
        id: "",
        name: "",
        quantity: 1,
        rate: 0
      }
    ]
  });
};
  /* ---------------- UI ---------------- */

  return (
    <ProtectedRoute>
      <div className="container-xxl container-p-y">
        <h4 className="mb-4 text-primary">RFQ Management</h4>

        {/* Filters */}

        <div className="row mb-4 g-3">
                  <div className="col-md-3">
  <label className="form-label">
    Search Quotation
  </label>

  <input
    type="text"
    className="form-control"
    placeholder="Quotation No / Client Name"
    value={quotationSearch}
    onChange={(e) =>
      setQuotationSearch(e.target.value)
    }
  />
</div>
          <div className="col-md-3">
            <label className="form-label">Organization</label>
            <select
              className="form-select"
              value={selectedOrg}
              onChange={(e) => {
                setSelectedOrg(e.target.value);
                setSelectedBranch("all");
              }}
            >
              <option value="all">All Organizations</option>
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">Branch</label>
            <select
              className="form-select"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              disabled={selectedOrg === "all"}
            >
              <option value="all">All Branches</option>
              {availableBranches.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}

            </select>
          </div>

          {/* <div className="col-md-3">
          <label className="form-label">Product</label>
          <select
            className="form-select"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <option value="all">All Products</option>
            {allProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div> */}

          <div className="col-md-3">

            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              {RFQ_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredRfqs.length === 0 && (
          <p className="text-muted">No RFQs match selected filters.</p>
        )}

        {filteredRfqs.map((rfq) => (
          <div key={rfq.id} className="card mb-4 shadow-sm">
            <div className="card-header d-flex justify-content-between">
              <strong>
                {rfq.rfqNumber} — {rfq.orgName} ({rfq.branch})
              </strong>

              <span className={`badge ${statusBadgeClass(rfq.status)}`}>
                {rfq.status}
              </span>
            </div>

            <div className="card-body">
              <p className="text-muted">Submitted at: {rfq.submittedAt}</p>
              {/* ✅ CLIENT DETAILS */}
              <div className="mb-3 row">
                <div className="col-4"><strong>Client Name:</strong> {rfq.clientName || "-"}</div>
                <div className="col-3"><strong>Phone:</strong> {rfq.clientPhone || "-"}</div>
                <div className="col-5"><strong>Email:</strong> {rfq.clientEmail || "-"}</div>
              </div>
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>HSN</th>
                      <th>Code</th>
                      <th>Qty</th>
                      <th>Rate</th>
                      <th>Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rfq.products.map((p) => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>{p.hsn || "-"}</td>
                        <td>{p.code || "-"}</td>
                        <td>{p.quantity}</td>
                        <td>{p.rate}</td>
                        <td>{p.totalAmount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           {rfq.status === "Accepted" && (
  <div className="d-flex gap-2 mt-2">

    {/* CREATE PROPOSAL */}
    <button
      className="btn btn-orange btn-sm"
      onClick={() =>
        router.push(`/admin/proposal/edit?rfqId=${rfq.id}`)
      }
    >
      Create Proposal
    </button>

    {/* ✅ CANCEL RFQ */}
    <button
      className="btn btn-outline-danger btn-sm"
      disabled={statusLoading === `${rfq.id}-Rejected`}
      onClick={() => {
        if (confirm("Cancel this RFQ? Stock will be restored.")) {
          updateStatus(rfq.id, "Rejected");
        }
      }}
    >
      Cancel RFQ
    </button>
    <button
  className="btn btn-outline-primary btn-sm"
  onClick={() => openEditModal(rfq)}
>
  Edit RFQ
</button>

  </div>
)}
               <div className="d-flex gap-2 mt-3">

  {/* Submitted → Under Review */}
  {rfq.status === "Submitted" && (
    <button
      className="btn btn-warning btn-sm"
      disabled={statusLoading === `${rfq.id}-Under Review`}
      onClick={() => updateStatus(rfq.id, "Under Review")}
    >
      Mark Under Review
    </button>
  )}

  {/* Accept + Reject (only before Accepted/Rejected) */}
  {rfq.status !== "Accepted" && rfq.status !== "Rejected" && (
    <>
      <button
        className="btn btn-success btn-sm"
        disabled={statusLoading === `${rfq.id}-Accepted`}
        onClick={() => updateStatus(rfq.id, "Accepted")}
      >
        Accept
      </button>

      <button
        className="btn btn-danger btn-sm"
        disabled={statusLoading === `${rfq.id}-Rejected`}
        onClick={() => updateStatus(rfq.id, "Rejected")}
      >
        Reject
       </button>
        </>
      )}
           </div>
            </div>
          </div>
        ))}

        {showEditModal && editingRFQ && (

  <div className="modal d-block">
  <div
  className="modal-dialog modal-lg modal-dialog-scrollable"
  style={{ maxWidth: "850px",marginLeft:"340px" }}
>
      <div className="modal-content">

        {/* HEADER */}

        <div className="modal-header">

          <h5 className="modal-title">
            Edit RFQ
          </h5>

          <button
            className="btn-close"
            onClick={() =>
              setShowEditModal(false)
            }
          />
        </div>

        {/* BODY */}

        <div className="modal-body">

          {/* CLIENT INFO */}

          <div className="row g-3 mb-4">

            <div className="col-md-4">
              <label className="form-label">
                Client Name
              </label>

              <input
                className="form-control"
                value={editingRFQ.clientName || ""}
                onChange={(e) =>
                  setEditingRFQ({
                    ...editingRFQ,
                    clientName: e.target.value
                  })
                }
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">
                Phone
              </label>

              <input
                className="form-control"
                value={editingRFQ.clientPhone || ""}
                onChange={(e) =>
                  setEditingRFQ({
                    ...editingRFQ,
                    clientPhone: e.target.value
                  })
                }
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">
                Email
              </label>

              <input
                className="form-control"
                value={editingRFQ.clientEmail || ""}
                onChange={(e) =>
                  setEditingRFQ({
                    ...editingRFQ,
                    clientEmail: e.target.value
                  })
                }
              />
            </div>

          </div>

          {/* PRODUCTS */}
<div className="d-flex justify-content-between align-items-center mb-3">

  <h6 className="mb-0">
    Products
  </h6>

  <button
    className="btn btn-sm btn-outline-primary"
   onClick={() =>
  setShowProductSearch(
    !showProductSearch
  )
}
  >
    {showProductSearch
    ? "Close Search"
    : "+ Add Product"
  }
  </button>

</div>
{showProductSearch && (

  <div className="border rounded p-3 mb-3 ">

    {/* SEARCH INPUT */}

    <input
      type="text"
      className="form-control mb-3"
      placeholder="Search product name / SKU / barcode"
      value={productSearch}
      onChange={(e) =>
        searchProducts(e.target.value)
      }
    />

    {/* RESULTS */}

    <div
      style={{
        maxHeight: "250px",
        overflowY: "auto"
      }}
    >

      {searchResults.length === 0 && (

        <div className="text-muted small">
          No products found
        </div>

      )}

      {searchResults.map(product => (

        <div
          key={product.id}
          className="border rounded p-2 mb-2 bg-white cursor-pointer"
          style={{
            cursor: "pointer"
          }}
          onClick={() =>
            addProductToRFQ(product)
          }
        >

          <div className="fw-semibold">
            {product.product_name}
          </div>

          <div className="small text-muted">

            SKU:
            {product.barcode || "-"}

            {" • "}

            Stock:
            {product.stock_qty || 0}

          </div>

        </div>

      ))}

    </div>

  </div>

)}
          <div className="table-responsive">

            <table className="table table-bordered">

              <thead>
                <tr>
                  <th>Product</th>
                  <th width="120">Qty</th>
                  <th width="100">Action</th>
                </tr>
              </thead>

              <tbody>

                {editingRFQ.products.map((p, index) => (

                  <tr key={p.id}>

                    <td>{p.name}</td>

                    <td>

                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        value={p.quantity}
                        onChange={(e) => {

                          const updated = [
                            ...editingRFQ.products
                          ];

                          updated[index].quantity =
                            Number(e.target.value);

                          setEditingRFQ({
                            ...editingRFQ,
                            products: updated
                          });
                        }}
                      />

                    </td>

                    <td>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {

                          const updated =
                            editingRFQ.products.filter(
                              (_, i) => i !== index
                            );

                          setEditingRFQ({
                            ...editingRFQ,
                            products: updated
                          });
                        }}
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

        {/* FOOTER */}

        <div className="modal-footer">

          <button
            className="btn btn-secondary"
            onClick={() =>
              setShowEditModal(false)
            }
          >
            Cancel
          </button>

          <button
            className="btn btn-primary"
            onClick={saveRFQChanges}
          >
            Save Changes
          </button>

        </div>

      </div>
    </div>
  </div>

)}
      </div>
    </ProtectedRoute>
  );
};

export default function RFQPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RFQPageInner />
    </Suspense>
  );
}
