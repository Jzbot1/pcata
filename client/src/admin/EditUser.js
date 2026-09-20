import React, { useEffect, useState } from "react";
import AdminLayout from "./components/AdminLayout";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { message } from "antd";
import "./EditUser.css";

const EditUser = () => {

  const params = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  const [user, setUser] = useState({
    fname: "",
    email: "",
    mobile: "",
    password: "",
    balanceChange: "",
    reseller: "no",
    block: "no",
  });

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // GET USER DETAILS
  const getUser = async () => {
    try {
      const res = await axios.post(
        "/api/admin/get-user",
        { id: params.id },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      if (res.data.success) {
        const u = res.data.data;

        setUser({
          fname: u.fname || "",
          email: u.email || "",
          mobile: u.mobile || "",
          reseller: u.reseller || "no",
          block: u.block || "no",
          password: "",
          balanceChange: "",
        });
      }

      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  // UPDATE USER
  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setBtnLoading(true);

      const res = await axios.post(
        "/api/admin/admin-edit-user",
        {
          ...user,
          _id: params.id,
        },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      if (res.data.success) {
        message.success(res.data.message);
      } else {
        message.error(res.data.message);
      }

      setBtnLoading(false);

    } catch (error) {
      console.log(error);
      message.error("Something went wrong");
      setBtnLoading(false);
    }
  };

  return (
    <AdminLayout>

      <div className="admin-users-container">

        <div className="admin-edit-container">

          <div className="page-title">

            <h3>Edit User</h3>

            <button
              className="back-btn"
              onClick={() => navigate("/admin-users")}
            >
              ← Back
            </button>

          </div>

          {loading ? (

            <div className="admin-loader">
              <div className="loader-spinner"></div>
              <p>Loading user details...</p>
            </div>

          ) : (

            <form onSubmit={handleSubmit}>

              <div className="form-fields mb-3">
                <label className="form-label">Email</label>
                <input
                  className="form-control"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-fields mb-3">
                <label className="form-label">Name</label>
                <input
                  className="form-control"
                  name="fname"
                  value={user.fname}
                  onChange={handleChange}
                />
              </div>

              <div className="form-fields mb-3">
                <label className="form-label">Mobile</label>
                <input
                  className="form-control"
                  name="mobile"
                  value={user.mobile}
                  onChange={handleChange}
                />
              </div>

              <div className="form-fields mb-3">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  placeholder="Leave blank if not changing"
                  value={user.password}
                  onChange={handleChange}
                />
              </div>

              <div className="form-fields mb-3">
                <label className="form-label">
                  Balance Change (+10 / -10)
                </label>
                <input
                  type="number"
                  className="form-control"
                  name="balanceChange"
                  value={user.balanceChange}
                  onChange={handleChange}
                />
              </div>

              <div className="form-fields mb-3">
                <label className="form-label">Reseller</label>
                <select
                  className="form-select"
                  name="reseller"
                  value={user.reseller}
                  onChange={handleChange}
                >
                  <option value="no">User</option>
                  <option value="yes">Reseller</option>
                </select>
              </div>

              <div className="form-fields mb-4">
                <label className="form-label">Account Status (Block / Unblock)</label>
                <select
                  className="form-select"
                  name="block"
                  value={user.block}
                  onChange={handleChange}
                  style={{
                    fontWeight: "700",
                    color: user.block === "yes" ? "#dc3545" : "#198754",
                    borderColor: user.block === "yes" ? "#dc3545" : "#198754",
                  }}
                >
                  <option value="no">Active (Unblocked)</option>
                  <option value="yes">Blocked (Access Restricted)</option>
                </select>
              </div>

              <button
                className="register-btn bg-dark text-white"
                disabled={btnLoading}
              >
                {btnLoading ? "Updating..." : "Update User"}
              </button>

            </form>

          )}

        </div>

      </div>

    </AdminLayout>
  );
};

export default EditUser;