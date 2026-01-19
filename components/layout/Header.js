"use client";
import Link from 'next/link';
import React from 'react'

import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();

  
  const handleLogout = () => {
    // Clear auth-related storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
 

    // Redirect to login page
    router.replace("/login"); // or "/admin/login"
  };
  return (
     <nav className="layout-navbar navbar navbar-expand-xl align-items-center bg-navbar-theme" id="layout-navbar">
          <div className="container-xxl">
            <div className="navbar-brand app-brand demo d-none d-xl-flex py-0 me-6">
              <img
      src="/materialize/assets/img/favicon/favicon.png"  // <-- put your PNG file path here
      alt="Logo"
      style={{ height: 60, width: "auto" }} // adjust height/width as needed
      className="me-2"
    />

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

                {/* <li className="nav-item dropdown-language dropdown">
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
                </li> */}
                {/* <li className="nav-item dropdown-style-switcher dropdown me-1 me-xl-0">
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
                </li> */}

                {/* <li className="nav-item dropdown-shortcuts navbar-dropdown dropdown me-1 me-xl-0">
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
                </li> */}

                {/* <li className="nav-item dropdown-notifications navbar-dropdown dropdown me-4 me-xl-1">
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
                </li> */}

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
                    {/* <li>
                      <a className="dropdown-item" href="pages-profile-user.html">
                        <i className="ri-user-3-line ri-22px me-3"></i><span className="align-middle">My Profile</span>
                      </a>
                    </li> */}
                <li>
      <Link href="/admin/settings" className="dropdown-item">
        <i className="ri-settings-4-line ri-22px me-3"></i>
        <span className="align-middle">Settings</span>
      </Link>
    </li>

    <li>
      <Link href="/admin/pricing" className="dropdown-item">
        <i className="ri-money-dollar-circle-line ri-22px me-3"></i>
        <span className="align-middle">Pricing</span>
      </Link>
    </li>
                    {/* <li>
                      <a className="dropdown-item" href="pages-faq.html">
                        <i className="ri-question-line ri-22px me-3"></i><span className="align-middle">FAQ</span>
                      </a>
                    </li> */}
                    <li>
                      <div className="d-grid px-4 pt-2 pb-1">
                       <button
  onClick={handleLogout}
  className="btn btn-sm btn-danger d-flex w-100"
  type="button"
>
  <small className="align-middle">Logout</small>
  <i className="ri-logout-box-r-line ms-2 ri-16px"></i>
</button>

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