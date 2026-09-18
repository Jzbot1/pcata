import React, { useEffect, useState } from "react";
import AdminLayout from "./components/AdminLayout";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import StayCurrentPortraitIcon from "@mui/icons-material/StayCurrentPortrait";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import HelpIcon from "@mui/icons-material/Help";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { message } from "antd";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import { Chart as ChartJS } from "chart.js/auto";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [queries, setQueries] = useState(null);
  const [tabs, setTabs] = useState(0);
  const [toggle, setToggle] = useState(true);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [smileBalance, setSmilebalance] = useState("");
  const [yokcashBalance, setYokcashBalance] = useState("");
  const [moogoldBalance, setMoogoldBalance] = useState("");
  const [moogoldCurrency, setMoogoldCurrency] = useState("USD");

  async function handleMaintenance() {
    try {
      setLoading(true);
      const res = await axios.post(
        "/api/admin/update-website",
        { email: "admin@gmail.com" },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      if (res.data.success) {
        message.success(res.data.message);
        setToggle(true);
        setLoading(false);
        getWebsite();
      } else {
        setLoading(false);
        setToggle(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      setToggle(false);
    }
  }

  async function getWebsite() {
    try {
      const res = await axios.get("/api/admin/get-website");
      if (res.data.success) {
        setToggle(res.data.data.website);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getAllQueries = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/get-all-queries", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (res.data.success) {
        setQueries(res.data.data);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const getAllOrders = async (e) => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/admin-get-all-orders", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (res.data.success) {
        setOrders(res.data.data.reverse());
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const getAllProducts = async () => {
    try {
      const res = await axios.get("/api/product/get-all-products");
      if (res.data.success) {
        setProducts(res.data.data.reverse());
      }
    } catch (error) {
      console.log(error);
    }
  };

  const isToday = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    return (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  };

  const isThisMonth = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  };

  const todaySum = orders
    ?.filter(
      (item) =>
        item?.status?.toLowerCase() === "success" && isToday(item?.createdAt)
    )
    .reduce((acc, order) => {
      const price = parseFloat(order.price);
      return !isNaN(price) ? acc + price : acc;
    }, 0) || 0;

  const thisMonthSum = orders
    ?.filter(
      (item) =>
        item?.status?.toLowerCase() === "success" &&
        isThisMonth(item?.createdAt)
    )
    .reduce((acc, order) => {
      const price = parseFloat(order.price);
      return !isNaN(price) ? acc + price : acc;
    }, 0) || 0;

  const totalSum = orders
    ?.filter((item) => item?.status?.toLowerCase() === "success")
    .reduce((acc, order) => {
      const price = parseFloat(order.price);
      if (!isNaN(price)) {
        return acc + price;
      } else {
        console.error("Invalid price:", order.price);
        return acc;
      }
    }, 0) || 0;

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return `₹${num.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  const getSmilebalance = async () => {
    try {
      const res = await axios.get("/api/admin/smile-balance", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (res.data.success) {
        setSmilebalance(res.data.data);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getYokcashBalance = async () => {
    try {
      const res = await axios.get("/api/yok/get-yokcash-balance", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (res.data.success) {
        setYokcashBalance(res.data.data);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getMoogoldBalance = async () => {
    try {
      const res = await axios.get("/api/admin/moogold-balance", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (res.data.success) {
        setMoogoldBalance(res.data.data);
        if (res.data.currency) {
          setMoogoldCurrency(res.data.currency);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getMaintenanceStatus = async () => {
    try {
      const res = await axios.get("/api/maintenance/status");
      if (res.data.success && res.data.data) {
        setIsMaintenance(res.data.data.isMaintenance);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getSmilebalance();
    getYokcashBalance();
    getMoogoldBalance();
    getAllOrders();
    getAllQueries();
    getAllProducts();
    getMaintenanceStatus();
  }, []);

  const calculateMonthlyOrders = () => {
    const monthlyOrders = {};
    orders?.forEach((order) => {
      const month = new Date(order?.createdAt).getMonth();
      if (!monthlyOrders[month]) {
        monthlyOrders[month] = 1;
      } else {
        monthlyOrders[month]++;
      }
    });
    return monthlyOrders;
  };

  // Format monthly orders data for chart
  const formatMonthlyOrdersForChart = () => {
    const monthlyOrders = calculateMonthlyOrders();
    const labels = Object.keys(monthlyOrders).map((month) => {
      return new Date(0, month).toLocaleString("default", { month: "long" });
    });
    const data = Object.values(monthlyOrders);
    return { labels, data };
  };

  // Data for the bar chart
  const monthlyOrdersData = formatMonthlyOrdersForChart();

  // Calculate total sales for each month
  const calculateMonthlySales = () => {
    const monthlySales = {};
    orders.forEach((order) => {
      const month = new Date(order.createdAt).getMonth();
      const totalPrice = parseFloat(order.price);
      if (!isNaN(totalPrice)) {
        if (!monthlySales[month]) {
          monthlySales[month] = totalPrice;
        } else {
          monthlySales[month] += totalPrice;
        }
      }
    });
    return monthlySales;
  };

  // Format monthly sales data for chart
  const formatMonthlySalesForChart = () => {
    const monthlySales = calculateMonthlySales();
    const labels = Object.keys(monthlySales).map((month) => {
      return new Date(0, month).toLocaleString("default", { month: "long" });
    });
    const data = Object.values(monthlySales);
    return { labels, data };
  };

  // Data for the line chart
  const monthlySalesData = formatMonthlySalesForChart();

  return (
    <AdminLayout>
      <div className="admin-dashboard-page">
        <div className="dashboard-header-banner">
          <div>
            <h2 className="dashboard-header-title">Welcome to Store Overview 👋</h2>
            <p className="dashboard-header-subtitle">
              Real-time sales, live orders, wallet balances, and system status
            </p>
          </div>
          <div className="dashboard-header-actions">
            <button
              className="action-3d-btn px-3 py-2"
              onClick={() => navigate("/admin-products")}
            >
              + Manage Products
            </button>
            <button
              className="action-3d-btn px-3 py-2"
              style={{ background: "linear-gradient(180deg, #2d5533 0%, #1b3820 100%)" }}
              onClick={() => navigate("/admin-orders")}
            >
              View Orders
            </button>
          </div>
        </div>

        <div className="admin-dashboard-container">
          <div className="dash-card" onClick={() => navigate("/admin-orders")}>
            <div className="count">
              <span className="dash-label">Total Orders</span>
              <h1>
                {loading ? (
                  <div className="spinner-border spinner-border-sm text-success" role="status" />
                ) : (
                  orders?.length || 0
                )}
              </h1>
            </div>
            <div className="dash-icon-box green">
              <PointOfSaleIcon />
            </div>
          </div>

          <div className="dash-card" onClick={() => navigate("/admin-orders")}>
            <div className="count">
              <span className="dash-label">Today's Sale</span>
              <h2>
                {loading ? (
                  <div className="spinner-border spinner-border-sm text-success" role="status" />
                ) : (
                  formatCurrency(todaySum)
                )}
              </h2>
            </div>
            <div className="dash-icon-box gold">
              <MonetizationOnIcon />
            </div>
          </div>

          <div className="dash-card" onClick={() => navigate("/admin-orders")}>
            <div className="count">
              <span className="dash-label">This Month</span>
              <h2>
                {loading ? (
                  <div className="spinner-border spinner-border-sm text-success" role="status" />
                ) : (
                  formatCurrency(thisMonthSum)
                )}
              </h2>
            </div>
            <div className="dash-icon-box teal">
              <MonetizationOnIcon />
            </div>
          </div>

          <div className="dash-card" onClick={() => navigate("/admin-payments")}>
            <div className="count">
              <span className="dash-label">Total Sales</span>
              <h2>
                {loading ? (
                  <div className="spinner-border spinner-border-sm text-success" role="status" />
                ) : (
                  formatCurrency(totalSum)
                )}
              </h2>
            </div>
            <div className="dash-icon-box amber">
              <MonetizationOnIcon />
            </div>
          </div>

          <div className="dash-card" onClick={() => navigate("/admin-orders")}>
            <div className="count">
              <span className="dash-label">Smile Coin</span>
              <h1>
                {loading ? (
                  <div className="spinner-border spinner-border-sm text-success" role="status" />
                ) : (
                  smileBalance || "0.00"
                )}
              </h1>
            </div>
            <div className="dash-icon-box purple">
              <PointOfSaleIcon />
            </div>
          </div>

          <div className="dash-card" onClick={() => navigate("/admin-orders")}>
            <div className="count">
              <span className="dash-label">Yok Cash</span>
              <h3>
                {loading ? (
                  <div className="spinner-border spinner-border-sm text-success" role="status" />
                ) : (
                  yokcashBalance || "0.00"
                )}
              </h3>
            </div>
            <div className="dash-icon-box blue">
              <PointOfSaleIcon />
            </div>
          </div>

          <div className="dash-card" onClick={() => navigate("/admin-orders")}>
            <div className="count">
              <span className="dash-label">MooGold Bal</span>
              <h3>
                {loading ? (
                  <div className="spinner-border spinner-border-sm text-success" role="status" />
                ) : (
                  moogoldBalance ? `${moogoldBalance} ${moogoldCurrency}` : "0.00"
                )}
              </h3>
            </div>
            <div className="dash-icon-box green">
              <PointOfSaleIcon />
            </div>
          </div>

          <div className="dash-card" onClick={() => navigate("/admin-products")}>
            <div className="count">
              <span className="dash-label">Total Products</span>
              <h1>
                {loading ? (
                  <div className="spinner-border spinner-border-sm text-success" role="status" />
                ) : (
                  products?.length || 0
                )}
              </h1>
            </div>
            <div className="dash-icon-box teal">
              <StayCurrentPortraitIcon />
            </div>
          </div>

          <div className="dash-card" onClick={() => navigate("/admin-queries")}>
            <div className="count">
              <span className="dash-label">Pending Queries</span>
              <h1>
                {loading ? (
                  <div className="spinner-border spinner-border-sm text-success" role="status" />
                ) : (
                  queries?.filter((item) => item.status === "pending").length || 0
                )}
              </h1>
            </div>
            <div className="dash-icon-box blue">
              <HelpIcon />
            </div>
          </div>

          <div className="dash-card" onClick={() => navigate("/admin-maintenance")}>
            <div className="count">
              <span className="dash-label">Maintenance Mode</span>
              <h2 className="mt-1">
                <span className={`badge ${isMaintenance ? "bg-danger" : "bg-success"}`} style={{ fontSize: "0.88rem", padding: "6px 12px", borderRadius: "20px" }}>
                  {isMaintenance ? "ACTIVE ⚠️" : "OFF (LIVE) 🟢"}
                </span>
              </h2>
            </div>
            <div className={`dash-icon-box ${isMaintenance ? "red" : "green"}`}>
              <BuildCircleIcon />
            </div>
          </div>
        </div>

        <div className="admin-recent-things">
          <div className="recent-orders">
            <div className="recent-card-header">
              <h4>Recent Orders</h4>
              <button className="recent-view-all-btn" onClick={() => navigate("/admin-orders")}>
                View All →
              </button>
            </div>
            <div className="table-responsive">
              <table className="admin-dashboard-table">
                <thead>
                  <tr>
                    <th>Order Id</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders?.slice(0, 5).map((item, index) => (
                    <tr key={index}>
                      <td>
                        <span className="order-id-chip">{item?.orderId}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.85rem" }}>{item?.customer_email}</span>
                      </td>
                      <td>
                        <span className="order-price-chip">₹{item?.price}</span>
                      </td>
                      <td>
                        <small className="text-muted">
                          {new Date(item?.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </small>
                      </td>
                      <td>
                        <button
                          className="action-icon-btn"
                          title="View Order"
                          onClick={() => navigate(`/admin-view-order/${item?.orderId}`)}
                        >
                          <RemoveRedEyeIcon style={{ fontSize: "18px" }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!orders || orders.length === 0) && (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">
                        No recent orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="recent-queries">
            <div className="recent-card-header">
              <h4>Recent Queries</h4>
              <button className="recent-view-all-btn" onClick={() => navigate("/admin-queries")}>
                View All →
              </button>
            </div>
            <div className="table-responsive">
              <table className="admin-dashboard-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {queries
                    ?.filter((item) => item.status === "pending")
                    .slice(0, 5)
                    .map((item, index) => (
                      <tr key={index}>
                        <td>
                          <b>{item?.name}</b>
                        </td>
                        <td>
                          <span style={{ fontSize: "0.85rem" }}>{item?.email}</span>
                        </td>
                        <td>
                          <small>{item?.mobile}</small>
                        </td>
                        <td>
                          <button
                            className="action-icon-btn"
                            title="View Query"
                            onClick={() => navigate("/admin-queries")}
                          >
                            <RemoveRedEyeIcon style={{ fontSize: "18px" }} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  {(!queries || queries.filter((item) => item.status === "pending").length === 0) && (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-muted">
                        No pending queries.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
