import React from "react";

const page = () => {
  return (
    <>
      <div className="container-xxl flex-grow-1 container-p-y">
        <div className="row g-6 mb-6">

          {/* BUSINESS OVERVIEW */}
          <div className="col-lg-6">
            <div className="card h-100">
              <div className="card-header">
                <div className="d-flex justify-content-between">
                  <h5 className="mb-1">Business Overview</h5>
                </div>
                <div className="d-flex align-items-center card-subtitle">
                  <div className="me-2">Total Revenue ₹42.5L</div>
                  <div className="d-flex align-items-center text-success">
                    <p className="mb-0 fw-medium">+18%</p>
                    <i className="ri-arrow-up-s-line ri-20px"></i>
                  </div>
                </div>
              </div>

              <div className="card-body d-flex justify-content-between flex-wrap gap-4">

                <div className="d-flex align-items-center gap-3">
                  <div className="avatar">
                    <div className="avatar-initial bg-label-primary rounded">
                      <i className="ri-user-3-line ri-24px"></i>
                    </div>
                  </div>
                  <div>
                    <h5 className="mb-0">124</h5>
                    <p className="mb-0">Active Clients</p>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <div className="avatar">
                    <div className="avatar-initial bg-label-warning rounded">
                      <i className="ri-file-list-3-line ri-24px"></i>
                    </div>
                  </div>
                  <div>
                    <h5 className="mb-0">38</h5>
                    <p className="mb-0">Open RFQs</p>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <div className="avatar">
                    <div className="avatar-initial bg-label-success rounded">
                      <i className="ri-file-check-line ri-24px"></i>
                    </div>
                  </div>
                  <div>
                    <h5 className="mb-0">21</h5>
                    <p className="mb-0">Approved Proposals</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* PRODUCTS */}
          <div className="col-lg-3 col-sm-6">
            <div className="card h-100">
              <div className="card-body">
                <h6 className="mb-2">Products</h6>
                <span className="badge bg-label-primary">Inventory</span>
                <h4 className="mt-4">540</h4>
                <p className="text-success mb-0">Active Products</p>
              </div>
            </div>
          </div>

          {/* PENDING ACTIONS */}
          <div className="col-lg-3 col-sm-6">
            <div className="card h-100">
              <div className="card-body">
                <h6 className="mb-2">Pending Actions</h6>
                <span className="badge bg-label-danger">Attention</span>
                <h4 className="mt-4">17</h4>
                <p className="text-warning mb-0">RFQs / Approvals</p>
              </div>
            </div>
          </div>

          {/* ACTIVITY TIMELINE */}
          <div className="col-lg-6">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="mb-0">Activity Timeline</h5>
              </div>
              <div className="card-body pt-4">
                <ul className="timeline card-timeline mb-0">

                  <li className="timeline-item timeline-item-transparent">
                    <span className="timeline-point timeline-point-primary"></span>
                    <div className="timeline-event">
                      <h6 className="mb-1">New RFQ Submitted</h6>
                      <p className="mb-0">Client ABC submitted RFQ for 12 products</p>
                      <small className="text-muted">10 min ago</small>
                    </div>
                  </li>

                  <li className="timeline-item timeline-item-transparent">
                    <span className="timeline-point timeline-point-success"></span>
                    <div className="timeline-event">
                      <h6 className="mb-1">Proposal Approved</h6>
                      <p className="mb-0">Proposal #PR-1023 approved</p>
                      <small className="text-muted">45 min ago</small>
                    </div>
                  </li>

                  <li className="timeline-item timeline-item-transparent">
                    <span className="timeline-point timeline-point-info"></span>
                    <div className="timeline-event">
                      <h6 className="mb-1">New Client Added</h6>
                      <p className="mb-0">Enterprise client onboarded</p>
                      <small className="text-muted">2 hours ago</small>
                    </div>
                  </li>

                </ul>
              </div>
            </div>
          </div>

          {/* RECENT PROPOSALS TABLE */}
          <div className="col-lg-6">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="mb-1">Recent Proposals</h5>
                <p className="mb-0">Client-wise summary</p>
              </div>

              <div className="table-responsive">
                <table className="table table-border-bottom-0">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Proposal ID</th>
                      <th>Status</th>
                      <th className="text-end">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>ABC Corp</td>
                      <td>#PR-1023</td>
                      <td><span className="badge bg-label-success">Approved</span></td>
                      <td className="text-end">₹5.2L</td>
                    </tr>
                    <tr>
                      <td>XYZ Ltd</td>
                      <td>#PR-1029</td>
                      <td><span className="badge bg-label-warning">Pending</span></td>
                      <td className="text-end">₹3.8L</td>
                    </tr>
                    <tr>
                      <td>Delta Inc</td>
                      <td>#PR-1011</td>
                      <td><span className="badge bg-label-danger">Rejected</span></td>
                      <td className="text-end">₹1.4L</td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>
          </div>

        </div>
      </div>

      <div className="content-backdrop fade"></div>
    </>
  );
};

export default page;
