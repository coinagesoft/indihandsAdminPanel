"use client";
import React, { useState } from "react";

/* ================= MOCK ACCEPTED RFQs ================= */
const ACCEPTED_RFQS = [
    {
        id: 201,
        customerName: "Mr. Naveen Kumar L R",
        company: "Tripseay Consulting Services Pvt Ltd, Pune",
        gstin: "27ABCDE1234F1Z5",
        place: "Maharashtra (27)",
        date: "2026-01-05",
        items: [
            {
                description: "1021 Sofa/Wood Chair - Wood & Fabric",
                hsn: "411510",
                uom: "No",
                qty: 24,
                rate: 245,
                discount: 11,
                cgst: 9,
                sgst: 9,
                igst: 0,
            },
            {
                description: "1022 Ceramic Porcelain Tableware - Pack of 6",
                hsn: "482310",
                uom: "No",
                qty: 12,
                rate: 555.88,
                discount: 108,
                cgst: 9,
                sgst: 9,
                igst: 0,
            },
            {
                description: "1023 Office Modular Paper Stand",
                hsn: "482310",
                uom: "No",
                qty: 12,
                rate: 121.11,
                discount: 21.11,
                cgst: 9,
                sgst: 9,
                igst: 0,
            },
            {
                description: "Bundle Courier Charges",
                hsn: "998312",
                uom: "No",
                qty: 1,
                rate: 200,
                discount: 0,
                cgst: 9,
                sgst: 9,
                igst: 0,
            },
        ],
    },
    {
        id: 203,
        customerName: "Kekin Artworks",
        company: "Kekin Artworks, Jaipur",
        gstin: "08ABCDE4321F1Z9",
        place: "Rajasthan (08)",
        date: "2026-01-07",
        items: [
            {
                description: "Hand-painted Wooden Lamp",
                hsn: "44209090",
                uom: "No",
                qty: 1,
                rate: 2500,
                discount: 0,
                cgst: 9,
                sgst: 9,
                igst: 0,
            },
        ],
    },
];

const Page = () => {
    const [selectedRfq, setSelectedRfq] = useState("");
    const [header, setHeader] = useState({
        quotationNo: "QTN-2026-001",
        date: "",
        customerName: "",
        company: "",
        gstin: "",
        place: "",
    });
    const [items, setItems] = useState([]);

    /* ================= HANDLERS ================= */
    const handleRfqSelect = (e) => {
        const rfqId = e.target.value;
        setSelectedRfq(rfqId);

        const rfq = ACCEPTED_RFQS.find((r) => r.id === Number(rfqId));
        if (!rfq) return;

        setHeader({
            quotationNo: "QTN-2026-001",
            date: rfq.date,
            customerName: rfq.customerName,
            company: rfq.company,
            gstin: rfq.gstin,
            place: rfq.place,
        });

        setItems(rfq.items);
    };

    const calcAmount = (item) => {
        const base = item.qty * item.rate;
        const discount = (base * item.discount) / 100;
        return base - discount;
    };

    const calcTax = (amount, percent) => (amount * percent) / 100;

    const totals = items.reduce(
        (acc, item) => {
            const amount = calcAmount(item);
            acc.subtotal += amount;
            acc.cgst += calcTax(amount, item.cgst);
            acc.sgst += calcTax(amount, item.sgst);
            acc.igst += calcTax(amount, item.igst);
            return acc;
        },
        { subtotal: 0, cgst: 0, sgst: 0, igst: 0 }
    );

    const grandTotal =
        totals.subtotal + totals.cgst + totals.sgst + totals.igst;

    /* ================= UI ================= */
    return (
        <div className="container-xxl flex-grow-1 container-p-y">
            {/* ===== RFQ SELECT ===== */}
            <div className="mb-4">
                <label className="form-label">Select Accepted RFQ</label>
                <select
                    className="form-select"
                    value={selectedRfq}
                    onChange={handleRfqSelect}
                >
                    <option value="">-- Select RFQ --</option>
                    {ACCEPTED_RFQS.map((r) => (
                        <option key={r.id} value={r.id}>
                            RFQ #{r.id} — {r.company}
                        </option>
                    ))}
                </select>
            </div>

            <div className="row invoice-edit">
                <div className="col-lg-9 col-12 mb-lg-0 mb-6">
                    <div className="card invoice-preview-card p-sm-12 p-6">
                        {/* Header */}
                        <div className="card-body invoice-preview-header rounded-4 text-heading p-6 px-3">
                            <div className="row mx-0 px-3 row-gap-6">
                                <div className="col-md-8 ps-0">
                                    <h4 className="mb-3">Quotation</h4>

                                    <p className="mb-1">
                                        <strong>Quotation No:</strong> {header.quotationNo}
                                    </p>
                                    <p className="mb-1">
                                        <strong>To:</strong> {header.customerName}
                                    </p>
                                    <p className="mb-1">{header.company}</p>
                                    <p className="mb-1">
                                        <strong>GSTIN:</strong> {header.gstin}
                                    </p>
                                    <p className="mb-0">
                                        <strong>Place of Supply:</strong> {header.place}
                                    </p>
                                </div>

                                <div className="col-md-4 col-8 pe-0 ps-0 ps-md-2 text-end">
                                    <p className="mb-1">
                                        <strong>Date:</strong> {header.date}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="card-body px-0">
                            <div className="table-responsive">
                                <table
                                    className="table table-bordered align-middle"
                                    style={{ tableLayout: "auto", width: "100%" }}
                                >
                                    <colgroup>
                                        <col style={{ minWidth: "50px" }} />
                                        <col style={{ minWidth: "250px" }} />
                                        <col style={{ minWidth: "100px" }} />
                                        <col style={{ minWidth: "60px" }} />
                                        <col style={{ minWidth: "60px" }} />
                                        <col style={{ minWidth: "100px" }} />
                                        <col style={{ minWidth: "80px" }} />
                                        <col style={{ minWidth: "120px" }} />
                                        <col style={{ minWidth: "100px" }} />
                                        <col style={{ minWidth: "100px" }} />
                                        <col style={{ minWidth: "100px" }} />
                                        <col style={{ minWidth: "140px" }} />
                                    </colgroup>


                                    <thead className="table-primary">
                                        <tr>
                                            <th>Sr No</th>
                                            <th>Description</th>
                                            <th>HSN/SAC</th>
                                            <th>UOM</th>
                                            <th>Qty</th>
                                            <th>Rate</th>
                                            <th>Discount</th>
                                            <th>Amount</th>
                                            <th>CGST</th>
                                            <th>SGST</th>
                                            <th>IGST</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {items.map((item, i) => {
                                            const amount = calcAmount(item);
                                            const tax =
                                                calcTax(amount, item.cgst) +
                                                calcTax(amount, item.sgst) +
                                                calcTax(amount, item.igst);

                                            return (
                                                <tr key={i}>
                                                    <td>{i + 1}</td>
                                                    <td style={{ minWidth: "250px" }}>{item.description}</td>
                                                    <td>{item.hsn}</td>
                                                    <td>{item.uom}</td>
                                                    <td>{item.qty}</td>
                                                    <td>{item.rate}</td>
                                                    <td>{item.discount}</td>
                                                    <td>{amount.toFixed(2)}</td>
                                                    <td>{calcTax(amount, item.cgst).toFixed(2)}</td>
                                                    <td>{calcTax(amount, item.sgst).toFixed(2)}</td>
                                                    <td>{calcTax(amount, item.igst).toFixed(2)}</td>
                                                    <td>{(amount + tax).toFixed(2)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>


                        {/* Totals */}
                        <div className="card-body px-0">
                            <div className="row">
                                <div className="col-md-6" />
                                <div className="col-md-6">
                                    <table className="table">
                                        <tbody>
                                            <tr>
                                                <td>Total Before Tax</td>
                                                <td>₹ {totals.subtotal.toFixed(2)}</td>
                                            </tr>
                                            <tr>
                                                <td>CGST Total</td>
                                                <td>₹ {totals.cgst.toFixed(2)}</td>
                                            </tr>
                                            <tr>
                                                <td>SGST Total</td>
                                                <td>₹ {totals.sgst.toFixed(2)}</td>
                                            </tr>
                                            <tr>
                                                <td>IGST Total</td>
                                                <td>₹ {totals.igst.toFixed(2)}</td>
                                            </tr>
                                            <tr>
                                                <td>Total Tax</td>
                                                <td>₹ {(totals.cgst + totals.sgst + totals.igst).toFixed(2)}</td>
                                            </tr>
                                            <tr>
                                                <th>Grand Total</th>
                                                <th>₹ {grandTotal.toFixed(2)}</th>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Terms */}
                        <div className="card-body px-0 pt-4">
                            <h6>Terms & Conditions:</h6>
                            <ol className="mb-0">
                                <li>Payment within 15 days from invoice date.</li>
                                <li>Delivery within 7 working days from order confirmation.</li>
                                <li>Warranty as per manufacturer terms.</li>
                                <li>Goods once sold will not be taken back.</li>
                                <li>All disputes subject to Pune jurisdiction.</li>
                            </ol>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="col-lg-3 col-12 invoice-actions">
                    <div className="card">
                        <div className="card-body">
                            <button className="btn btn-primary w-100 mb-4">
                                Send Proposal
                            </button>
                            <button className="btn btn-outline-secondary w-100 mb-2">
                                Download PDF
                            </button>
                            <button className="btn btn-outline-secondary w-100 mb-2">
                                Print
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;
