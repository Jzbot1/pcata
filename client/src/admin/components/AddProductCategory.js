import React, { useEffect, useState } from "react";
import axios from "axios";
import { message } from "antd";
import "./AddProductCategory.css";
import AdminLayout from "./AdminLayout";

const AddProductCategory = () => {
    const [categories, setCategories] = useState([]);
    const [categoryName, setCategoryName] = useState("");
    const [serialNumber, setSerialNmmber] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    const fetchCategories = async () => {
        try {
        const { data } = await axios.get("/api/categories", {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          });
        setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
        message.error("Error fetching categories");
        setCategories([]); // Ensure it remains an array
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
        const response = editMode
            ? await axios.put(`/api/categories/${editId}`, { name: categoryName, serialNumber }, {
                headers: {
                  Authorization: "Bearer " + localStorage.getItem("token"),
                },
              })
            : await axios.post("/api/categories", { name: categoryName, serialNumber }, {
                headers: {
                  Authorization: "Bearer " + localStorage.getItem("token"),
                },
              });

        message.success(response.data.message);
        fetchCategories();
        setCategoryName("");
        setSerialNmmber("");
        setEditMode(false);
        setEditId(null);
        } catch (error) {
        message.error("Error saving category");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure?")) {
        try {
            await axios.delete(`/api/categories/${id}`, {
                headers: {
                  Authorization: "Bearer " + localStorage.getItem("token"),
                },
              });
            message.success("Category deleted");
            fetchCategories();
        } catch (error) {
            message.error("Error deleting category");
        }
        }
    };

  return (
    <AdminLayout>
        <div className="admin-add-category-container">
            <h2>{editMode ? "Edit Category" : "Add Category"}</h2>
            <form onSubmit={handleSubmit} className="category-form d-flex flex-column">
                <input
                  type="text"
                  placeholder="Enter Category Name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Enter Seial Number"
                  value={serialNumber}
                  onChange={(e) => setSerialNmmber(e.target.value)}
                  required
                />
                <button type="submit">{editMode ? "Update" : "Add"}</button>
            </form>

            <h3 className="mt-3">Categories List</h3>
            <ul className="category-list">
                {Array.isArray(categories) && categories.length > 0 ? (
                    categories.map((category) => (
                        <li key={category._id} className="category-item text-dark">
                          <div className="d-flex gap-3">
                            <div>{category.name}</div>
                            <div>{category.serialNumber}</div>
                          </div>
                          <div>
                              <button
                              className="edit-btn"
                              onClick={() => {
                                  setEditMode(true);
                                  setEditId(category._id);
                                  setCategoryName(category.name);
                                  setSerialNmmber(category.serialNumber);
                              }}
                              >
                              Edit
                              </button>
                              <button className="delete-btn" onClick={() => handleDelete(category._id)}>Delete</button>
                          </div>
                        </li>
                    ))
                    ) : (
                    <p className="text-dark">No categories found</p>
                    )
                }
            </ul>
        </div>
    </AdminLayout>
  );
};

export default AddProductCategory;