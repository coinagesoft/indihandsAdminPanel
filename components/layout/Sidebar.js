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
  <a href="/admin/dashboard" className="app-brand-link d-flex align-items-center justify-content-center text-center">
    {/* PNG Logo */}
   <div className='d-flex justify-content-center'>
     <img
      src="/materialize/assets/img/favicon/faviconSidebar.png"  // <-- put your PNG file path here
      alt="Logo"
      style={{ height: 50, width: "auto" }} // adjust height/width as needed
      className=""
    />
     <img
      src="/materialize/assets/img/favicon/name.png"  // <-- put your PNG file path here
      alt="Logo"
      style={{ height: 40, width: "auto" }} // adjust height/width as needed
      className="me-2 mt-1"
    />
   </div>
 
  </a>

  {/* Menu toggle */}
  <a
    href="#"
    onClick={(e) => e.preventDefault()}
    className="layout-menu-toggle menu-link text-large ms-auto"
  >
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.47365 11.7183C8.11707 12.0749 8.11707 12.6531 8.47365 13.0097L12.071 16.607C12.4615 16.9975 12.4615 17.6305 12.071 18.021C11.6805 18.4115 11.0475 18.4115 10.657 18.021L5.83009 13.1941C5.37164 12.7356 5.37164 11.9924 5.83009 11.5339L10.657 6.707C11.0475 6.31653 11.6805 6.31653 12.071 6.707C12.4615 7.09747 12.4615 7.73053 12.071 8.121L8.47365 11.7183Z"
        fillOpacity="0.9"
      />
      <path
        d="M14.3584 11.8336C14.0654 12.1266 14.0654 12.6014 14.3584 12.8944L18.071 16.607C18.4615 16.9975 18.4615 17.6305 18.071 18.021C17.6805 18.4115 17.0475 18.4115 16.657 18.021L11.6819 13.0459C11.3053 12.6693 11.3053 12.0587 11.6819 11.6821L16.657 6.707C17.0475 6.31653 17.6805 6.31653 18.071 6.707C18.4615 7.09747 18.4615 7.73053 18.071 8.121L14.3584 11.8336Z"
        fillOpacity="0.4"
      />
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
            <div>Products & Catalog</div>
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
                <div>Category</div>
              </Link>
            </li>
            <li className={`menu-item ${pathname === "/admin/products/catalog" ? "active" : ""}`}>
              <Link href="/admin/products/catalog" className="menu-link">
                <div>Catalog</div>
              </Link>
            </li>
          </ul>
        </li>

        {/* Clients */}

        {/* Client Pricing */}
        {/* Companies */}
        <li className={`menu-item ${pathname === "/admin/clients" ? "active" : ""}`}>
          <Link href="/admin/clients" className="menu-link">
            <i className="menu-icon tf-icons ri-building-4-line"></i>
            <div>Organizations</div>
          </Link>
        </li>


        {/* Client Pricing */}
        <li className={`menu-item ${pathname === "/admin/pricing" ? "active" : ""}`}>
          <Link href="/admin/pricing" className="menu-link">
            <i className="menu-icon tf-icons ri-price-tag-3-line"></i>
            <div>Company Pricing</div>
          </Link>
        </li>

        {/* RFQs */}
        <li className={`menu-item ${pathname === "/admin/rfqs" ? "active" : ""}`}>
          <Link href="/admin/rfqs" className="menu-link">
            <i className="menu-icon tf-icons ri-file-list-3-line"></i>
            <div>RFQs</div>
          </Link>
        </li>

        <li className={`menu-item ${openMenu === "invoice" ? "open" : ""}`}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              toggleMenu("invoice");
            }}
            className="menu-link menu-toggle"
          >
            <i className="menu-icon tf-icons ri-shopping-bag-3-line"></i>
            <div>Proposal</div>
          </a>
          <ul className="menu-sub">
            <li className={`menu-item ${pathname === "/admin/invoice/preview" ? "active" : ""}`}>
              <Link href="/admin/invoice/preview" className="menu-link">
                <div>Proposal Preview</div>
              </Link>
            </li>
            <li className={`menu-item ${pathname === "/admin/invoice/edit" ? "active" : ""}`}>
              <Link href="/admin/invoice/edit" className="menu-link">
                <div>Edit Proposal </div>
              </Link>
            </li>

          </ul>
        </li>

        {/* Settings */}
        <li className={`menu-item ${pathname === "/admin/settings" ? "active" : ""}`}>
          <Link href="/admin/settings" className="menu-link">
            <i className="menu-icon tf-icons ri-settings-3-line"></i>
            <div>Settings</div>
          </Link>
        </li>


      </ul>

    </aside>
  )
}

export default Sidebar