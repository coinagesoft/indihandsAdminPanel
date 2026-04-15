"use client";
import { useState, useEffect } from "react";
import ProtectedRoute from '../../../components/ProtectedRoute'
import { showSuccess, showError } from "../../../lib/toast";
import ConfirmDialog from "../../../components/ConfirmDialog";
import { useFetchWithLoader } from "../../../lib/fetchWithLoader";
export default function CreateInvoice() {
  const [proposals, setProposals] = useState([]);
  const [proposalId, setProposalId] = useState("");
  const [proposal, setProposal] = useState(null);
  const [invoiceId, setInvoiceId] = useState(null);
  const today = new Date().toISOString().slice(0, 10);
  const fetchWithLoader = useFetchWithLoader();

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

  /* ========= LOAD PROPOSALS ========= */
  useEffect(() => {
    fetchWithLoader("/api/invoices")
      .then(r => r.json())
      .then(setProposals);
  }, []);
  const downloadInvoice = () => {
    if (!invoiceId) return;

    window.open(`/api/invoices/pdf/${proposalId}`, "_blank");
  };
  /* ========= LOAD PROPOSAL + EXISTING INVOICE ========= */
  useEffect(() => {
    if (!proposalId) {
      setProposal(null);
      setForm(emptyForm);
      return;
    }

    /* proposal */
    fetchWithLoader(`/api/challan/proposal/${proposalId}`)
      .then(r => r.json())
      .then(setProposal);

    /* existing invoice */
    fetchWithLoader(`/api/challan/invoice-by-proposal/${proposalId}`)
      .then(r => r.json())
      .then(inv => {
        if (inv && inv.id) {
          setInvoiceId(inv.id);   // ⭐ add

          setForm({
            invoice_date: inv.invoice_date?.slice(0, 10) || today,
            supply_date: inv.supply_date?.slice(0, 10) || today,
            place_of_supply: inv.place_of_supply || "",
            po_number: inv.po_number || "",
            po_date: inv.po_date?.substring(0, 10) || "",
            transport_mode: inv.transport_mode || "",
            vehicle_number: inv.vehicle_number || "",
            challan_number: inv.challan_number || "",
            challan_date: inv.challan_date?.substring(0, 10) || "",
            reverse_charge: !!inv.reverse_charge
          });
        } else {
          setInvoiceId(null);     // ⭐ add
          setForm(emptyForm);
        }
      })
      .catch(() => setForm(emptyForm));

  }, [proposalId]);

  /* ========= CHANGE ========= */
  const handleChange = e => {
    const { name, value, type, checked } = e.target;

    setForm(prev => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : value
      };



      return updated;
    });
  };

  /* ========= SAVE ========= */
  const saveInvoice = async () => {
    if (!proposalId) {
      showError("Select proposal first");
      return;
    }

    const res = await fetch("/api/challan/create-from-proposal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proposal_id: proposalId, ...form })
    });

    const data = await res.json();
    if (res.ok) {
      showSuccess("Invoice saved");

      // RESET
   setInvoiceId(data.id); 
    } else {
      showError("Error saving invoice");
    }
  };

  return (
    <ProtectedRoute>
      <div className="container-xxl py-4">
        <h4 className="text-primary mb-4">Create Invoice</h4>

        <div className="card p-4">

          {/* SELECT */}
          <div className="mb-3">
            <label className="form-label">Select Proposal</label>
            <select
              className="form-select"
              value={proposalId}
              onChange={e => setProposalId(e.target.value)}
            >
              <option value="">-- Select Proposal --</option>
              {proposals.map(p => (
                <option key={p.id} value={p.id}>
                  {p.proposal_number} — {p.company_name}
                </option>
              ))}
            </select>
          </div>

          {/* SUMMARY */}
          {proposal && (
            <div className="border rounded p-3 mb-4 bg-light">

              {/* header row */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="fw-semibold text-orange">
                  Proposal Details
                </div>

              </div>

              {/* data */}
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
              </div>

            </div>
          )}

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
              <input
                name="challan_number"
                className="form-control"
                value={form.challan_number}
                onChange={handleChange}
              />
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

          <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">

            {/* Download */}
            <button
              type="button"
              className={`btn d-flex align-items-center gap-2 ${invoiceId ? "btn-orange" : "btn-outline-secondary"}`}
              onClick={downloadInvoice}
              disabled={!invoiceId}
            >
              <i className="bi bi-download"></i>
              Download Invoice
            </button>

            {/* Save */}
            <button
              onClick={saveInvoice}
              className="btn btn-orange px-4"
              disabled={!proposalId}
            >
              Save Invoice
            </button>

          </div>


        </div>
      </div>
    </ProtectedRoute>
  );
}