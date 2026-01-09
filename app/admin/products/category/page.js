"use client";
import React, { useState } from "react";

const CategoryManagementPage = () => {
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: "Electronics",
      status: "active",
      subcategories: [
        { id: 11, name: "Mobile Phones", status: "active" },
        { id: 12, name: "Laptops", status: "active" },
        { id: 13, name: "Accessories", status: "inactive" },
      ],
    },
    {
      id: 2,
      name: "Industrial Supplies",
      status: "active",
      subcategories: [
        { id: 21, name: "Safety Equipment", status: "active" },
        { id: 22, name: "Tools & Machinery", status: "active" },
      ],
    },
    {
      id: 3,
      name: "Office Essentials",
      status: "inactive",
      subcategories: [
        { id: 31, name: "Stationery", status: "active" },
        { id: 32, name: "Office Furniture", status: "inactive" },
      ],
    },
  ]);

  const [categoryName, setCategoryName] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  /* ================= CATEGORY ================= */
  const addCategory = () => {
    if (!categoryName.trim()) return;

    setCategories((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: categoryName,
        status: "active",
        subcategories: [],
      },
    ]);
    setCategoryName("");
  };

  /* ================= SUBCATEGORY ================= */
  const addSubCategory = () => {
    if (!subCategoryName.trim() || !selectedCategoryId) return;

    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === Number(selectedCategoryId)
          ? {
              ...cat,
              subcategories: [
                ...cat.subcategories,
                {
                  id: Date.now(),
                  name: subCategoryName,
                  status: "active",
                },
              ],
            }
          : cat
      )
    );

    setSubCategoryName("");
  };

  return (
    <div className="container-xxl container-p-y">
      <h4 className="mb-4">Category Management</h4>

      <div className="row">
        {/* ADD CATEGORY */}
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Add Category</h5>
            </div>
            <div className="card-body">
              <input
                className="form-control mb-3"
                placeholder="Category name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
              <button className="btn btn-orange w-100" onClick={addCategory}>
                Add Category
              </button>
            </div>
          </div>

          {/* ADD SUBCATEGORY */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Add Subcategory</h5>
            </div>
            <div className="card-body">
              <select
                className="form-select mb-3"
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <input
                className="form-control mb-3"
                placeholder="Subcategory name"
                value={subCategoryName}
                onChange={(e) => setSubCategoryName(e.target.value)}
              />

              <button className="btn btn-orange w-100" onClick={addSubCategory}>
                Add Subcategory
              </button>
            </div>
          </div>
        </div>

        {/* CATEGORY LIST */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Categories & Subcategories</h5>
            </div>
            <div className="card-body">
              {categories.map((cat) => (
                <div key={cat.id} className="mb-4 border rounded p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">{cat.name}</h6>
                    <span className="badge bg-orange text-capitalize">
                      {cat.status}
                    </span>
                  </div>

                  {cat.subcategories.length === 0 ? (
                    <p className="text-muted mt-2 mb-0">
                      No subcategories
                    </p>
                  ) : (
                    <ul className="list-group list-group-flush mt-2">
                      {cat.subcategories.map((sub) => (
                        <li
                          key={sub.id}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          {sub.name}
                          <span className="badge bg-secondary">
                            {sub.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManagementPage;
