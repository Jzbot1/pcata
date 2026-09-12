import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Layout from "../components/Layout/Layout";
import DashboardLayout from "./components/DashboardLayout";
import axios from "axios";
import "./Orders.css";

const Orders = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [allOrders, setAllOrders] = useState(null);
  const [loading, setLoading] = useState(false);

  const getAllUserOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        "/api/order/get-user-orders",
        { email: user?.email },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      if (res.data.success) {
        setAllOrders(res.data.data.reverse());
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    if (user !== null) {
      getAllUserOrders();
      // getUSerOrderStatus();
    }
  }, [user]);

  return (
    <Layout>
      <DashboardLayout>
        <div className="user-order-container">
          {loading ? (
            <div className="loader-container text-center">Loading..</div>
          ) : allOrders === null ? (
            <div className="no-order-found">
              <b>No Order Found</b>
              <button
                className="btn text-decoration-underline"
                onClick={() => navigate("/games")}
              >
                Go to Shop
              </button>
            </div>
          ) : (
            <div className="overflow-scroll rounded border">
              <table className="table table-bordered table-warning mb-0">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allOrders?.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td>{item?.orderId}</td>
                        <td className="no-wrap">
                          {item?.createdAt
                            ? new Date(item.createdAt).toLocaleDateString(
                                "default",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "numeric"
                                }
                              )
                            : ""}
                        </td>
                        <td className={`${item?.status === "failed"? "text-danger" : item?.status === "pending"? "text-warning" : "text-success"}`}>{item?.status}</td>
                        <td>{item?.price}</td>
                        <td>
                          <button
                            onClick={() =>
                              navigate(`/view-order/${item?.orderId}`)
                            }
                            className={`text-light btn btn-sm rounded ${item?.status === "failed"? "bg-danger" : "bg-success"}`}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DashboardLayout>
    </Layout>
  );
};

export default Orders;
