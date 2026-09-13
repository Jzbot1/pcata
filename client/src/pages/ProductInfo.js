import React, { useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";
import IMAGES from "../img/image";
import axios from "axios";
import { message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import getUserData from "../utils/userDataService.js";
import { setUser } from "../redux/features/userSlice.js";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TollIcon from "@mui/icons-material/Toll";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelIcon from "@mui/icons-material/Cancel";
import "./ProductInfo.css";
import { original } from "@reduxjs/toolkit";

const ProductInfo = () => {
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState("");
  const [playerCheck, setPlayerCheck] = useState(null);
  const [product, setProduct] = useState(0);
  const [showImage, setShowImage] = useState(0);
  const [error, setError] = useState(false);
  const [mode, setMode] = useState("WALLET");
  const [payment, setPayment] = useState("WALLET");
  const [paymentOptions, setPaymentOptions] = useState("");
  //!NEW STATE
  const [amount, setAmount] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [productId, setProductId] = useState("");
  //! API BASED
  const [orderId, setOrderId] = useState(false);
  const [userId, setUserId] = useState("");
  const [zoneId, setZoneId] = useState("");
  // const [balance, setBalance] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [data, setData] = useState(null);
  const [coupon, setCoupon] = useState(null);
  const [couponApplied, setCouponApplied] = useState(null);
  const [discount, setDiscount] = useState("");
  const [finalAmount, setFinalAmount] = useState("");
  const [singleCouponeData, setSingleCouponData] = useState(null);

  useEffect(() => {
    getAllCoupons();
  }, []);

  const getAllCoupons = async () => {
    try {
      const res = await axios.get("/api/admin/get-coupons");
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  function applyCoupon(e) {
    e.preventDefault();
    if (data?.length === 0 || data === null) {
      return message.error("No Coupon Found");
    }
    if (coupon === "") {
      setError(true);
      setTimeout(() => {
        setError(false);
      }, 1500);
      return;
    }
    // find coupon
    const couponCode = data && data?.find((item) => item.name === coupon);
    setSingleCouponData(couponCode);

    if (!couponCode) {
      return message.error("No Coupon Found");
    }

    if (couponCode?.minValue >= selectedPrice) {
      message.error(`Minimum order value is: ${couponCode?.minValue}`);
      return;
    }
    //
    if (coupon) {
      setCouponApplied(true);
      setDiscount(couponCode?.discount);
      setFinalAmount(selectedPrice - couponCode?.discount);
      message.success("Coupon applied success");
    } else {
      message.error("No coupon found");
    }
  }

  const removeDiscount = () => {
    setCouponApplied(false);
    setFinalAmount((prev) => prev + discount);
  };

  // ==== COUPON

  function setPriceAndId(amount) {
    if (user?.reseller === "yes") {
      const price = product?.cost?.find(
        (item) => item.amount === amount
      )?.resPrice;
      setSelectedPrice(price);
      setFinalAmount(price);
      const id = product?.cost?.find((item) => item.amount === amount)?.id;
      setProductId(id);
      if (couponApplied) {
        setCouponApplied(false);
      }
    } else {
      const price = product?.cost?.find(
        (item) => item.amount === amount
      )?.price;
      setSelectedPrice(price);
      setFinalAmount(price);
      const id = product?.cost?.find((item) => item.amount === amount)?.id;
      setProductId(id);
      if (couponApplied) {
        setCouponApplied(false);
      }
    }
  }

  const getProduct = async () => {
    try {
      const res = await axios.post("/api/product/get-product-by-name", {
        name: params.name,
      });
      if (res.data.success) {
        setProduct(res.data.data);
        const defaultAmount = res.data.data?.cost?.[0]?.amount;
        const defaultPrice =
          user?.reseller === "yes"
            ? res.data.data?.cost?.[0]?.resPrice
            : res.data.data?.cost?.[0]?.price;
        const defaultId = res.data.data?.cost?.[0]?.id;
        setAmount(defaultAmount);
        setSelectedPrice(defaultPrice);
        setFinalAmount(defaultPrice);
        setProductId(defaultId);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUserData(dispatch, setUser, setBalance);
    getProduct();
  }, []);

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

  async function handleCheckPlayer() {
    if (!userId || !userId.trim()) {
      return message.error("Please enter User ID");
    }
    if (product?.fields === "2" && (!zoneId || !zoneId.trim())) {
      return message.error("Please enter Zone ID");
    }
    try {
      const object = {
        userid: userId.trim(),
        zoneid: zoneId.trim(),
        apiName: product?.apiName,
        region: product?.region,
        gameName: product?.gameName,
        name: product?.name,
      };
      setLoading(true);
      const res = await axios.post("/api/payment/get-role", object);
      if (res.data.success) {
        message.success(`Verified: ${res.data.username}`);
        setPlayerCheck(res.data.username);
        setLoading(false);
      } else {
        setPlayerCheck(null);
        message.error(res.data.message || "Invalid player details");
        setLoading(false);
      }
    } catch (error) {
      setPlayerCheck(null);
      message.error("Something went wrong while checking username");
      console.log(error);
      setLoading(false);
    }
  }

  //* ================================= ORDER SYSTEM ==========================================

  function checkPlaceOrder(e) {
    if (product?.playerCheckBtn === "yes") {
      if (playerCheck === null) {
        return message.error("Check your username");
      }
    }
    if (product?.api === "no") {
      if (userId === "") {
        return message.error("Some Fields are missing");
      }
    } else if (product.api === "yes" && product?.apiName === "moogold") {
      if (product?.gameName === "15145") {
        if (userId === "") {
          return message.error("Enter User ID");
        }
        if (zoneId === "") {
          return message.error("Enter Zone ID");
        }
      }
    } else {
      if (userId === "") {
        return message.error("Enter User ID");
      }
      if (zoneId === "") {
        return message.error("Enter Zone ID");
      }
    }

    if (product?.api === "yes") {
      if (product?.apiName === "yokcash") {
        if (mode === "UPI") {
          handleYokcashUpiOrder(e);
        } else {
          handleYokcashWalletOrder(e);
        }
      } else if (product?.apiName === "smileOne") {
        if (mode === "UPI") {
          handleSmileOneUpiOrder(e);
        } else {
          handleSmileOneWalletOrder(e);
        }
      } else if (product?.apiName === "moogold") {
        if (mode === "UPI") {
          handleMoogoldUpiOrder(e);
        } else {
          handleMoogoldWalletOrder(e);
        }
      }
    } else {
      if (mode === "UPI") {
        handleUpiOrder(e);
      } else {
        handleWalletOrder(e);
      }
    }
  }

  // yokcash
  async function handleYokcashUpiOrder(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const paymentObject = {
        order_id: orderId,
        customer_name: user?.fname,
        customer_email: user?.email,
        customer_mobile: user?.mobile,
        ...(singleCouponeData ? { couponId: singleCouponeData._id } : {}), // ✅ Conditional property
        txn_note:
          userId +
          "@" +
          (zoneId || "none") +
          "@" +
          productId +
          "@" +
          product?.name +
          "@" +
          amount +
          "@" +
          selectedPrice,
      };
      const response = await axios.post("/api/yok/create-order", paymentObject, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (response.data.success && response.data.data.payment_url) {
        window.location.href = response.data.data.payment_url;
        setLoading(false);
      } else {
        message.error(response.data.message);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
    } finally{
      setLoading(false);
    }
  }
  async function handleYokcashWalletOrder(e) {
    if (parseInt(balance) < parseInt(finalAmount)) {
      return message.error("Balance is less for this order");
    }
    try {
      setLoading(true);
      const orderObject = {
        orderId: orderId,
        userid: userId,
        zoneid: zoneId,
        productids: productId,
        customer_mobile: user?.mobile,
        pname: product?.name,
        amount: amount,
        price: selectedPrice,
        ...(singleCouponeData ? { couponId: singleCouponeData._id } : {}) // ✅ Conditional property
      };

      const res = await axios.post("/api/yok/wallet", orderObject, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      if (res.data.success) {
        message.success(res.data.message);
        setOrderSuccess(true);
        setLoading(false);
      } else {
        setLoading(false);
        message.error(res.data.message);
      }
    } catch (error) {
      setLoading(false);
      setOrderSuccess(false);

      if (error.response && error.response.status === 500) {
        const serverMessage = error.response.data.message || "Sorry, there was a problem while placing your order.";

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Order Failed</title>
          <style>
            body {
              padding: 0;
              font-family: Arial, sans-serif;
              background: #f4f6ff;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
            }

            .container {
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 4px 15px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 450px;
            }

            h1 {
              color: #e63946;
              font-size: 48px;
              margin: 0;
            }

            p {
              color: #555;
              margin: 15px 0 25px 0;
            }
            h5 {
              color: #ed0000;
              margin: 15px 0 25px 0;
            }

            a {
              text-decoration: none;
              background: #4f46e5;
              color: white;
              padding: 10px 18px;
              border-radius: 6px;
              font-weight: 600;
              display: inline-block;
            }

            a:hover {
              background: #4338ca;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>500</h1>
            <h3>Order Failed</h3>
            <h5>${serverMessage}</h5>
            <p>Sorry, there was a problem while placing your order.</p>
            <a href="/">Go Back Home</a>
          </div>
        </body>
        </html>
        `;

        document.open();
        document.write(html);
        document.close();
      }

      console.log(error);
    }
  }

  // smile
  const handleSmileOneUpiOrder = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const paymentObject = {
        order_id: orderId,
        product_name: product?.region,
        customer_name: user?.fname,
        customer_email: user?.email,
        customer_mobile: user?.mobile,
        ...(singleCouponeData ? { couponId: singleCouponeData._id } : {}), // ✅ Conditional property
        txn_note:
          userId +
          "@" +
          zoneId +
          "@" +
          productId +
          "@" +
          product?.name +
          "@" +
          amount +
          "@" +
          selectedPrice,
      };

      const response = await axios.post("/api/smile/create-order", paymentObject, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      
      if (response.data.success && response.data.data.payment_url) {
        window.location.href = response.data.data.payment_url;
        setLoading(false);
      } else {
        message.error(response.data.message);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };
  const handleSmileOneWalletOrder = async (e) => {
    if (parseInt(balance) < parseInt(selectedPrice)) {
      return message.error("Balance is less for this order");
    }
    e.preventDefault();
    const orderObject = {
      orderId: orderId,
      userid: userId,
      zoneid: zoneId,
      productid: productId,
      region: product?.region,
      customer_email: user?.email,
      customer_mobile: user?.mobile,
      pname: product?.name,
      amount: amount,
      price: selectedPrice,
      ...(singleCouponeData ? { couponId: singleCouponeData._id } : {}) // ✅ Conditional property
    };

    setLoading(true);
    const res = await axios.post("/api/smile/wallet", orderObject, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    if (res.data.success) {
      message.success(res.data.message);
      setOrderSuccess(true);
      setLoading(false);
    } else {
      setLoading(false);
      message.error(res.data.message);
    }
  };

  // moogold
  async function handleMoogoldUpiOrder(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const paymentObject = {
        order_id: orderId,
        gameId: product?.gameName,
        customer_name: user?.fname,
        customer_email: user?.email,
        customer_mobile: user?.mobile,
        ...(singleCouponeData ? { couponId: singleCouponeData._id } : {}), // ✅ Conditional property
        txn_note:
          userId +
          "@" +
          zoneId +
          "@" +
          productId +
          "@" +
          product?.name +
          "@" +
          amount +
          "@" +
          selectedPrice,
      };

      const response = await axios.post("/api/moogold/create-order", paymentObject, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (response.data.success && response.data.data.payment_url) {
        window.location.href = response.data.data.payment_url;
        setLoading(false);
      } else {
        message.error(response.data.message);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }
  async function handleMoogoldWalletOrder(e) {
    if (parseInt(balance) < parseInt(selectedPrice)) {
      return message.error("Balance is less for this order");
    }
    e.preventDefault();
    try {
      const orderObject = {
        api: product?.api,
        orderId: orderId,
        userid: userId,
        zoneid: zoneId,
        productid: productId,
        pname: product?.name,
        amount: amount,
        gameName: product?.gameName,
        customer_name: user?.fname,
        customer_email: user?.email,
        customer_mobile: user?.mobile,
        price: selectedPrice,
        ...(singleCouponeData ? { couponId: singleCouponeData._id } : {}) // ✅ Conditional property
      };

      setLoading(true);
      const res = await axios.post("/api/moogold/wallet", orderObject, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (res.data.success) {
        message.success(res.data.message);
        setLoading(false);
        setOrderSuccess(true);
        navigate("/user-dashboard");
      } else {
        setLoading(false);
        setOrderSuccess(false);
        message.error(res.data.message);
      }
    } catch (error) {
      setLoading(false);
      setOrderSuccess(false);
      console.log(error);
    }
  }

  // manual
  const handleUpiOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const paymentObject = {
        order_id: orderId,
        txn_amount: selectedPrice,
        txn_note: userId.trim() + "@" + zoneId.trim() + "@" + amount,
        product_name: product?.name,
        customer_name: user?.fname,
        customer_mobile: user?.mobile,
        customer_email: user?.email,
        ...(singleCouponeData ? { couponId: singleCouponeData._id } : {}),
      };

      const response = await axios.post("/api/manual/create-order", paymentObject, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (response.data.success && response.data.data.payment_url) {
        window.location.href = response.data.data.payment_url;
        setLoading(false);
      } else {
        message.error(response.data.message);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };
  const handleWalletOrder = async (e) => {
    if (parseInt(balance) < parseInt(selectedPrice)) {
      return message.error("Balance is less for this order");
    }
    e.preventDefault();
    try {
      const orderObject = {
        api: "no",
        orderId: orderId,
        userid: userId.trim(),
        zoneid: zoneId.trim(),
        customer_email: user && user?.email,
        customer_mobile: user && user?.mobile,
        pname: product?.name,
        amount: amount,
        price: selectedPrice,
        ...(singleCouponeData ? { couponId: singleCouponeData._id } : {}),
      };

      setLoading(true);
      const res = await axios.post("/api/manual/wallet", orderObject, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (res.data.success) {
        setLoading(false);
        message.success(res.data.message);
        setOrderSuccess(true);
      } else {
        message.error(res.data.message);
        setLoading(false);
        localStorage.setItem("orderProcess", "no");
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      localStorage.setItem("orderProcess", "no");
    }
  };

  return (
    <Layout>
      {orderSuccess ? (
        <div className="order-succcess-container">
          <div className="heading">
            <CheckCircleIcon className="icon" />
            <h5>Order Successful</h5>
            <button
              onClick={() => {
                setOrderSuccess(false);
                generateOrderId();
              }}
            >
              Order Again
            </button>
          </div>
          <div className="order-recpt">
            <div className="order-item">
              <span>Product Name</span>
              <span>{product?.name}</span>
            </div>
            <div className="order-item">
              <span>Order Id</span>
              <span>{orderId}</span>
            </div>
            <div className="order-item">
              <span>User Id</span>
              <span>{userId}</span>
            </div>
            {zoneId !== "" && (
              <div className="order-item">
                <span>Zone Id</span>
                <span>{zoneId}</span>
              </div>
            )}
            <div className="order-item">
              <span>Pack</span>
              <span>{amount}</span>
            </div>
            <div className="order-item">
              <span>Wallet Balance</span>
              <span>{balance}</span>
            </div>
            <div className="order-item">
              <span>Balance After Order</span>
              <span>{balance - selectedPrice}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="product-info-container">
          <div className="pic">
            <div className="product-info-img bg-fields">
              <div className="game-name">
                <img src={`https://zelanstore.com/${product?.image}`} alt="" />
                <div>
                  {/* <span>
                    <small>Games</small>
                  </span> */}
                  <h4>{product?.name}</h4>
                </div>
              </div>
              <hr className="text-white" />
              <p className="m-0">
                <small>Instruction:</small>
              </p>
              <p>{product?.desc}</p>
            </div>
            {/* ====================== DESC TWO ===============  */}
            {/* ====================== DESC TWO ===============  */}
            {/* <div className="bg-fields d-none d-md-block d-lg-block">
              <p>{product?.descTwo}</p>
            </div> */}
          </div>

          <div className="product-info-content mb-2">
            {/* ====================== FIELDS ===============  */}
            {/* ====================== FIELDS ===============  */}
            <div className="bg-fields">
              <h5>Enter IDs</h5>
              {product?.fields === "1" ? (
                <div className="d-flex align-items-center">
                  <input
                    className="player-tag"
                    type="text"
                    name="userId"
                    placeholder={product?.tagOne}
                    onChange={(e) => {
                      setUserId(e.target.value);
                      if (playerCheck) setPlayerCheck(null);
                    }}
                    value={userId}
                  />
                </div>
              ) : product?.fields === "2" ? (
                <>
                  <div className="d-flex align-items-center">
                    <input
                      className="player-tag"
                      type="text"
                      name="userId"
                      placeholder={product?.tagOne}
                      onChange={(e) => {
                        setUserId(e.target.value);
                        if (playerCheck) setPlayerCheck(null);
                      }}
                      value={userId}
                    />
                  </div>
                  <input
                    className="player-tag"
                    type="text"
                    name="zoneid"
                    placeholder={product?.tagTwo}
                    onChange={(e) => {
                      setZoneId(e.target.value);
                      if (playerCheck) setPlayerCheck(null);
                    }}
                    value={zoneId}
                  />
                </>
              ) : (
                product?.fields === "3" && (
                  <>
                    <div className="d-flex align-items-center">
                      <input
                        className="player-tag"
                        type="text"
                        name="userId"
                        placeholder={`${product?.tagOne}`}
                        onChange={(e) => {
                          setUserId(e.target.value);
                          if (playerCheck) setPlayerCheck(null);
                        }}
                        value={userId}
                      />
                    </div>
                    <select
                      name="zoneId"
                      className="form-select player-tag"
                      onChange={(e) => {
                        setZoneId(e.target.value);
                        if (playerCheck) setPlayerCheck(null);
                      }}
                    >
                      <option value="">Select Server</option>
                      {product?.tagTwo?.split("+")?.map((item, index) => {
                        return <option value={item}>{item}</option>;
                      })}
                    </select>
                    {loading && (
                      <>
                        <div
                          class="spinner-border spinner-border-sm me-2 mt-2"
                          role="status"
                        >
                          <span class="visually-hidden"></span>
                        </div>
                        Checking Username
                      </>
                    )}
                    <div>
                      <span className="text-success">
                        {playerCheck && "Username: " + playerCheck}
                      </span>
                    </div>
                  </>
                )
              )}
              {product?.playerCheckBtn === "yes" && (
                <button className="buy-now" onClick={handleCheckPlayer}>
                  {loading? 
                    <div class="spinner-grow spinner-grow-sm" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                   : "Check Username"}
                  
                </button>
              )}
              <div className="center mb-0">
                {playerCheck !== null && (
                  <p className="playername mb-0 mt-3 w-100 text-center center bg-success">
                    {playerCheck && <div className="text-bold text-white center">NAME: <div>{playerCheck}</div></div>}
                  </p>
                )}
              </div>
            </div>

            {/* ====================== PACKAGE ===============  */}
            {/* ====================== PACKAGE ===============  */}
            <div className="bg-fields">
              <h5>Select Package</h5>
              <div className="p-amount">
                {product?.cost?.map((item, index) => {
                  return (
                    <div
                      onClick={() => {
                        setAmount(item.amount);
                        setPriceAndId(item.amount);
                      }}
                      key={index}
                      className={`amount ${
                        amount === item?.amount && "active border border-2"
                      }`}
                    >
                      <div className="amountdata mb-1">
                        <span>{item.amount}</span>
                      </div>
                      <div className="packdata mb-2">
                        <span>{item.packData}</span>
                      </div>
                      <div className="pack">
                        <span className={`${amount === item?.amount && "text-warning"}`}>₹{item.fakePrice}</span>
                        <p>₹{user?.reseller === "yes"? item?.resPrice : item.price}</p>
                      </div>
                      <div className="image me-2 mb-2">
                        <img src={item?.pimg} alt="" />{" "}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ====================== PAYMENT METHOD ===============  */}
            {/* ====================== PAYMENT METHOD ===============  */}
            <div className="bg-fields">
              <h5>Choose the payment method</h5>
              <div className="payment-container">
                <div
                  onClick={() => {
                    setMode("WALLET");
                    setPayment("WALLET");
                  }}
                  className={`payment wallet ${mode === "WALLET" && "active"}`}
                >
                  <TollIcon className="icon" />Z Coins
                </div>
                <div
                  onClick={() => {
                    setMode("UPI");
                    setPayment("UPI");
                  }}
                  className={`payment upi ${payment === "UPI" && "active"}`}
                >
                  <div>
                    <img src={IMAGES.upi} alt="" />
                  </div>
                  <span>₹{selectedPrice}</span>
                </div>
                <div
                  onClick={() => {
                    setMode("UPI");
                    setPayment("PAYTM");
                  }}
                  className={`payment upi ${payment === "PAYTM" && "active"}`}
                >
                  <div>
                    <img src={IMAGES.paytm} alt="" />
                  </div>
                  <span>₹{selectedPrice}</span>
                </div>
                <div
                  onClick={() => {
                    setMode("UPI");
                    setPayment("GPAY");
                  }}
                  className={`payment upi ${payment === "GPAY" && "active"}`}
                >
                  <div>
                    <img src={IMAGES.gpay} alt="" />
                  </div>
                  <span>₹{selectedPrice}</span>
                </div>
                <div
                  onClick={() => {
                    setMode("UPI");
                    setPayment("PHONEPE");
                  }}
                  className={`payment upi ${payment === "PHONEPE" && "active"}`}
                >
                  <div>
                    <img src={IMAGES.phonepe} alt="" />
                  </div>
                  <span>₹{selectedPrice}</span>
                </div>
              </div>
            </div>

            <div className="bg-fields">
              {couponApplied ? (
                <>
                  <h5>Discount Applied</h5>
                  <div className="coupon-tag">
                    <p className="m-0">
                      {singleCouponeData?.name} <CheckCircleOutlineIcon className="icon" />
                    </p>
                    <button className="remove-coupon" onClick={removeDiscount}>
                      Remove
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h5>Apply Coupon</h5>
                  <div className="coupon-box">
                    <input
                      className="player-tag m-0 coupon-input"
                      type="text"
                      name="coupon"
                      placeholder="Enter Coupon"
                      onChange={(e) => setCoupon(e.target.value)}
                      value={coupon}
                    />
                    <button onClick={applyCoupon}>Apply</button>
                  </div>
                </>
              )}
              {error && coupon === "" && (
                <span className="text-danger">Enter valid coupon</span>
              )}
            </div>

            {/* ========================================= */}
            <div className="bg-fields">
              <div className="total-value">
                <h5>Buy Now</h5>
                <div className="text-end">
                  <p className="m-0">
                    <b>Rs. {finalAmount}</b>
                  </p>
                  <span>
                    <small>
                      Amount {amount} |{" "}
                      <span>
                        Using - {paymentOptions !== "" ? paymentOptions : mode}
                      </span>
                    </small>
                  </span>
                </div>
              </div>
              <div className="buy-btn-container">
                {user?.block === "yes" || product?.stock === "no" ? (
                  <button className="buy-now" style={{ opacity: "0.7" }}>
                    Out of Stock
                  </button>
                ) : !user ? (
                  <button
                    onClick={() => navigate("/login")}
                    className="buy-now"
                  >
                    Please Login First
                  </button>
                ) : (
                  <button disabled={loading} onClick={checkPlaceOrder} className="buy-now">
                    {loading? <div class="spinner-border text-light" role="status">
                      <span class="sr-only"></span>
                    </div> : "BUY NOW"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ProductInfo;
