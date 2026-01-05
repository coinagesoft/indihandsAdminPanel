"use client";
import React from 'react'

const Header = () => {
  return (
     <nav className="layout-navbar navbar navbar-expand-xl align-items-center bg-navbar-theme" id="layout-navbar">
          <div className="container-xxl">
            <div className="navbar-brand app-brand demo d-none d-xl-flex py-0 me-6">
              <a href="index.html" className="app-brand-link gap-2">
                <span className="app-brand-logo demo">
                  <span style={{color: "var(--bs-primary)"}}>
                    <svg width="25" height="150" viewBox="0 0 38 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M30.0944 2.22569C29.0511 0.444187 26.7508 -0.172113 24.9566 0.849138C23.1623 1.87039 22.5536 4.14247 23.5969 5.92397L30.5368 17.7743C31.5801 19.5558 33.8804 20.1721 35.6746 19.1509C37.4689 18.1296 38.0776 15.8575 37.0343 14.076L30.0944 2.22569Z"
                        fill="currentColor" />
                      <path
                        d="M30.171 2.22569C29.1277 0.444187 26.8274 -0.172113 25.0332 0.849138C23.2389 1.87039 22.6302 4.14247 23.6735 5.92397L30.6134 17.7743C31.6567 19.5558 33.957 20.1721 35.7512 19.1509C37.5455 18.1296 38.1542 15.8575 37.1109 14.076L30.171 2.22569Z"
                        fill="url(#paint0_linear_2989_100980)"
                        fillOpacity="0.4" />
                      <path
                        d="M22.9676 2.22569C24.0109 0.444187 26.3112 -0.172113 28.1054 0.849138C29.8996 1.87039 30.5084 4.14247 29.4651 5.92397L22.5251 17.7743C21.4818 19.5558 19.1816 20.1721 17.3873 19.1509C15.5931 18.1296 14.9843 15.8575 16.0276 14.076L22.9676 2.22569Z"
                        fill="currentColor" />
                      <path
                        d="M14.9558 2.22569C13.9125 0.444187 11.6122 -0.172113 9.818 0.849138C8.02377 1.87039 7.41502 4.14247 8.45833 5.92397L15.3983 17.7743C16.4416 19.5558 18.7418 20.1721 20.5361 19.1509C22.3303 18.1296 22.9391 15.8575 21.8958 14.076L14.9558 2.22569Z"
                        fill="currentColor" />
                      <path
                        d="M14.9558 2.22569C13.9125 0.444187 11.6122 -0.172113 9.818 0.849138C8.02377 1.87039 7.41502 4.14247 8.45833 5.92397L15.3983 17.7743C16.4416 19.5558 18.7418 20.1721 20.5361 19.1509C22.3303 18.1296 22.9391 15.8575 21.8958 14.076L14.9558 2.22569Z"
                        fill="url(#paint1_linear_2989_100980)"
                        fillOpacity="0.4" />
                      <path
                        d="M7.82901 2.22569C8.87231 0.444187 11.1726 -0.172113 12.9668 0.849138C14.7611 1.87039 15.3698 4.14247 14.3265 5.92397L7.38656 17.7743C6.34325 19.5558 4.04298 20.1721 2.24875 19.1509C0.454514 18.1296 -0.154233 15.8575 0.88907 14.076L7.82901 2.22569Z"
                        fill="currentColor" />
                      <defs>
                        <linearGradient
                          id="paint0_linear_2989_100980"
                          x1="5.36642"
                          y1="0.849138"
                          x2="10.532"
                          y2="24.104"
                          gradientUnits="userSpaceOnUse">
                         <stop offset="0" stopOpacity="1" />
<stop offset="1" stopOpacity="0" />

                        </linearGradient>
                        <linearGradient
                          id="paint1_linear_2989_100980"
                          x1="5.19475"
                          y1="0.849139"
                          x2="10.3357"
                          y2="24.1155"
                          gradientUnits="userSpaceOnUse">
                         <stop offset="0" stopOpacity="1" />
<stop offset="1" stopOpacity="0" />

                        </linearGradient>
                      </defs>
                    </svg>
                  </span>
                </span>
                <span className="app-brand-text demo menu-text fw-semibold">Materialize</span>
              </a>

              <a href="#" onClick={(e) => e.preventDefault()} className="layout-menu-toggle menu-link text-large ms-auto d-xl-none">
                <i className="ri-close-fill align-middle"></i>
              </a>
            </div>

            <div className="layout-menu-toggle navbar-nav align-items-xl-center me-4 me-xl-0 d-xl-none">
              <a className="nav-item nav-link px-0 me-xl-6" href="javascript:void(0)">
                <i className="ri-menu-fill ri-22px"></i>
              </a>
            </div>

            <div className="navbar-nav-right d-flex align-items-center" id="navbar-collapse">
              <ul className="navbar-nav flex-row align-items-center ms-auto">
                <li className="nav-item navbar-search-wrapper me-1 me-xl-0">
                  <a
                    className="nav-link btn btn-text-secondary rounded-pill search-toggler fw-normal"
                    href="javascript:void(0);">
                    <i className="ri-search-line ri-22px scaleX-n1-rtl"></i>
                  </a>
                </li>

                <li className="nav-item dropdown-language dropdown">
                  <a
                    className="nav-link btn btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
                    href="javascript:void(0);"
                    data-bs-toggle="dropdown">
                    <i className="ri-translate-2 ri-22px"></i>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <a className="dropdown-item" href="javascript:void(0);" data-language="en" data-text-direction="ltr">
                        <span className="align-middle">English</span>
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="javascript:void(0);" data-language="fr" data-text-direction="ltr">
                        <span className="align-middle">French</span>
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="javascript:void(0);" data-language="ar" data-text-direction="rtl">
                        <span className="align-middle">Arabic</span>
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="javascript:void(0);" data-language="de" data-text-direction="ltr">
                        <span className="align-middle">German</span>
                      </a>
                    </li>
                  </ul>
                </li>
                <li className="nav-item dropdown-style-switcher dropdown me-1 me-xl-0">
                  <a
                    className="nav-link btn btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
                    href="javascript:void(0);"
                    data-bs-toggle="dropdown">
                    <i className="ri-22px"></i>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end dropdown-styles">
                    <li>
                      <a className="dropdown-item" href="javascript:void(0);" data-theme="light">
                        <span className="align-middle"><i className="ri-sun-line ri-22px me-3"></i>Light</span>
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="javascript:void(0);" data-theme="dark">
                        <span className="align-middle"><i className="ri-moon-clear-line ri-22px me-3"></i>Dark</span>
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="javascript:void(0);" data-theme="system">
                        <span className="align-middle"><i className="ri-computer-line ri-22px me-3"></i>System</span>
                      </a>
                    </li>
                  </ul>
                </li>

                <li className="nav-item dropdown-shortcuts navbar-dropdown dropdown me-1 me-xl-0">
                  <a
                    className="nav-link btn btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
                    href="javascript:void(0);"
                    data-bs-toggle="dropdown"
                    data-bs-auto-close="outside"
                    aria-expanded="false">
                    <i className="ri-star-smile-line ri-22px"></i>
                  </a>
                  <div className="dropdown-menu dropdown-menu-end py-0">
                    <div className="dropdown-menu-header border-bottom py-50">
                      <div className="dropdown-header d-flex align-items-center py-2">
                        <h6 className="mb-0 me-auto">Shortcuts</h6>
                        <a
                          href="javascript:void(0)"
                          className="btn btn-text-secondary rounded-pill btn-icon dropdown-shortcuts-add text-heading"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="Add shortcuts"
                          ><i className="ri-add-line ri-24px"></i
                        ></a>
                      </div>
                    </div>
                    <div className="dropdown-shortcuts-list scrollable-container">
                      <div className="row row-bordered overflow-visible g-0">
                        <div className="dropdown-shortcuts-item col">
                          <span className="dropdown-shortcuts-icon rounded-circle mb-3">
                            <i className="ri-calendar-line ri-26px text-heading"></i>
                          </span>
                          <a href="app-calendar.html" className="stretched-link">Calendar</a>
                          <small className="mb-0">Appointments</small>
                        </div>
                        <div className="dropdown-shortcuts-item col">
                          <span className="dropdown-shortcuts-icon rounded-circle mb-3">
                            <i className="ri-file-text-line ri-26px text-heading"></i>
                          </span>
                          <a href="app-invoice-list.html" className="stretched-link">Invoice App</a>
                          <small className="mb-0">Manage Accounts</small>
                        </div>
                      </div>
                      <div className="row row-bordered overflow-visible g-0">
                        <div className="dropdown-shortcuts-item col">
                          <span className="dropdown-shortcuts-icon rounded-circle mb-3">
                            <i className="ri-user-line ri-26px text-heading"></i>
                          </span>
                          <a href="app-user-list.html" className="stretched-link">User App</a>
                          <small className="mb-0">Manage Users</small>
                        </div>
                        <div className="dropdown-shortcuts-item col">
                          <span className="dropdown-shortcuts-icon rounded-circle mb-3">
                            <i className="ri-computer-line ri-26px text-heading"></i>
                          </span>
                          <a href="app-access-roles.html" className="stretched-link">Role Management</a>
                          <small className="mb-0">Permission</small>
                        </div>
                      </div>
                      <div className="row row-bordered overflow-visible g-0">
                        <div className="dropdown-shortcuts-item col">
                          <span className="dropdown-shortcuts-icon rounded-circle mb-3">
                            <i className="ri-pie-chart-2-line ri-26px text-heading"></i>
                          </span>
                          <a href="index.html" className="stretched-link">Dashboard</a>
                          <small className="mb-0">Analytics</small>
                        </div>
                        <div className="dropdown-shortcuts-item col">
                          <span className="dropdown-shortcuts-icon rounded-circle mb-3">
                            <i className="ri-settings-4-line ri-26px text-heading"></i>
                          </span>
                          <a href="pages-account-settings-account.html" className="stretched-link">Setting</a>
                          <small className="mb-0">Account Settings</small>
                        </div>
                      </div>
                      <div className="row row-bordered overflow-visible g-0">
                        <div className="dropdown-shortcuts-item col">
                          <span className="dropdown-shortcuts-icon rounded-circle mb-3">
                            <i className="ri-question-line ri-26px text-heading"></i>
                          </span>
                          <a href="pages-faq.html" className="stretched-link">FAQs</a>
                          <small className="mb-0">FAQs & Articles</small>
                        </div>
                        <div className="dropdown-shortcuts-item col">
                          <span className="dropdown-shortcuts-icon rounded-circle mb-3">
                            <i className="ri-tv-2-line ri-26px text-heading"></i>
                          </span>
                          <a href="modal-examples.html" className="stretched-link">Modals</a>
                          <small className="mb-0">Useful Popups</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>

                <li className="nav-item dropdown-notifications navbar-dropdown dropdown me-4 me-xl-1">
                  <a
                    className="nav-link btn btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
                    href="javascript:void(0);"
                    data-bs-toggle="dropdown"
                    data-bs-auto-close="outside"
                    aria-expanded="false">
                    <i className="ri-notification-2-line ri-22px"></i>
                    <span
                      className="position-absolute top-0 start-50 translate-middle-y badge badge-dot bg-danger mt-2 border"></span>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end py-0">
                    <li className="dropdown-menu-header border-bottom py-50">
                      <div className="dropdown-header d-flex align-items-center py-2">
                        <h6 className="mb-0 me-auto">Notification</h6>
                        <div className="d-flex align-items-center">
                          <span className="badge rounded-pill bg-label-primary fs-xsmall me-2">8 New</span>
                          <a
                            href="javascript:void(0)"
                            className="btn btn-text-secondary rounded-pill btn-icon dropdown-notifications-all"
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title="Mark all as read"
                            ><i className="ri-mail-open-line text-heading ri-20px"></i
                          ></a>
                        </div>
                      </div>
                    </li>
                    <li className="dropdown-notifications-list scrollable-container">
                      <ul className="list-group list-group-flush">
                        <li className="list-group-item list-group-item-action dropdown-notifications-item">
                          <div className="d-flex">
                            <div className="flex-shrink-0 me-3">
                              <div className="avatar">
                                <img src="/materialize/assets/img/avatars/1.png" alt='' className="rounded-circle" />
                              </div>
                            </div>
                            <div className="flex-grow-1">
                              <h6 className="small mb-1">Congratulation Lettie 🎉</h6>
                              <small className="mb-1 d-block text-body">Won the monthly best seller gold badge</small>
                              <small className="text-muted">1h ago</small>
                            </div>
                            <div className="flex-shrink-0 dropdown-notifications-actions">
                              <a href="javascript:void(0)" className="dropdown-notifications-read"
                                ><span className="badge badge-dot"></span
                              ></a>
                              <a href="javascript:void(0)" className="dropdown-notifications-archive"
                                ><span className="ri-close-line ri-20px"></span
                              ></a>
                            </div>
                          </div>
                        </li>
                        <li className="list-group-item list-group-item-action dropdown-notifications-item">
                          <div className="d-flex">
                            <div className="flex-shrink-0 me-3">
                              <div className="avatar">
                                <span className="avatar-initial rounded-circle bg-label-danger">CF</span>
                              </div>
                            </div>
                            <div className="flex-grow-1">
                              <h6 className="mb-1 small">Charles Franklin</h6>
                              <small className="mb-1 d-block text-body">Accepted your connection</small>
                              <small className="text-muted">12hr ago</small>
                            </div>
                            <div className="flex-shrink-0 dropdown-notifications-actions">
                              <a href="javascript:void(0)" className="dropdown-notifications-read"
                                ><span className="badge badge-dot"></span
                              ></a>
                              <a href="javascript:void(0)" className="dropdown-notifications-archive"
                                ><span className="ri-close-line ri-20px"></span
                              ></a>
                            </div>
                          </div>
                        </li>
                        <li className="list-group-item list-group-item-action dropdown-notifications-item marked-as-read">
                          <div className="d-flex">
                            <div className="flex-shrink-0 me-3">
                              <div className="avatar">
                                <img src="/materialize/assets/img/avatars/2.png" alt='' className="rounded-circle" />
                              </div>
                            </div>
                            <div className="flex-grow-1">
                              <h6 className="mb-1 small">New Message ✉️</h6>
                              <small className="mb-1 d-block text-body">You have new message from Natalie</small>
                              <small className="text-muted">1h ago</small>
                            </div>
                            <div className="flex-shrink-0 dropdown-notifications-actions">
                              <a href="javascript:void(0)" className="dropdown-notifications-read"
                                ><span className="badge badge-dot"></span
                              ></a>
                              <a href="javascript:void(0)" className="dropdown-notifications-archive"
                                ><span className="ri-close-line ri-20px"></span
                              ></a>
                            </div>
                          </div>
                        </li>
                        <li className="list-group-item list-group-item-action dropdown-notifications-item">
                          <div className="d-flex">
                            <div className="flex-shrink-0 me-3">
                              <div className="avatar">
                                <span className="avatar-initial rounded-circle bg-label-success"
                                  ><i className="ri-shopping-cart-2-line"></i
                                ></span>
                              </div>
                            </div>
                            <div className="flex-grow-1">
                              <h6 className="mb-1 small">Whoo! You have new order 🛒</h6>
                              <small className="mb-1 d-block text-body">ACME Inc. made new order $1,154</small>
                              <small className="text-muted">1 day ago</small>
                            </div>
                            <div className="flex-shrink-0 dropdown-notifications-actions">
                              <a href="javascript:void(0)" className="dropdown-notifications-read"
                                ><span className="badge badge-dot"></span
                              ></a>
                              <a href="javascript:void(0)" className="dropdown-notifications-archive"
                                ><span className="ri-close-line ri-20px"></span
                              ></a>
                            </div>
                          </div>
                        </li>
                        <li className="list-group-item list-group-item-action dropdown-notifications-item marked-as-read">
                          <div className="d-flex">
                            <div className="flex-shrink-0 me-3">
                              <div className="avatar">
                                <img src="/materialize/assets/img/avatars/9.png" alt=''className="rounded-circle" />
                              </div>
                            </div>
                            <div className="flex-grow-1">
                              <h6 className="mb-1 small">Application has been approved 🚀</h6>
                              <small className="mb-1 d-block text-body"
                                >Your ABC project application has been approved.</small
                              >
                              <small className="text-muted">2 days ago</small>
                            </div>
                            <div className="flex-shrink-0 dropdown-notifications-actions">
                              <a href="javascript:void(0)" className="dropdown-notifications-read"
                                ><span className="badge badge-dot"></span
                              ></a>
                              <a href="javascript:void(0)" className="dropdown-notifications-archive"
                                ><span className="ri-close-line ri-20px"></span
                              ></a>
                            </div>
                          </div>
                        </li>
                        <li className="list-group-item list-group-item-action dropdown-notifications-item marked-as-read">
                          <div className="d-flex">
                            <div className="flex-shrink-0 me-3">
                              <div className="avatar">
                                <span className="avatar-initial rounded-circle bg-label-success"
                                  ><i className="ri-pie-chart-2-line"></i
                                ></span>
                              </div>
                            </div>
                            <div className="flex-grow-1">
                              <h6 className="mb-1 small">Monthly report is generated</h6>
                              <small className="mb-1 d-block text-body">July monthly financial report is generated </small>
                              <small className="text-muted">3 days ago</small>
                            </div>
                            <div className="flex-shrink-0 dropdown-notifications-actions">
                              <a href="javascript:void(0)" className="dropdown-notifications-read"
                                ><span className="badge badge-dot"></span
                              ></a>
                              <a href="javascript:void(0)" className="dropdown-notifications-archive"
                                ><span className="ri-close-line ri-20px"></span
                              ></a>
                            </div>
                          </div>
                        </li>
                        <li className="list-group-item list-group-item-action dropdown-notifications-item marked-as-read">
                          <div className="d-flex">
                            <div className="flex-shrink-0 me-3">
                              <div className="avatar">
                                <img src="/materialize/assets/img/avatars/5.png" alt=''className="rounded-circle" />
                              </div>
                            </div>
                            <div className="flex-grow-1">
                              <h6 className="mb-1 small">Send connection request</h6>
                              <small className="mb-1 d-block text-body">Peter sent you connection request</small>
                              <small className="text-muted">4 days ago</small>
                            </div>
                            <div className="flex-shrink-0 dropdown-notifications-actions">
                              <a href="javascript:void(0)" className="dropdown-notifications-read"
                                ><span className="badge badge-dot"></span
                              ></a>
                              <a href="javascript:void(0)" className="dropdown-notifications-archive"
                                ><span className="ri-close-line ri-20px"></span
                              ></a>
                            </div>
                          </div>
                        </li>
                        <li className="list-group-item list-group-item-action dropdown-notifications-item">
                          <div className="d-flex">
                            <div className="flex-shrink-0 me-3">
                              <div className="avatar">
                                <img src="/materialize/assets/img/avatars/6.png" alt=''className="rounded-circle" />
                              </div>
                            </div>
                            <div className="flex-grow-1">
                              <h6 className="mb-1 small">New message from Jane</h6>
                              <small className="mb-1 d-block text-body">Your have new message from Jane</small>
                              <small className="text-muted">5 days ago</small>
                            </div>
                            <div className="flex-shrink-0 dropdown-notifications-actions">
                              <a href="javascript:void(0)" className="dropdown-notifications-read"
                                ><span className="badge badge-dot"></span
                              ></a>
                              <a href="javascript:void(0)" className="dropdown-notifications-archive"
                                ><span className="ri-close-line ri-20px"></span
                              ></a>
                            </div>
                          </div>
                        </li>
                        <li className="list-group-item list-group-item-action dropdown-notifications-item marked-as-read">
                          <div className="d-flex">
                            <div className="flex-shrink-0 me-3">
                              <div className="avatar">
                                <span className="avatar-initial rounded-circle bg-label-warning"
                                  ><i className="ri-error-warning-line"></i
                                ></span>
                              </div>
                            </div>
                            <div className="flex-grow-1">
                              <h6 className="mb-1 small">CPU is running high</h6>
                              <small className="mb-1 d-block text-body"
                                >CPU Utilization Percent is currently at 88.63%,</small
                              >
                              <small className="text-muted">5 days ago</small>
                            </div>
                            <div className="flex-shrink-0 dropdown-notifications-actions">
                              <a href="javascript:void(0)" className="dropdown-notifications-read"
                                ><span className="badge badge-dot"></span
                              ></a>
                              <a href="javascript:void(0)" className="dropdown-notifications-archive"
                                ><span className="ri-close-line ri-20px"></span
                              ></a>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </li>
                    <li className="border-top">
                      <div className="d-grid p-4">
                        <a className="btn btn-primary btn-sm d-flex" href="javascript:void(0);">
                          <small className="align-middle">View all notifications</small>
                        </a>
                      </div>
                    </li>
                  </ul>
                </li>

                <li className="nav-item navbar-dropdown dropdown-user dropdown">
                  <a className="nav-link dropdown-toggle hide-arrow" href="javascript:void(0);" data-bs-toggle="dropdown">
                    <div className="avatar avatar-online">
                      <img src="/materialize/assets/img/avatars/1.png" alt=''className="rounded-circle" />
                    </div>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <a className="dropdown-item" href="pages-account-settings-account.html">
                        <div className="d-flex">
                          <div className="flex-shrink-0 me-2">
                            <div className="avatar avatar-online">
                              <img src="/materialize/assets/img/avatars/1.png" alt=''className="rounded-circle" />
                            </div>
                          </div>
                          <div className="flex-grow-1">
                            <span className="fw-medium d-block small">John Doe</span>
                            <small className="text-muted">Admin</small>
                          </div>
                        </div>
                      </a>
                    </li>
                    <li>
                      <div className="dropdown-divider"></div>
                    </li>
                    <li>
                      <a className="dropdown-item" href="pages-profile-user.html">
                        <i className="ri-user-3-line ri-22px me-3"></i><span className="align-middle">My Profile</span>
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="pages-account-settings-account.html">
                        <i className="ri-settings-4-line ri-22px me-3"></i><span className="align-middle">Settings</span>
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="pages-account-settings-billing.html">
                        <span className="d-flex align-items-center align-middle">
                          <i className="flex-shrink-0 ri-file-text-line ri-22px me-3"></i>
                          <span className="flex-grow-1 align-middle">Billing</span>
                          <span className="flex-shrink-0 badge badge-center rounded-pill bg-danger">4</span>
                        </span>
                      </a>
                    </li>
                    <li>
                      <div className="dropdown-divider"></div>
                    </li>
                    <li>
                      <a className="dropdown-item" href="pages-pricing.html">
                        <i className="ri-money-dollar-circle-line ri-22px me-3"></i
                        ><span className="align-middle">Pricing</span>
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="pages-faq.html">
                        <i className="ri-question-line ri-22px me-3"></i><span className="align-middle">FAQ</span>
                      </a>
                    </li>
                    <li>
                      <div className="d-grid px-4 pt-2 pb-1">
                        <a className="btn btn-sm btn-danger d-flex" href="auth-login-cover.html" target="_blank">
                          <small className="align-middle">Logout</small>
                          <i className="ri-logout-box-r-line ms-2 ri-16px"></i>
                        </a>
                      </div>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>

            <div className="navbar-search-wrapper search-input-wrapper container-xxl d-none">
            <input
  type="text"
  className="form-control search-input border-0"
  placeholder="Search..."
  aria-label="Search..."
  suppressHydrationWarning
/>

              <i className="ri-close-fill search-toggler cursor-pointer"></i>
            </div>
          </div>
        </nav>
  )
}

export default Header