import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";
import DashboardLayout from "./components/DashboardLayout";
import Layout from "../components/Layout/Layout";
import axios from "axios";
import AddCardIcon from "@mui/icons-material/AddCard";
import HistoryToggleOffIcon from "@mui/icons-material/HistoryToggleOff";
import TollIcon from "@mui/icons-material/Toll";
import getUserData from "../utils/userDataService.js";
import "./Wallet.css";
import { setUser } from "../redux/features/userSlice.js";

const Wallet = () => {
  const { user } = useSelector((state) => state.user);
  const [tab, setTab] = useState(1);
  const dispatch = useDispatch();
  const [form, setForm] = useState({ email: "", amount: "" });
  const [payments, setPayments] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [history, setHistory] = useState(null);
  const [balance, setBalance] = useState("");
  const [gateway, setgateway] = useState("upigateway");

  useEffect(() => {
    getUserData(dispatch, setUser, setBalance);
  }, []);

  async function getUserWalletHistory() {
    try {
      const res = await axios.post("/api/wallet/get-wallet-history", {
        email: user?.email,
      });
      if (res.data.success) {
        setHistory(res.data.data.reverse());
      }
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    if (user !== null) {
      getUserWalletHistory();
    }
  }, [user]);

  const generateOrderId = () => {
    const numbers = "01234567"; // 8 numbers
    const randomNumbers = Array.from({ length: 7 }, () =>
      numbers.charAt(Math.floor(Math.random() * numbers.length))
    );
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0"); // getMonth() is 0-indexed
    const year = String(now.getFullYear()).slice(2); // last two digits of the year
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const orderId = `${year}${month}${day}${seconds}${randomNumbers.join("")}`;
    setOrderId(orderId);
  };

  useEffect(() => {
    generateOrderId();
  }, []);

  async function submitPayment(e) {
    if (form?.amount < 1) {
      return message.error("Enter amount greater than 20");
    }
    try {
      setLoading(true);
      const paymentObject = {
        order_id: orderId,
        txn_amount: form?.amount,
        txn_note: "Wallet Topup Note",
        product_name: "Wallet Topup",
        customer_name: form?.customer_name,
        customer_email: form?.customer_email,
        customer_mobile: form?.customer_mobile,
        callback_url: `https://zelanstore.com/api/wallet/status?orderId=${orderId}`,
      };
      const response = await axios.post("/api/wallet/create", paymentObject, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (response.data.success && response.data.data.status) {
        window.location.href = response.data.data.results.payment_url;
        setLoading(false);
      } else {
        console.log(response.data.message);
        message.error(response.data.message);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      setLoading(false);
    }
  }

  async function handleUPIGateway(e) {
    if (form?.amount < 1) {
      return message.error("Enter amount greater than 20");
    }
    try {
      setLoading(true);
      const paymentObject = {
        orderId: orderId,
        amount: form?.amount,
        paymentNote: "Wallet Topup",
        customerName: form?.customer_name,
        customerEmail: form?.customer_email,
        customerNumber: form?.customer_mobile,
      };
      const response = await axios.post("/api/wallet/create-payment", paymentObject, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (response.data.success && response.data.data.payment_url) {
        window.location.href = response.data.data.payment_url;
        setLoading(false);
      } else {
        console.log(response.data.message);
        message.error(response.data.message);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      setLoading(false);
    }
  }

  async function getUserPayments() {
    try {
      const res = await axios.post("/api/payment/get-user-payments", {
        email: user?.email,
      }, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (res.data.success) {
        setPayments(res.data.data.reverse());
      }
    } catch (error) {
      console.log(error);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [e.target.name]: e.target.value });
    if (name === "amount") {
      if (value < 20) {
        setError(true);
      } else {
        setError(false);
      }
    }
  }

  useEffect(() => {
    if (user?.email) {
      setForm((prev) => ({
        ...prev,
        customer_email: user?.email,
        customer_name: user?.fname,
        customer_mobile: user?.mobile,
      }));
      getUserWalletHistory();
      getUserPayments();
    }
  }, [user]);

  return (
    <Layout>
      <DashboardLayout>
        <div className="wallet-dash">
          <div className="bal w-100">
            <span className="bg-warning py-2 px-3 rounded-2 me-2">Z Coins :</span > 
            <span className="fs-5">{parseFloat(balance).toFixed(2)}</span>
          </div>
          <div
            className={`wallet-dash-card ${tab === 1 && "active"}`}
            onClick={() => setTab(1)}
          >
            Add Z Coin
            <TollIcon className="icon ms-2" />
          </div>
          <div
            className={`wallet-dash-card ${tab === 0 && "active"}`}
            onClick={() => setTab(0)}
          >
            Payment History
            <HistoryToggleOffIcon className="icon ms-2" />
          </div>
          <div
            className={`wallet-dash-card ${tab === 2 && "active"}`}
            onClick={() => setTab(2)}
          >
            Wallet History
            <HistoryToggleOffIcon className="icon ms-2" />
          </div>
        </div>
        
        {/* {tab === 2 && (
          <div className="txn-btns mb-4">
            <button
              onClick={() => setBtn(0)}
              className={`${btn === 0 && "active"}`}
            >
              Addition
            </button>
            <button
              onClick={() => setBtn(1)}
              className={`${btn === 1 && "active"}`}
            >
              Deduction
            </button>
          </div>
        )} */}

        
        {tab === 0 && (
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>#</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments &&
                payments.map((item, index) => {
                  return (
                    <tr>
                      <td>{index + 1}</td>
                      <td>{item.amount}</td>
                      <td>
                        {new Date(item?.createdAt).toLocaleString("default", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                          second: "numeric",
                        })}
                      </td>
                      <td>{item.status}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}

        {/* WALLET HISTORY */}
        {tab === 2 && (
          <div className="overflow-scroll rounded">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Order ID</th>
                  <th className="no-wrap">Before</th>
                  <th>Price</th>
                  <th>After</th>
                  <th>Info</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {history &&
                  history.map((item, index) => {
                    return (
                      <tr>
                        <td>{index + 1}</td>
                        <td>{item.orderId}</td>
                        <td>{item.balanceBefore}</td>
                        <td className={item.price.includes('+') ? 'text-success' : 'text-danger'}>
                          {item.price}
                        </td>
                        <td>{item.balanceAfter}</td>
                        <td className="no-wrap">{item.p_info}</td>
                        <td className="no-wrap">
                          {new Date(item?.created).toLocaleString("default", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "numeric",
                            minute: "numeric"
                          })}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {/* BARCODE  */}
        {tab === 1 && (
          <div className="add-money">
            <div className="txn-details bg-white p-3 rounded">
              <div className="form-fields mb-2">
                <input
                  type="text"
                  className="form-control rounded border-2"
                  placeholder="Enter amount"
                  name="amount"
                  onChange={handleChange}
                  value={form?.amount}
                />
                {error && <div className="login-btn">
                  <small>{"Enter amount greater or equal to 20"}</small>
                </div>}
              </div>
              <button onClick={(e)=> gateway === "upigateway"? handleUPIGateway(e) : submitPayment(e)} className="w-100 theme-btn mt-2">
                Pay Online
              </button>
            </div>
          </div>
        )}
      </DashboardLayout>
    </Layout>
  );
};

export default Wallet;
