"use client"; // ← Required for client-side interactivity

import React, { useState } from "react";

const Page = () => {
  const [categories, setCategories] = useState([
    {
      id: 1,
      title: "Electronics",
      slug: "electronics",
      parentCategory: "Household",
      status: "Publish",
      products: 120,
      earning: 12340.5,
      image: "https://via.placeholder.com/40",
    },
    {
      id: 2,
      title: "Home Appliances",
      slug: "home-appliances",
      parentCategory: "Management",
      status: "Publish",
      products: 85,
      earning: 7895.0,
      image: "https://via.placeholder.com/40",
    },
  ]);

  const [editCategory, setEditCategory] = useState(null);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    alert("Category added! (dummy alert)");
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    alert(`Category updated: ${editCategory.title}`);
    setEditCategory(null); // Close edit offcanvas
  };

  const handleEditClick = (cat) => {
    setEditCategory(cat);
    const offcanvas = new window.bootstrap.Offcanvas(
      document.getElementById("offcanvasEditCategory")
    );
    offcanvas.show();
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditCategory((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      {/* Category List */}
      <div className="card mb-4">
        <div className="card-datatable table-responsive">
          <table className="datatables-category-list table table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Image</th>
                <th>Categories</th>
                <th className="text-nowrap text-sm-end">Total Products</th>
                <th className="text-nowrap text-sm-end">Total Earning</th>
                <th className="text-lg-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, index) => (
                <tr key={cat.id}>
                  <td>{index + 1}</td>
                  <td>
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="rounded"
                    />
                  </td>
                  <td>{cat.title}</td>
                  <td className="text-sm-end">{cat.products}</td>
                  <td className="text-sm-end">${cat.earning.toFixed(2)}</td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => handleEditClick(cat)}
                    >
                      Edit
                    </button>
                    <button className="btn btn-sm btn-outline-danger">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Category Offcanvas */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex={-1}
        id="offcanvasAddCategory"
        aria-labelledby="offcanvasAddCategoryLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasAddCategoryLabel">
            Add Category
          </h5>
          <button
            type="button"
            className="btn-close text-reset"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body border-top">
          <form onSubmit={handleAddSubmit}>
            <div className="form-floating form-floating-outline mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Enter category title"
              />
              <label>Title</label>
            </div>
            <div className="form-floating form-floating-outline mb-3">
              <input type="text" className="form-control" placeholder="Slug" />
              <label>Slug</label>
            </div>
            <button type="submit" className="btn btn-primary me-2">
              Add
            </button>
            <button
              type="reset"
              className="btn btn-outline-danger"
              data-bs-dismiss="offcanvas"
            >
              Discard
            </button>
          </form>
        </div>
      </div>

      {/* Edit Category Offcanvas */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex={-1}
        id="offcanvasEditCategory"
        aria-labelledby="offcanvasEditCategoryLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasEditCategoryLabel">
            Edit Category
          </h5>
          <button
            type="button"
            className="btn-close text-reset"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body border-top">
          {editCategory && (
            <form onSubmit={handleEditSubmit}>
              <div className="form-floating form-floating-outline mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Category title"
                  name="title"
                  value={editCategory.title}
                  onChange={handleEditChange}
                />
                <label>Title</label>
              </div>
              <div className="form-floating form-floating-outline mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Slug"
                  name="slug"
                  value={editCategory.slug}
                  onChange={handleEditChange}
                />
                <label>Slug</label>
              </div>
              <div className="form-floating form-floating-outline mb-3">
                <select
                  className="form-select"
                  name="parentCategory"
                  value={editCategory.parentCategory}
                  onChange={handleEditChange}
                >
                  <option value="Household">Household</option>
                  <option value="Management">Management</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Office">Office</option>
                  <option value="Automotive">Automotive</option>
                </select>
                <label>Parent Category</label>
              </div>
              <div className="form-floating form-floating-outline mb-3">
                <select
                  className="form-select"
                  name="status"
                  value={editCategory.status}
                  onChange={handleEditChange}
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Publish">Publish</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <label>Status</label>
              </div>
              <button type="submit" className="btn btn-primary me-2">
                Save
              </button>
              <button
                type="button"
                className="btn btn-outline-danger"
                data-bs-dismiss="offcanvas"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
