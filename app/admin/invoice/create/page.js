"use client";
import { useState, useEffect } from "react";
import ProtectedRoute from '../../../../components/ProtectedRoute'
import { showSuccess, showError } from "../../../../lib/toast";
import ConfirmDialog from "../../../../components/ConfirmDialog";
import { useFetchWithLoader } from "../../../../lib/fetchWithLoader";
import { useSearchParams } from "next/navigation";


// ── Delivery Label Modal ────────────────────────────────────────────────────
const DEFAULT_FROM = {
  from_name:    "MTDS",
  from_address: "303, Meghana Apartment,\nD.S.K. Ranawara\nN.D.A. – Pashan Road, Bavdhan\nPune 411021",
  from_contact: "9822513937 / 9026311152",
};

const EMPTY_LABEL = {
  attn_name: "", contact_no: "", to_address: "",
  handle_with_care: true, ...DEFAULT_FROM,
};

function DeliveryLabelModal({ proposalId }) {
  const [show,    setShow]    = useState(false);
  const [form,    setForm]    = useState(EMPTY_LABEL);
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    if (!show || !proposalId) return;
    setLoading(true);
    fetch(`/api/invoices/delivery/${proposalId}`)
      .then(r => r.json())
      .then(data => {
        setForm({
          attn_name:        data.attn_name        || "",
          contact_no:       data.contact_no       || "",
          to_address:       data.to_address       || "",
          from_name:        data.from_name        || DEFAULT_FROM.from_name,
          from_address:     data.from_address     || DEFAULT_FROM.from_address,
          from_contact:     data.from_contact     || DEFAULT_FROM.from_contact,
          handle_with_care: data.handle_with_care !== false,
        });
      })
      .catch(() => showError("Failed to load label data"))
      .finally(() => setLoading(false));
  }, [show, proposalId]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/invoices/delivery/${proposalId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, proposal_id: proposalId }),
      });
      if (res.ok) showSuccess("Delivery label saved");
      else        showError("Failed to save label");
    } catch {
      showError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    window.open(`/api/invoices/delivery/${proposalId}/pdf`, "_blank");
  };

  return (
    <>
      {/* ✅ TRIGGER BUTTON */}
      <button
        className="btn btn-outline-info d-flex align-items-center gap-2"
        onClick={() => setShow(true)}
        disabled={!proposalId}
      >
        <i className="bi bi-tag-fill"></i>
        Delivery Label
      </button>

      {/* ✅ MODAL */}
      {show && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.55)", zIndex: 1055 }}
          onClick={e => { if (e.target === e.currentTarget) setShow(false); }}
        >
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">

              <div className="modal-header border-bottom">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  Delivery Label
                </h5>
                <button type="button" className="btn-close" onClick={() => setShow(false)} />
              </div>

              <div className="modal-body">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-info" role="status" />
                    <div className="mt-2 text-muted small">Loading label data…</div>
                  </div>
                ) : (
                  <div className="row g-3">

                    {/* TO section */}
                    <div className="col-12">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <h6 className="mb-0 fw-semibold">To (Recipient)</h6>
                      </div>
                      <hr className="mt-1 mb-2" />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Kind Attn 
                      </label>
                      <input
                        name="attn_name"
                        className="form-control"
                        placeholder="Contact person name"
                        value={form.attn_name}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Contact No. 
                      </label>
                      <input
                        name="contact_no"
                        className="form-control"
                        placeholder="e.g. 9370772622 / 9845850389"
                        value={form.contact_no}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        Delivery Address <span className="text-muted fw-normal small">(from proposal shipping address)</span>
                      </label>
                      <textarea
                        name="to_address"
                        className="form-control"
                        rows={4}
                        placeholder="Full delivery / shipping address"
                        value={form.to_address}
                        onChange={handleChange}
                      />
                    </div>

                    {/* FROM section */}
                    <div className="col-12 mt-2">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <h6 className="mb-0 fw-semibold">From (Sender)</h6>
                      </div>
                      <hr className="mt-1 mb-2" />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Sender Name</label>
                      <input
                        name="from_name"
                        className="form-control"
                        value={form.from_name}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Sender Contact No.</label>
                      <input
                        name="from_contact"
                        className="form-control"
                        value={form.from_contact}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Sender Address</label>
                      <textarea
                        name="from_address"
                        className="form-control"
                        rows={3}
                        value={form.from_address}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Options */}
                    <div className="col-12 mt-1">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          name="handle_with_care"
                          id="handle_with_care"
                          className="form-check-input"
                          checked={form.handle_with_care}
                          onChange={handleChange}
                        />
                        <label className="form-check-label fw-semibold" htmlFor="handle_with_care">
                          Print "Handle with Care" on label
                        </label>
                      </div>
                    </div>

                  </div>
                )}
              </div>

              <div className="modal-footer d-flex justify-content-between">
                <button
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  onClick={handleDownload}
                  disabled={loading}
                >
                  <i className="bi bi-download"></i>
                  Download PDF
                </button>
                <div className="d-flex gap-2">
                  <button className="btn btn-light border" onClick={() => setShow(false)}>
                    Close
                  </button>
                  <button
                    className="btn btn-orange d-flex align-items-center gap-2"
                    onClick={handleSave}
                    disabled={saving || loading}
                  >
                    {saving
                      ? <><span className="spinner-border spinner-border-sm"></span> Saving…</>
                      : <><i className="bi bi-save"></i> Save Label</>
                    }
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function CreateInvoice() {
  const [proposals, setProposals] = useState([]);
  const [proposalId, setProposalId] = useState("");
  const [proposal, setProposal] = useState(null);
  const [invoiceIds, setInvoiceIds] = useState([]);
  const today = new Date().toISOString().slice(0, 10);
  const fetchWithLoader = useFetchWithLoader();
  const [searchProposalId, setSearchProposalId] = useState("");
  const [searchInvoiceNo, setSearchInvoiceNo] = useState("");
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [proposalStatus, setProposalStatus] = useState("");

  const [companyFilter, setCompanyFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const proposalIdFromUrl = searchParams.get("proposalId");
  const [invoiceCopyType, setInvoiceCopyType] = useState("original");
  const emptyForm = {
    invoice_date: today,
    supply_date: today,
    place_of_supply: "",
    po_number: "",
    po_date: "",
    transport_mode: "",
    vehicle_number: "",
    challan_number: "",
    challan_date: "",
    reverse_charge: false
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchWithLoader("/api/invoices")
      .then(r => r.json())
      .then(setProposals);
  }, []);

  const downloadProductInvoice = () => {
    window.open(`/api/invoices/pdf/${proposalId}?copyType=${invoiceCopyType}&type=product`, "_blank");
  };
  const downloadChargesInvoice = () => {
    window.open(`/api/invoices/pdf/${proposalId}?copyType=${invoiceCopyType}&type=charges`, "_blank");
  };
  const downloadSingleInvoice = () => {
    window.open(`/api/invoices/pdf/${proposalId}?copyType=${invoiceCopyType}`, "_blank");
  };

  useEffect(() => {
    if (!proposalId) { setProposal(null); setForm(emptyForm); return; }

    fetchWithLoader(`/api/challan/proposal/${proposalId}`)
      .then(r => r.json())
      .then(setProposal);

    fetchWithLoader(`/api/challan/invoice-by-proposal/${proposalId}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const ids = data.map(i => i.id);
          setInvoiceIds(ids);
          const latest = data[0];
          setForm({
            invoice_date:    latest.invoice_date?.slice(0, 10)     || today,
            supply_date:     latest.supply_date?.slice(0, 10)      || today,
            place_of_supply: latest.place_of_supply                || "",
            po_number:       latest.po_number                      || "",
            po_date:         latest.po_date?.substring(0, 10)      || "",
            transport_mode:  latest.transport_mode                 || "",
            vehicle_number:  latest.vehicle_number                 || "",
            challan_number:  latest.challan_number                 || "",
            challan_date:    latest.challan_date?.substring(0, 10) || "",
            reverse_charge:  !!latest.reverse_charge
          });
        } else {
          setInvoiceIds([]);
          setForm(emptyForm);
        }
      })
      .catch(() => setForm(emptyForm));
  }, [proposalId]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const filteredProposals = proposals.filter(p => {
    const s = search.toLowerCase();
    if (!s) return true;
    return (
      (p.invoice_number  || "").toLowerCase().includes(s) ||
      (p.proposal_number || "").toLowerCase().includes(s)
    );
  });

  useEffect(() => {
    if (filteredProposals.length === 1) setProposalId(filteredProposals[0].id);
  }, [filteredProposals]);

  const saveInvoice = async () => {
    if (!proposalId) { showError("Select proposal first"); return; }
    const res = await fetch("/api/challan/create-from-proposal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proposal_id: proposalId, ...form })
    });
    let data = {};
    try { data = await res.json(); console.log("SAVE RESPONSE:", data); }
    catch (e) { console.error("Invalid JSON response"); }

    if (res.ok) {
      showSuccess("Invoice saved");
      if (data.product_invoice_id && data.charges_invoice_id) {
        setInvoiceIds([data.product_invoice_id, data.charges_invoice_id]);
      } else if (data.invoice_id) {
        setInvoiceIds([data.invoice_id]);
      }
    } else {
      showError(data.error || "Error saving invoice");
    }
  };

  useEffect(() => {
    if (proposalIdFromUrl) setProposalId(proposalIdFromUrl);
  }, [proposalIdFromUrl]);

  return (
    <ProtectedRoute>
      <div className="container-xxl py-4">
        <h4 className="text-primary mb-4">Create Invoice</h4>
        <div className="card p-4">

          {/* SEARCH */}
          <div className="row g-2 mb-2">
            <div className="col-md-12">
              <input
                className="form-control"
                placeholder="Search Invoice by Proposal No. / Invoice No..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && search && !isNaN(search)) setProposalId(search);
                }}
              />
            </div>
          </div>

          {/* SELECT PROPOSAL */}
          <div className="mb-3">
            <label className="form-label">Select Proposal</label>
            <select
              className="form-select"
              value={proposalId || ""}
              onChange={e => setProposalId(e.target.value)}
            >
              <option value="">-- Select Proposal --</option>
              {proposalIdFromUrl && !proposals.some(p => p.id == proposalIdFromUrl) && (
                <option value={proposalIdFromUrl}>Proposal #{proposalIdFromUrl}</option>
              )}
              {filteredProposals.map(p => (
                <option key={p.id} value={p.id}>
                  {p.proposal_number} — {p.company_name}
                </option>
              ))}
            </select>
          </div>

          {/* PROPOSAL SUMMARY */}
          {proposal && (
            <div className="border rounded p-3 mb-4 bg-light">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="fw-semibold text-orange">Proposal Details</div>
              </div>
              <div className="row small">
                <div className="col-md-6">
                  <div className="text-muted">Company</div>
                  <div className="fw-semibold">{proposal.company_name}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted">Branch</div>
                  <div className="fw-semibold">{proposal.branch_name}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted">Client</div>
                  <div className="fw-semibold">{proposal.client_name}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted">Client Email</div>
                  <div className="fw-semibold">{proposal.client_email}</div>
                </div>
                <div className="col-md-6 mt-2">
                  <div className="text-muted">SEZ Type</div>
                  <div className="fw-semibold text-secondary">
                    {proposal.branch_sez_type?.toUpperCase() || "NON-SEZ"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* INVOICE DETAILS */}
          <h6 className="text-orange mb-3">Invoice Details</h6>
         
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Invoice Date</label>
              <input type="date" name="invoice_date" className="form-control" readOnly value={form.invoice_date} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Supply Date</label>
              <input type="date" name="supply_date" className="form-control" readOnly value={form.supply_date} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Place of Supply</label>
              <input name="place_of_supply" className="form-control" value={form.place_of_supply} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Purchase Order No:</label>
              <input name="po_number" className="form-control" value={form.po_number} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Purchase Order Date</label>
              <input type="date" name="po_date" className="form-control" value={form.po_date || ""} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Transport Mode</label>
              <input name="transport_mode" className="form-control" value={form.transport_mode} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Vehicle Number</label>
              <input name="vehicle_number" className="form-control" value={form.vehicle_number} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Challan Number</label>
              <input name="challan_number" className="form-control" value={form.challan_number} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Challan Date</label>
              <input name="challan_date" type="date" className="form-control" value={form.challan_date || ""} onChange={handleChange} />
            </div>
            <div className="col-md-6 d-flex align-items-center mt-4">
              <input type="checkbox" name="reverse_charge" className="form-check-input me-2" checked={form.reverse_charge} onChange={handleChange} />
              <label className="form-check-label">Reverse Charge</label>
            </div>
          </div>

          {/* ── INVOICE ACTIONS ── */}
          <div className="mt-4 pt-3 border-top">

            <div className="mb-3">
              <h6 className="fw-semibold mb-1">Invoice Actions</h6>
              <small className="text-muted">Choose copy type and download invoice</small>
            </div>

            {/* Copy Type */}
            <div className="mb-4 p-3 border rounded bg-light">
              <label className="form-label fw-semibold mb-3">Invoice Copy Type</label>
              <div className="d-flex flex-wrap gap-4 align-items-center">
                {[
                  { key: "original",   label: "Original for Recipient" },
                  { key: "duplicate",  label: "Duplicate" },
                  { key: "triplicate", label: "Triplicate" },
                  { key: "transport",  label: "Transport" },
                ].map(type => (
                  <div className="form-check" key={type.key}>
                    <input
                      type="radio"
                      id={`copy-${type.key}`}
                      name="copyType"
                      className="form-check-input"
                      checked={invoiceCopyType === type.key}
                      onChange={() => setInvoiceCopyType(type.key)}
                    />
                    <label className="form-check-label" htmlFor={`copy-${type.key}`}>
                      {type.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* ── ACTION BAR ── */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 p-3 border rounded">

              {/* LEFT → All download buttons including Delivery Label */}
              <div className="d-flex flex-column gap-2">
                <span className="text-muted small">Download</span>
                <div className="d-flex flex-wrap gap-2 align-items-center">

                  {/* Invoice buttons (existing) */}
                  {proposal?.branch_sez_type?.toLowerCase() === "sez" && Number(proposal?.branch_id) === 27 ? (
                    <div className="btn-group">
                      <button
                        className="btn btn-outline-secondary d-flex align-items-center gap-1"
                        onClick={downloadProductInvoice}
                        disabled={invoiceIds.length < 1}
                      >
                        <i className="bi bi-box"></i> Product
                      </button>
                      <button
                        className="btn btn-outline-secondary d-flex align-items-center gap-1"
                        onClick={downloadChargesInvoice}
                        disabled={invoiceIds.length < 2}
                      >
                        <i className="bi bi-cash"></i> Charges
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn btn-outline-secondary d-flex align-items-center gap-2"
                      onClick={downloadSingleInvoice}
                      disabled={!invoiceIds.length}
                    >
                      <i className="bi bi-download"></i>
                      Download Invoice
                    </button>
                  )}

                  {/* ✅ DELIVERY LABEL — clicking opens popup modal */}
                  <DeliveryLabelModal proposalId={proposalId} />

                </div>
              </div>

              {/* RIGHT → Save Invoice */}
              <div>
                <button
                  onClick={saveInvoice}
                  className="btn btn-orange px-4 d-flex align-items-center gap-2"
                  disabled={!proposalId}
                >
                  <i className="bi bi-save"></i>
                  Save Invoice
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}