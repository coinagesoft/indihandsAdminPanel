"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

const menuItems = [
  {
    title: "Dashboard",
    icon: "ri-home-4-line",
    path: "/admin/dashboard",
  },
  {
    title: "Products & Catalog",
    icon: "ri-shopping-bag-3-line",
    children: [
      { title: "Product List", path: "/admin/products/list" },
      { title: "Add Product", path: "/admin/products/add" },
      { title: "Catalog", path: "/admin/products/catalog" },
    ],
  },
  {
    title: "Organizations",
    icon: "ri-building-4-line",
    path: "/admin/clients",
  },
   {
    title: "Pricing",
    icon: "ri-price-tag-3-line",
    children: [
      { title: "Company Pricing", path: "/admin/pricing/company_pricing" },
      { title: "Customer Pricing", path: "/admin/pricing/customer_pricing" },
    ],
  },
    {
    title: "RFQs",
    icon: "ri-file-list-3-line",
    children: [
      { title: "Company RFQs", path: "/admin/rfqs/company_rfqs" },
      { title: "Customer RFQs", path: "/admin/rfqs/customer_rfqs" },
    ],
  },
  {
    title: "Proposal",
    icon: "ri-article-line",
    children: [
      { title: "Edit Proposal", path: "/admin/proposal/edit" },
      { title: "Proposal List", path: "/admin/proposalHistory" },
    ],
  },
  {
    title: "Invoice",
    icon: "ri-receipt-line",
       children: [
      { title: "Create Invoice", path: "/admin/invoice/create" },
      { title: "Invoice List", path: "/admin/invoice/list" },
    ],

  },
  {
  title: "Feedback",
  icon: "ri-feedback-line",
  path: "/admin/feedback",
},
  {
    title: "Settings",
    icon: "ri-settings-3-line",
    path: "/admin/settings",
  },
];

const Sidebar = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (title) => {
    setOpenMenu(openMenu === title ? null : title);
  };

  return (
  <aside
  id="layout-menu"
  className="layout-menu menu-vertical menu bg-menu-theme"
>
      {/* LOGO */}
      <div className="app-brand demo">
        <Link
          href="/admin/dashboard"
          className="app-brand-link d-flex align-items-center justify-content-center"
        >
          <img
            src="/materialize/assets/img/favicon/favicon.png"
            className="brand-text-img"
            alt="Logo"
          />
        </Link>

        {/* TOGGLE */}
        {/* <a
          href="#"
          className="layout-menu-toggle menu-link text-large ms-auto"
          onClick={(e) => {
            e.preventDefault();
            setCollapsed(!collapsed);
          }}
        >
          <i
            className={`ri-arrow-left-s-line ${
              collapsed ? "rotate-icon" : ""
            }`}
          ></i>
        </a> */}
      </div>

      <div className="menu-inner-shadow"></div>

      {/* MENU */}
      <ul className="menu-inner py-1">
        {menuItems.map((item, index) => {
          const isActive = pathname === item.path;
          const isOpen = openMenu === item.title;

          if (item.children) {
            return (
              <li
                key={index}
                className={`menu-item ${isOpen ? "open not-active" : ""}`}
              >
                <div
                  className="menu-link menu-toggle"
                  onClick={() => toggleMenu(item.title)}
                  style={{ cursor: "pointer" }}
                >
                  <i className={`menu-icon tf-icons ${item.icon}`}></i>
                  <div>{item.title}</div>
                </div>

                <ul className="menu-sub">
                  {item.children.map((child, i) => (
                    <li
                      key={i}
                      className={`menu-item ${
                        pathname === child.path ? "active" : ""
                      }`}
                    >
                      <Link href={child.path} className="menu-link">
                        <div>{child.title}</div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            );
          }

          return (
            <li
              key={index}
              className={`menu-item ${isActive ? "active" : ""}`}
            >
              <Link href={item.path} className="menu-link">
                <i className={`menu-icon tf-icons ${item.icon}`}></i>
                <div>{item.title}</div>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default Sidebar;