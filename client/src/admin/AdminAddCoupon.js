import React, { useState, useEffect } from "react";
import AdminLayout from "./components/AdminLayout";
import "./AdminAddCoupon.css";
import axios from "axios"; // Import axios for making API calls
import { message } from "antd"; // Import axios for making API calls
import DeleteIcon from "@mui/icons-material/Delete";

const AdminAddCoupon = () => {
  const [loading, setLoading] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState({
    name: "",
    discount: "",
    minValue: "",
  });
  const [coupons, setCoupons] = useState(null);

  const handleChange = (e) => {
    setNewCouponCode({ ...newCouponCode, [e.target.name]: e.target.value });
  };

  const getAllCoupons = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/get-coupons");
      if (res.data.success) {
        setCoupons(res.data.data);
        setLoading(false);
      } else {
        message.error(res.data.message);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching shipping charge:", error);
    }
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(
        "/api/admin/add-coupon",
        {
          name: newCouponCode?.name,
          discount: newCouponCode?.discount,
          minValue: newCouponCode?.minValue,
        },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      if (res.data.success) {
        message.success(res.data.message);
        setNewCouponCode({ name: "", discount: "", minValue: "" });
        getAllCoupons();
        setLoading(false);
      } else {
        message.error(res.data.message);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const handleDeleteCoupon = async (id) => {
    try {
      const res = await axios.post(
        "/api/admin/delete-coupon",
        { id: id },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      if (res.data.success) {
        message.success(res.data.message);
        getAllCoupons();
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllCoupons();
  }, []);

  return (
    <AdminLayout>
      <div className="admin-users-container">
        <div className="page-title">
          <h3 className="m-0">Add Coupons</h3>
        </div>
        <hr />
        <div className="admin-coupon-container">
          <b>Add Coupon</b>
          <hr className="m-0 mb-3" />
          <div className="add-coupon-container form-fields">
            <input
              type="text"
              className="form-control"
              placeholder="Enter coupon code"
              name="name"
              onChange={handleChange}
              value={newCouponCode?.name}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Enter Discount in rupees"
              name="discount"
              onChange={handleChange}
              value={newCouponCode?.discount}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Enter Min Order Value"
              name="minValue"
              onChange={handleChange}
              value={newCouponCode?.minValue}
            />
            <button
              className="add-to-cart-btn py-3 m-0"
              onClick={handleAddCoupon}
            >
              {loading ? "Adding.." : "Add"}
            </button>
          </div>
          <div className="coupons-container">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Coupon Name</th>
                  <th>Discount</th>
                  <th>Min Order Value</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {coupons?.length === 0 ? (
                  <tr className="text-center">
                    <td colSpan="3">No Coupon Found</td>
                  </tr>
                ) : (
                  coupons &&
                  coupons?.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td>{item?.name}</td>
                        <td>{item?.discount}</td>
                        <td>{item?.minValue}</td>
                        <td>
                          <DeleteIcon
                            className="icon"
                            onClick={() => handleDeleteCoupon(item?._id)}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAddCoupon;
