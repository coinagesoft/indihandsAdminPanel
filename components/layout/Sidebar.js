"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

const Sidebar = () => {
  const pathname = usePathname();

  // ===== GROUP DETECTION =====
  const isProducts = pathname.startsWith("/admin/products");
  const isProposal =
    pathname.startsWith("/admin/proposal") ||
    pathname.startsWith("/admin/invoice");

  // helper for dropdown groups
  const groupClass = (isOpen) =>
    `menu-item ${isOpen ? "open active" : ""}`;

  return (
    <aside
      id="layout-menu"
      className="layout-menu menu-vertical menu bg-menu-theme"
    >
      {/* BRAND */}
      <div className="app-brand demo">
        <Link
          href="/admin/dashboard"
          className="app-brand-link d-flex align-items-center justify-content-center text-center"
        >
          <div className="d-flex justify-content-center">
            <img
              src="/materialize/assets/img/favicon/faviconSidebar.png"
              alt="Logo"
              style={{ height: 50 }}
            />
            <img
              src="/materialize/assets/img/favicon/name.png"
              alt="Logo"
              style={{ height: 40 }}
              className="ms-2 mt-1"
            />
          </div>
        </Link>
      </div>

      <div className="menu-inner-shadow"></div>

      <ul className="menu-inner py-1">
        {/* DASHBOARD */}
        <li
          className={`menu-item ${
            pathname === "/admin/dashboard" ? "active" : ""
          }`}
        >
          <Link href="/admin/dashboard" className="menu-link">
            <i className="menu-icon tf-icons ri-home-4-line"></i>
            <div>Dashboard</div>
          </Link>
        </li>

        {/* PRODUCTS */}
        <li className={groupClass(isProducts)}>
          <div className="menu-link menu-toggle">
            <i className="menu-icon tf-icons ri-shopping-bag-3-line"></i>
            <div>Products & Catalog</div>
          </div>

          <ul className="menu-sub">
            <li
              className={`menu-item ${
                pathname === "/admin/products/list" ? "active" : ""
              }`}
            >
              <Link href="/admin/products/list" className="menu-link">
                <div>Product List</div>
              </Link>
            </li>

            <li
              className={`menu-item ${
                pathname === "/admin/products/add" ? "active" : ""
              }`}
            >
              <Link href="/admin/products/add" className="menu-link">
                <div>Add Product</div>
              </Link>
            </li>

            <li
              className={`menu-item ${
                pathname === "/admin/products/catalog" ? "active" : ""
              }`}
            >
              <Link href="/admin/products/catalog" className="menu-link">
                <div>Catalog</div>
              </Link>
            </li>
          </ul>
        </li>

        {/* ORGANIZATIONS */}
        <li
          className={`menu-item ${
            pathname === "/admin/clients" ? "active" : ""
          }`}
        >
          <Link href="/admin/clients" className="menu-link">
            <i className="menu-icon tf-icons ri-building-4-line"></i>
            <div>Organizations</div>
          </Link>
        </li>

        {/* PRICING */}
        <li
          className={`menu-item ${
            pathname === "/admin/pricing" ? "active" : ""
          }`}
        >
          <Link href="/admin/pricing" className="menu-link">
            <i className="menu-icon tf-icons ri-price-tag-3-line"></i>
            <div>Company Pricing</div>
          </Link>
        </li>

        {/* RFQ */}
        <li
          className={`menu-item ${
            pathname === "/admin/rfqs" ? "active" : ""
          }`}
        >
          <Link href="/admin/rfqs" className="menu-link">
            <i className="menu-icon tf-icons ri-file-list-3-line"></i>
            <div>RFQs</div>
          </Link>
        </li>

        {/* PROPOSAL */}
        <li className={groupClass(isProposal)}>
          <div className="menu-link menu-toggle">
            <i className="menu-icon tf-icons ri-article-line"></i>
            <div>Proposal</div>
          </div>

          <ul className="menu-sub">
            <li
              className={`menu-item ${
                pathname === "/admin/invoice/edit" ? "active" : ""
              }`}
            >
              <Link href="/admin/invoice/edit" className="menu-link">
                <div>Edit Proposal</div>
              </Link>
            </li>

            <li
              className={`menu-item ${
                pathname === "/admin/proposal" ? "active" : ""
              }`}
            >
              <Link href="/admin/proposal" className="menu-link">
                <div>Proposal History</div>
              </Link>
            </li>
          </ul>
        </li>

        {/* INVOICE */}
        <li
          className={`menu-item ${
            pathname === "/admin/challan" ? "active" : ""
          }`}
        >
          <Link href="/admin/challan" className="menu-link">
            <i className="menu-icon tf-icons ri-receipt-line"></i>
            <div>Invoice</div>
          </Link>
        </li>

        {/* SETTINGS */}
        <li
          className={`menu-item ${
            pathname === "/admin/settings" ? "active" : ""
          }`}
        >
          <Link href="/admin/settings" className="menu-link">
            <i className="menu-icon tf-icons ri-settings-3-line"></i>
            <div>Settings</div>
          </Link>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;