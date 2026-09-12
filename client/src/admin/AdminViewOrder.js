import React, { useEffect, useState } from "react";
import AdminLayout from "./components/AdminLayout";
import { useParams } from "react-router-dom";
import "./AdminViewOrder.css";
import axios from "axios";
import { message } from "antd";
import EditIcon from "@mui/icons-material/Edit";

const AdminViewOrder = () => {
  const params = useParams();
  const [singleOrder, setSingleOrder] = useState(null);
  const [status, setStatus] = useState(null);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "/api/admin/update-order",
        {
          status,
          orderId: singleOrder?.orderId,
        },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      if (res.data.success) {
        message.success(res.data.message);
        getOrderById();
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getOrderById = async () => {
    try {
      const res = await axios.post(
        "/api/order/get-order-by-id",
        {
          orderId: params?.orderId,
        },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      if (res.data.success) {
        setSingleOrder(res.data.data);
        setStatus(res.data.data.status);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getOrderById();
  }, []);

  return (
    <AdminLayout>
      <div className="admin-users-container">
        <div className="page-title">
          <h3 className="m-0">Order Details</h3>
          <br />
        </div>
        <div className="admin-view-order-container">
          <div className="admin-order-details-container">
            <h5 className="m-0">Order #{params?.orderId}</h5>
            {/* <span className="text-muted">Payment via Cash on delivery.</span> */}
            <hr />
            {/* <div className="admin-order-item-details">
              <h5 className="m-0 mb-3">Order Item</h5>
              <div className="admin-order-item">
                <div className="item-brand">
                  <span>Game</span>
                </div>
                <div className="item-cost">Price</div>
                <div className="item-qty">Qty</div>
                <div className="item-qty">Player ID</div>
              </div>
              <div className="admin-order-item">
                <div className="item-brand">
                  <span className="text-decoration-underline">
                    <small>{singleOrder?.p_info}</small>
                  </span>
                </div>
                <div className="item-cost">
                  <b>{singleOrder?.price}</b>
                </div>
                <div className="item-qty">{singleOrder?.amount}</div>
                <div className="item-qty">{singleOrder?.playerId}</div>
              </div>
            </div> */}
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>ID</td>
                  <td>{singleOrder?.orderId}</td>
                </tr>
                <tr>
                  <td>Price</td>
                  <td>Rs. {singleOrder?.price}</td>
                </tr>
                {singleOrder?.discount && <tr>
                  <td>Discount</td>
                  <td className={`${singleOrder?.status === "failed"? "bg-danger text-light" : "bg-success text-light"}`}>{singleOrder?.discount}</td>
                </tr>}
                <tr>
                  <td>Status</td>
                  <td>{singleOrder?.status}</td>
                </tr>
                <tr>
                  <td>Amount (QTY) </td>
                  <td>{singleOrder?.p_info}</td>
                </tr>
                {singleOrder?.playerId && <tr>
                  <td>PlayerId</td>
                  <td>{singleOrder?.playerId}</td>
                </tr>}
                {singleOrder?.userId && <tr>
                  <td>User ID</td>
                  <td>{singleOrder?.userId}</td>
                </tr>}
                {singleOrder?.zoneId !== "" && singleOrder?.zoneId !== null && (
                  <tr>
                    <td>Zone ID</td>
                    <td>{singleOrder?.zoneId}</td>
                  </tr>
                )}
                <tr>
                  <td>Date</td>
                  <td>
                    {singleOrder?.createdAt
                      ? new Date(singleOrder.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : ""}
                  </td>
                </tr>
                <tr>
                  <td>Payment Mode</td>
                  <td>{singleOrder?.paymentMode?.toUpperCase()}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* ====================== ACTION ===================== */}
          <div className="admin-order-actions">
            <div className="form-fields">
              <select
                onChange={(e) => setStatus(e.target.value)}
                value={status}
                name="status"
                className="form-select"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="success">Success</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
                <option value="failed">Failed</option>
              </select>
              <button className="add-to-cart-btn w-100" onClick={handleUpdate}>
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminViewOrder;
