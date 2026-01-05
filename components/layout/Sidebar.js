"use client";
import { usePathname } from 'next/navigation';
import React, { useState } from 'react'
import Link from "next/link";


const Sidebar = () => {

   const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState(""); // top-level menu toggle
  const [openSubMenu, setOpenSubMenu] = useState(""); // second-level menu toggle

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? "" : menu);
  };

  const toggleSubMenu = (menu) => {
    setOpenSubMenu(openSubMenu === menu ? "" : menu);
  };
    return (
        <aside id="layout-menu" className="layout-menu menu-vertical menu bg-menu-theme">
            <div className="app-brand demo">
                <a href="index.html" className="app-brand-link">
                    <span className="app-brand-logo demo">
                        <span style={{ color: "var(--bs-primary)" }}>
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
                    <span className="app-brand-text demo menu-text fw-semibold ms-2">Materialize</span>
                </a>

                <a  href="#" onClick={(e) => e.preventDefault()} className="layout-menu-toggle menu-link text-large ms-auto">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M8.47365 11.7183C8.11707 12.0749 8.11707 12.6531 8.47365 13.0097L12.071 16.607C12.4615 16.9975 12.4615 17.6305 12.071 18.021C11.6805 18.4115 11.0475 18.4115 10.657 18.021L5.83009 13.1941C5.37164 12.7356 5.37164 11.9924 5.83009 11.5339L10.657 6.707C11.0475 6.31653 11.6805 6.31653 12.071 6.707C12.4615 7.09747 12.4615 7.73053 12.071 8.121L8.47365 11.7183Z"
                            fillOpacity="0.9" />
                        <path
                            d="M14.3584 11.8336C14.0654 12.1266 14.0654 12.6014 14.3584 12.8944L18.071 16.607C18.4615 16.9975 18.4615 17.6305 18.071 18.021C17.6805 18.4115 17.0475 18.4115 16.657 18.021L11.6819 13.0459C11.3053 12.6693 11.3053 12.0587 11.6819 11.6821L16.657 6.707C17.0475 6.31653 17.6805 6.31653 18.071 6.707C18.4615 7.09747 18.4615 7.73053 18.071 8.121L14.3584 11.8336Z"
                            fillOpacity="0.4" />
                    </svg>
                </a>
            </div>

            <div className="menu-inner-shadow"></div>

 <ul className="menu-inner py-1">
        {/* Dashboard */}
        <li className={`menu-item ${pathname === "/admin/dashboard" ? "active" : ""}`}>
          <Link href="/admin/dashboard" className="menu-link">
            <i className="menu-icon tf-icons ri-home-4-line"></i>
            <div>Dashboard</div>
          </Link>
        </li>

        {/* Products & Inventory */}
        <li className={`menu-item ${openMenu === "products" ? "open" : ""}`}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              toggleMenu("products");
            }}
            className="menu-link menu-toggle"
          >
            <i className="menu-icon tf-icons ri-shopping-bag-3-line"></i>
            <div>Products & Inventory</div>
          </a>
          <ul className="menu-sub">
            <li className={`menu-item ${pathname === "/admin/products/list" ? "active" : ""}`}>
              <Link href="/admin/products/list" className="menu-link">
                <div>Product List</div>
              </Link>
            </li>
            <li className={`menu-item ${pathname === "/admin/products/add" ? "active" : ""}`}>
              <Link href="/admin/products/add" className="menu-link">
                <div>Add Product</div>
              </Link>
            </li>
            <li className={`menu-item ${pathname === "/admin/products/category" ? "active" : ""}`}>
              <Link href="/admin/products/category" className="menu-link">
                <div>Categories</div>
              </Link>
            </li>
          </ul>
        </li>

        {/* Clients */}
       <li className={`menu-item ${openMenu === "customer" ? "open" : ""}`}>
  <a
    href="#"
    onClick={(e) => {
      e.preventDefault();
      toggleMenu("customer");
    }}
    className="menu-link menu-toggle"
  >
        <i className="menu-icon tf-icons ri-user-3-line"></i>  {/* ← Icon added here */}

    <div>Clients</div>
  </a>

  <ul className="menu-sub">
    <li className={`menu-item ${pathname === "/admin/clients/allClients" ? "active" : ""}`}>
      <Link href="/admin/clients/allClients" className="menu-link">
        <div>All Clients</div>
      </Link>
    </li>

    <li className={`menu-item ${openSubMenu === "customerDetails" ? "open" : ""}`}>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          toggleSubMenu("customerDetails");
        }}
        className="menu-link menu-toggle"
      >
        <div>Clients Details</div>
      </a>

      <ul className="menu-sub">
        <li className={`menu-item ${pathname === "/admin/clients/clientDetails/overview" ? "active" : ""}`}>
          <Link href="/admin/clients/clientDetails/overview" className="menu-link">
            <div>Overview</div>
          </Link>
        </li>
        <li className={`menu-item ${pathname === "/admin/clients/clientDetails/security" ? "active" : ""}`}>
          <Link href="/admin/clients/clientDetails/security" className="menu-link">
            <div>Security</div>
          </Link>
        </li>
        <li className={`menu-item ${pathname === "/admin/clients/clientDetails/address_billing" ? "active" : ""}`}>
          <Link href="/admin/clients/clientDetails/address_billing" className="menu-link">
            <div>Shipping Address</div>
          </Link>
        </li>
        {/* <li className={`menu-item ${pathname === "/admin/clients/clientDetails/notifications" ? "active" : ""}`}>
          <Link href="/admin/clients/clientDetails/notifications" className="menu-link">
            <div>Notifications</div>
          </Link>
        </li> */}
      </ul>
    </li>
  </ul>
</li>


        {/* Client Pricing */}
        <li className={`menu-item ${pathname === "/admin/pricing" ? "active" : ""}`}>
          <Link href="/admin/pricing" className="menu-link">
            <i className="menu-icon tf-icons ri-price-tag-3-line"></i>
            <div>Client Pricing</div>
          </Link>
        </li>

        {/* RFQs */}
        <li className={`menu-item ${pathname === "/admin/rfqs" ? "active" : ""}`}>
          <Link href="/admin/rfqs" className="menu-link">
            <i className="menu-icon tf-icons ri-file-list-3-line"></i>
            <div>RFQs</div>
          </Link>
        </li>

        {/* Proposals */}
        <li className={`menu-item ${pathname === "/admin/proposals" ? "active" : ""}`}>
          <Link href="/admin/proposals" className="menu-link">
            <i className="menu-icon tf-icons ri-file-text-line"></i>
            <div>Proposals</div>
          </Link>
        </li>

        {/* Settings */}
        <li className={`menu-item ${pathname === "/admin/settings" ? "active" : ""}`}>
          <Link href="/admin/settings" className="menu-link">
            <i className="menu-icon tf-icons ri-settings-3-line"></i>
            <div>Settings</div>
          </Link>
        </li>

        {/* Logout */}
        <li className="menu-item">
          <Link href="/logout" className="menu-link">
            <i className="menu-icon tf-icons ri-logout-box-r-line"></i>
            <div>Logout</div>
          </Link>
        </li>
      </ul>

        </aside>
    )
}

export default Sidebar