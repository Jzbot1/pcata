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
      <div className="page-title">
        <h3 className="m-0">Dashboard</h3>
        {/* <div className={`toggle-icon`} onClick={handleMaintenance}>
          <div className={`circle ${toggle && "active"}`}>
            {loading && (
              <div class="spinner-grow spinner-grow-sm" role="status">
                <span class="sr-only"></span>
              </div>
            )}
          </div>
        </div> */}
      </div>
      <hr />
      {/* <div className="chart-container">
        <div className="chartOne">
          <h4>Total Orders</h4>
          <div className="hr-line"></div>
          <Bar
            data={{
              labels: monthlyOrdersData.labels,
              datasets: [
                {
                  label: "Total Orders",
                  data: monthlyOrdersData.data,
                  backgroundColor: "#ffca00",
                  borderWidth: 0,
                },
              ],
            }}
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
        <div className="chartTwo">
          <h4>Total Sales</h4>
          <div className="hr-line"></div>
          <Line
            data={{
              labels: monthlySalesData.labels,
              datasets: [
                {
                  label: "Total Sales",
                  data: monthlySalesData.data,
                  fill: false,
                  borderColor: "rgba(75,192,192,1)",
                  borderWidth: 2,
                  pointRadius: 3,
                  pointBackgroundColor: "rgba(75,192,192,1)",
                  pointBorderColor: "rgba(75,192,192,1)",
                  pointHoverRadius: 5,
                  pointHoverBackgroundColor: "rgba(75,192,192,1)",
                  pointHoverBorderColor: "rgba(75,192,192,1)",
                },
              ],
            }}
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      </div> */}
      <div className="admin-dashboard-container p-0">
        <div className="dash-card" onClick={() => navigate("/admin-orders")}>
          <div className="count">
            <h1 className="m-0">
              {loading ? (
                <div class="spinner-border spinner-border-sm" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              ) : (
                <b>{orders?.length || 0}</b>
              )}
            </h1>
            <span className="text-muted">Total Orders</span>
          </div>
          <PointOfSaleIcon className="icon" />
        </div>

        <div className="dash-card" onClick={() => navigate("/admin-orders")}>
          <div className="count">
            <h2 className="m-0">
              {loading ? (
                <div class="spinner-border spinner-border-sm" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              ) : (
                <b>{formatCurrency(todaySum)}</b>
              )}
            </h2>
            <span className="text-muted">Today's Sale</span>
          </div>
          <MonetizationOnIcon className="icon" />
        </div>

        <div className="dash-card" onClick={() => navigate("/admin-orders")}>
          <div className="count">
            <h2 className="m-0">
              {loading ? (
                <div class="spinner-border spinner-border-sm" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              ) : (
                <b>{formatCurrency(thisMonthSum)}</b>
              )}
            </h2>
            <span className="text-muted">This Month's Sale</span>
          </div>
          <MonetizationOnIcon className="icon" />
        </div>

        <div className="dash-card" onClick={() => navigate("/admin-payments")}>
          <div className="count">
            <h2 className="m-0">
              {loading ? (
                <div class="spinner-border spinner-border-sm" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              ) : (
                <b>{formatCurrency(totalSum)}</b>
              )}
            </h2>
            <span className="text-muted">Total Sales</span>
          </div>
          <MonetizationOnIcon className="icon" />
        </div>

        <div className="dash-card" onClick={() => navigate("/admin-orders")}>
          <div className="count">
            <h1 className="m-0">
              {loading ? (
                <div class="spinner-border spinner-border-sm" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              ) : (
                <b>{smileBalance || 0}</b>
              )}
            </h1>
            <span className="text-muted">Smile Coin</span>
          </div>
          <PointOfSaleIcon className="icon" />
        </div>

        <div className="dash-card" onClick={() => navigate("/admin-orders")}>
          <div className="count">
            <h3 className="m-0">
              {loading ? (
                <div class="spinner-border spinner-border-sm" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              ) : (
                <b>{yokcashBalance || 0}</b>
              )}
            </h3>
            <span className="text-muted">Yok Bal</span>
          </div>
          <PointOfSaleIcon className="icon" />
        </div>

        <div className="dash-card" onClick={() => navigate("/admin-orders")}>
          <div className="count">
            <h3 className="m-0">
              {loading ? (
                <div class="spinner-border spinner-border-sm" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              ) : (
                <b>{moogoldBalance ? `${moogoldBalance} ${moogoldCurrency}` : "0.00"}</b>
              )}
            </h3>
            <span className="text-muted">MooGold Bal</span>
          </div>
          <PointOfSaleIcon className="icon" />
        </div>

        <div className="dash-card" onClick={() => navigate("/admin-products")}>
          <div className="count">
            <h1 className="m-0">
              {loading ? (
                <div class="spinner-border spinner-border-sm" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              ) : (
                <b>{products?.length || 0}</b>
              )}
            </h1>
            <span className="text-muted">Total Products</span>
          </div>
          <StayCurrentPortraitIcon className="icon" />
        </div>

        <div className="dash-card" onClick={() => navigate("/admin-queries")}>
          <div className="count">
            <h1 className="m-0">
              {loading ? (
                <div class="spinner-border spinner-border-sm" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              ) : (
                <b>
                  {queries?.filter((item) => {
                    return item.status === "pending";
                  }).length || 0}
                </b>
              )}
            </h1>
            <span className="title">Queries</span>
          </div>
          <HelpIcon className="icon" />
        </div>

        <div className="dash-card" onClick={() => navigate("/admin-maintenance")}>
          <div className="count">
            <h2 className="m-0">
              <span className={`badge ${isMaintenance ? "bg-danger" : "bg-success"}`} style={{ fontSize: "1rem" }}>
                {isMaintenance ? "ACTIVE ⚠️" : "OFF (LIVE) 🟢"}
              </span>
            </h2>
            <span className="text-muted">Maintenance Mode</span>
          </div>
          <BuildCircleIcon className="icon text-warning" />
        </div>
      </div>
      <div className="admin-recent-things">
        <div className="recent-orders">
          <h5>Recent Orders</h5>
          <hr />
          <table className="table ">
            <thead>
              <tr>
                <th>Order Id</th>
                <th>Email</th>
                <th>Total</th>
                <th>Date</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {orders
                ?.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td>
                        <small>{item?.orderId}</small>
                      </td>
                      <td>
                        <small>{item?.customer_email}</small>
                      </td>
                      <td>
                        <small>{item?.price}</small>
                      </td>
                      <td>
                        <small>
                          {new Date(item?.createdAt).toLocaleString("default", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </small>
                      </td>
                      <td>
                        <RemoveRedEyeIcon
                          onClick={() =>
                            navigate(`/admin-view-order/${item?.orderId}`)
                          }
                          className="text-success icon"
                        />
                      </td>
                    </tr>
                  );
                })
                .slice(0, 5)}
            </tbody>
          </table>
        </div>
        <div className="recent-queries">
          <h5>Recent Queries</h5>
          <hr />
          <table className="table ">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {queries &&
                queries
                  ?.filter((item) => {
                    return item.status === "pending";
                  })
                  .map((item, index) => {
                    return (
                      <tr key={index}>
                        <td>
                          <small>{item?.name}</small>
                        </td>
                        <td>
                          <small>{item?.email}</small>
                        </td>
                        <td>
                          <small>{item?.mobile}</small>
                        </td>
                        <td>
                          <button
                            className="register-btn p-1"
                            onClick={() => navigate("/admin-queries")}
                          >
                            View
                          </button>
                          {/* <small>{(item?.msg).slice(0, 10)}..</small> */}
                        </td>
                      </tr>
                    );
                  })
                  .slice(0, 5)}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
