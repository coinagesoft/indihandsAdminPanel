"use client";
import React, { useState, useEffect } from "react";

const CategoryManagementPage = () => {
  const [categories, setCategories] = useState([]);

  const [categoryName, setCategoryName] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  /* ================= CATEGORY ================= */
  const addCategory = async () => {
    try {
      if (!categoryName.trim()) return;

      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("✅ Category Added");
      setCategoryName("");
      fetchCategories();
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  const deleteCategory = async (id) => {
    try {
      if (!confirm("Delete this category?")) return;

      const res = await fetch("/api/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("✅ Category Deleted");
      fetchCategories();
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  const deleteSubCategory = async (id) => {
    try {
      if (!confirm("Delete this subcategory?")) return;

      const res = await fetch("/api/subcategories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("✅ Subcategory Deleted");
      fetchCategories();
    } catch (err) {
      alert("❌ " + err.message);
    }
  };


  /* ================= SUBCATEGORY ================= */
  const addSubCategory = async () => {
    try {
      if (!subCategoryName.trim() || !selectedCategoryId) return;

      const res = await fetch("/api/subcategories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: Number(selectedCategoryId),
          name: subCategoryName,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("✅ Subcategory Added");
      setSubCategoryName("");
      fetchCategories();
    } catch (err) {
      alert("❌ " + err.message);
    }
  };



  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data.categories || []);
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

                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => deleteCategory(cat.id)}
                    >
                      Delete
                    </button>
                  </div>

                  {cat.subcategories.length === 0 ? (
                    <p className="text-muted mt-2 mb-0">No subcategories</p>
                  ) : (
                    <ul className="list-group list-group-flush mt-2">
                      {cat.subcategories.map((sub) => (
                        <li
                          key={sub.id}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <span>{sub.name}</span>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => deleteSubCategory(sub.id)}
                          >
                            Delete
                          </button>
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
