import React from 'react'

const page = () => {
  return (
      <div className="container-xxl flex-grow-1 container-p-y">
              <div
                className="d-flex flex-column flex-sm-row align-items-center justify-content-sm-between mb-6 text-center text-sm-start gap-2">
                <div className="mb-2 mb-sm-0">
                  <h4 className="mb-1">Customer ID #634759</h4>
                  <p className="mb-0">Aug 17, 2020, 5:48 (ET)</p>
                </div>
                <button type="button" className="btn btn-outline-danger delete-customer">Delete Customer</button>
              </div>

              <div className="row">
                <div className="col-xl-4 col-lg-5 col-md-5 order-1 order-md-0">
                  <div className="card mb-6">
                    <div className="card-body pt-12">
                      <div className="customer-avatar-section">
                        <div className="d-flex align-items-center flex-column">
                          <img
                            className="img-fluid rounded-3 mb-4"
                            src="/materialize/assets/img/avatars/1.png"
                            height="120"
                            width="120"
                            alt="User avatar" />
                          <div className="customer-info text-center mb-6">
                            <h5 className="mb-0">Lorine Hischke</h5>
                            <span>Customer ID #634759</span>
                          </div>
                        </div>
                      </div>
                      <div className="d-flex justify-content-around flex-wrap mb-6 gap-4 gap-md-3 gap-lg-4">
                        <div className="d-flex align-items-center gap-4 me-5">
                          <div className="avatar">
                            <div className="avatar-initial rounded-3 bg-label-primary">
                              <i className="ri-shopping-cart-line ri-24px"></i>
                            </div>
                          </div>
                          <div>
                            <h5 className="mb-0">184</h5>
                            <span>Orders</span>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-4">
                          <div className="avatar">
                            <div className="avatar-initial rounded-3 bg-label-primary">
                              <i className="ri-money-dollar-circle-line ri-24px"></i>
                            </div>
                          </div>
                          <div>
                            <h5 className="mb-0">$12,378</h5>
                            <span>Spent</span>
                          </div>
                        </div>
                      </div>

                      <div className="info-container">
                        <h5 className="border-bottom text-capitalize pb-4 mt-6 mb-4">Details</h5>
                        <ul className="list-unstyled mb-6">
                          <li className="mb-2">
                            <span className="h6 me-1">Username:</span>
                            <span>lorine.hischke</span>
                          </li>
                          <li className="mb-2">
                            <span className="h6 me-1">Email:</span>
                            <span>vafgot@vultukir.org</span>
                          </li>
                          <li className="mb-2">
                            <span className="h6 me-1">Status:</span>
                            <span className="badge bg-label-success rounded-pill">Active</span>
                          </li>
                          <li className="mb-2">
                            <span className="h6 me-1">Contact:</span>
                            <span>(123) 456-7890</span>
                          </li>

                          <li className="mb-2">
                            <span className="h6 me-1">Country:</span>
                            <span>USA</span>
                          </li>
                        </ul>
                        <div className="d-flex justify-content-center">
                          <a
                            href="javascript:;"
                            className="btn btn-primary w-100"
                            data-bs-target="#editUser"
                            data-bs-toggle="modal"
                            >Edit Details</a
                          >
                        </div>
                      </div>
                    </div>
                  </div>
               


                </div>

                <div className="col-xl-8 col-lg-7 col-md-7 order-0 order-md-1">
                  <div className="nav-align-top">
                    <ul className="nav nav-pills flex-column flex-md-row mb-6 row-gap-2">
                      <li className="nav-item">
                        <a className="nav-link" href="app-ecommerce-customer-details-overview.html"
                          ><i className="ri-group-line me-2"></i>Overview</a
                        >
                      </li>
                      <li className="nav-item">
                        <a className="nav-link" href="app-ecommerce-customer-details-security.html"
                          ><i className="ri-lock-2-line me-2"></i>Security</a
                        >
                      </li>
                      <li className="nav-item">
                        <a className="nav-link" href="app-ecommerce-customer-details-billing.html"
                          ><i className="ri-map-pin-line me-2"></i>Address & Billing</a
                        >
                      </li>
                      <li className="nav-item">
                        <a className="nav-link active" href="javascript:void(0);"
                          ><i className="ri-notification-4-line me-2"></i>Notifications</a
                        >
                      </li>
                    </ul>
                  </div>
                  <div className="card mb-6">
                    <h5 className="card-header border-bottom">Notifications</h5>
                    <h6 className="pt-4 px-5">You will receive notification for the below selected items.</h6>
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th className="text-nowrap">Type</th>
                            <th className="text-nowrap text-center">Email</th>
                            <th className="text-nowrap text-center">Browser</th>
                            <th className="text-nowrap text-center">App</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="text-nowrap text-heading">New for you</td>
                            <td>
                              <div className="form-check mb-0 d-flex justify-content-center">
                                <input className="form-check-input" type="checkbox" id="defaultCheck1" checked />
                              </div>
                            </td>
                            <td>
                              <div className="form-check mb-0 d-flex justify-content-center">
                                <input className="form-check-input" type="checkbox" id="defaultCheck2" checked />
                              </div>
                            </td>
                            <td>
                              <div className="form-check mb-0 d-flex justify-content-center">
                                <input className="form-check-input" type="checkbox" id="defaultCheck3" checked />
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td className="text-nowrap text-heading">Account activity</td>
                            <td>
                              <div className="form-check mb-0 d-flex justify-content-center">
                                <input className="form-check-input" type="checkbox" id="defaultCheck4" checked />
                              </div>
                            </td>
                            <td>
                              <div className="form-check mb-0 d-flex justify-content-center">
                                <input className="form-check-input" type="checkbox" id="defaultCheck5" checked />
                              </div>
                            </td>
                            <td>
                              <div className="form-check mb-0 d-flex justify-content-center">
                                <input className="form-check-input" type="checkbox" id="defaultCheck6" checked />
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td className="text-nowrap text-heading">A new browser used to sign in</td>
                            <td>
                              <div className="form-check mb-0 d-flex justify-content-center">
                                <input className="form-check-input" type="checkbox" id="defaultCheck7" checked />
                              </div>
                            </td>
                            <td>
                              <div className="form-check mb-0 d-flex justify-content-center">
                                <input className="form-check-input" type="checkbox" id="defaultCheck8" checked />
                              </div>
                            </td>
                            <td>
                              <div className="form-check mb-0 d-flex justify-content-center">
                                <input className="form-check-input" type="checkbox" id="defaultCheck9" />
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td className="text-nowrap text-heading">A new device is linked</td>
                            <td>
                              <div className="form-check mb-0 d-flex justify-content-center">
                                <input className="form-check-input" type="checkbox" id="defaultCheck10" checked />
                              </div>
                            </td>
                            <td>
                              <div className="form-check mb-0 d-flex justify-content-center">
                                <input className="form-check-input" type="checkbox" id="defaultCheck11" />
                              </div>
                            </td>
                            <td>
                              <div className="form-check mb-0 d-flex justify-content-center">
                                <input className="form-check-input" type="checkbox" id="defaultCheck12" />
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="card-body">
                      <button type="submit" className="btn btn-primary me-3">Save changes</button>
                      <button type="reset" className="btn btn-outline-secondary">Discard</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal fade" id="editUser" tabindex="-1" aria-hidden="true">
                <div className="modal-dialog modal-lg modal-simple modal-edit-user">
                  <div className="modal-content">
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    <div className="modal-body p-0">
                      <div className="text-center mb-6">
                        <h4 className="mb-2">Edit User Information</h4>
                        <p className="mb-6">Updating user details will receive a privacy audit.</p>
                      </div>
                      <form id="editUserForm" className="row g-5" onsubmit="return false">
                        <div className="col-12 col-md-6">
                          <div className="form-floating form-floating-outline">
                            <input
                              type="text"
                              id="modalEditUserFirstName"
                              name="modalEditUserFirstName"
                              className="form-control"
                              value="Oliver"
                              placeholder="Oliver" />
                            <label for="modalEditUserFirstName">First Name</label>
                          </div>
                        </div>
                        <div className="col-12 col-md-6">
                          <div className="form-floating form-floating-outline">
                            <input
                              type="text"
                              id="modalEditUserLastName"
                              name="modalEditUserLastName"
                              className="form-control"
                              value="Queen"
                              placeholder="Queen" />
                            <label for="modalEditUserLastName">Last Name</label>
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="form-floating form-floating-outline">
                            <input
                              type="text"
                              id="modalEditUserName"
                              name="modalEditUserName"
                              className="form-control"
                              value="oliver.queen"
                              placeholder="oliver.queen" />
                            <label for="modalEditUserName">Username</label>
                          </div>
                        </div>
                        <div className="col-12 col-md-6">
                          <div className="form-floating form-floating-outline">
                            <input
                              type="text"
                              id="modalEditUserEmail"
                              name="modalEditUserEmail"
                              className="form-control"
                              value="oliverqueen@gmail.com"
                              placeholder="oliverqueen@gmail.com" />
                            <label for="modalEditUserEmail">Email</label>
                          </div>
                        </div>
                        <div className="col-12 col-md-6">
                          <div className="form-floating form-floating-outline">
                            <select
                              id="modalEditUserStatus"
                              name="modalEditUserStatus"
                              className="form-select"
                              aria-label="Default select example">
                              <option value="1" selected>Active</option>
                              <option value="2">Inactive</option>
                              <option value="3">Suspended</option>
                            </select>
                            <label for="modalEditUserStatus">Status</label>
                          </div>
                        </div>
                        <div className="col-12 col-md-6">
                          <div className="form-floating form-floating-outline">
                            <input
                              type="text"
                              id="modalEditTaxID"
                              name="modalEditTaxID"
                              className="form-control modal-edit-tax-id"
                              placeholder="123 456 7890" />
                            <label for="modalEditTaxID">Tax ID</label>
                          </div>
                        </div>
                        <div className="col-12 col-md-6">
                          <div className="input-group input-group-merge">
                            <span className="input-group-text">US (+1)</span>
                            <div className="form-floating form-floating-outline">
                              <input
                                type="text"
                                id="modalEditUserPhone"
                                name="modalEditUserPhone"
                                className="form-control phone-number-mask"
                                value="+1 609 933 4422"
                                placeholder="+1 609 933 4422" />
                              <label for="modalEditUserPhone">Phone Number</label>
                            </div>
                          </div>
                        </div>
                        <div className="col-12 col-md-6">
                          <div className="form-floating form-floating-outline">
                            <input
                              id="TagifyLanguageSuggestion"
                              name="TagifyLanguageSuggestion"
                              className="form-control h-auto"
                              placeholder="select language"
                              value="English" />
                            <label for="TagifyLanguageSuggestion">Language</label>
                          </div>
                        </div>
                        <div className="col-12 col-md-6">
                          <div className="form-floating form-floating-outline">
                            <select
                              id="modalEditUserCountry"
                              name="modalEditUserCountry"
                              className="select2 form-select"
                              data-allow-clear="true">
                              <option value="">Select</option>
                              <option value="Australia">Australia</option>
                              <option value="Bangladesh">Bangladesh</option>
                              <option value="Belarus">Belarus</option>
                              <option value="Brazil">Brazil</option>
                              <option value="Canada">Canada</option>
                              <option value="China">China</option>
                              <option value="France">France</option>
                              <option value="Germany">Germany</option>
                              <option value="India" selected>India</option>
                              <option value="Indonesia">Indonesia</option>
                              <option value="Israel">Israel</option>
                              <option value="Italy">Italy</option>
                              <option value="Japan">Japan</option>
                              <option value="Korea">Korea, Republic of</option>
                              <option value="Mexico">Mexico</option>
                              <option value="Philippines">Philippines</option>
                              <option value="Russia">Russian Federation</option>
                              <option value="South Africa">South Africa</option>
                              <option value="Thailand">Thailand</option>
                              <option value="Turkey">Turkey</option>
                              <option value="Ukraine">Ukraine</option>
                              <option value="United Arab Emirates">United Arab Emirates</option>
                              <option value="United Kingdom">United Kingdom</option>
                              <option value="United States">United States</option>
                            </select>
                            <label for="modalEditUserCountry">Country</label>
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="form-check form-switch">
                            <input type="checkbox" className="form-check-input" id="editBillingAddress" />
                            <label for="editBillingAddress" className="text-heading">Use as a billing address?</label>
                          </div>
                        </div>
                        <div className="col-12 text-center d-flex flex-wrap justify-content-center gap-4 row-gap-4">
                          <button type="submit" className="btn btn-primary">Submit</button>
                          <button
                            type="reset"
                            className="btn btn-outline-secondary"
                            data-bs-dismiss="modal"
                            aria-label="Close">
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal fade" id="upgradePlanModal" tabindex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-simple modal-upgrade-plan">
                  <div className="modal-content p-8 p-md-12">
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    <div className="modal-body pt-md-0 px-0">
                      <div className="text-center mb-6">
                        <h4 className="mb-2">Upgrade Plan</h4>
                        <p className="mb-10">Choose the best plan for user.</p>
                      </div>
                      <form id="upgradePlanForm" className="row g-4 d-flex align-items-center" onsubmit="return false">
                        <div className="col-sm-9">
                          <select
                            id="choosePlan"
                            name="choosePlan"
                            className="form-select form-select-sm"
                            aria-label="Choose Plan">
                            <option selected>Choose Plan</option>
                            <option value="standard">Standard - $99/month</option>
                            <option value="exclusive">Exclusive - $249/month</option>
                            <option value="Enterprise">Enterprise - $499/month</option>
                          </select>
                        </div>
                        <div className="col-sm-3 d-flex align-items-end">
                          <button type="submit" className="btn btn-primary">Upgrade</button>
                        </div>
                      </form>
                    </div>
                    <hr className="my-1" />
                    <div className="modal-body pb-md-0 px-0">
                      <p className="mb-1">User current plan is standard plan</p>
                      <div className="d-flex justify-content-between align-items-center flex-wrap">
                        <div className="d-flex justify-content-center me-2 mt-4">
                          <sup className="h5 pricing-currency mt-5 mb-0 me-1 text-primary">$</sup>
                          <h1 className="mb-0 text-primary">99</h1>
                          <sub className="h5 pricing-duration mt-auto mb-3 small fw-normal">/month</sub>
                        </div>
                        <button className="btn btn-outline-danger cancel-subscription mt-4">Cancel Subscription</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
  )
}

export default page