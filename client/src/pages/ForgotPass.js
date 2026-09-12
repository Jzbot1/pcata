import React, { useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";
import axios from "axios";
import { message } from "antd";

const ForgotPass = () => {
  const [email, setEmail] = useState(null);
  // email otp
  const [otp, setOtp] = useState(null);
  // user enter otp
  const [userEnteredOtp, setUserEnteredOtp] = useState(null);
  const [tab, setTab] = useState(0);
  const [pass, setPass] = useState(null);
  const [cpass, setCpass] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const generateOTP = () => {
    const emailOtp = Math.floor(100000 + Math.random() * 900000);
    setOtp(emailOtp);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post("/api/user/send-otp", {
        email,
        msg: "We got your back! For password reset OTP is",
      });
      if (res.data.success) {
        message.success(res.data.message);
        setLoading(false);
        setTab(1);
      } else {
        message.error(res.data.message);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (userEnteredOtp === "") {
      return message.error("PLease enter otp");
    }
    if (!pass || !cpass) {
      return message.error("Please enter password");
    }
    if (pass !== cpass) {
      return message.error("Password doesnt match");
    }
    try {
      const res = await axios.post("/api/user/verify-otp", {
        email,
        userEnteredOtp,
        pass,
      });
      if (res.data.success) {
        message.success(res.data.message);
        navigate("/login");
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    generateOTP();
  }, []);

  return (
    <Layout>
      <div className="container-fluid login-container">
        <div className="row justify-content-center align-items-center">
          {tab === 0 && (
            <div className="col-12 col-md-6 col-lg-4">
              <div className="form-container">
                <form className="login-form" onSubmit={handleSendOtp}>
                  <h1 className="mb-2">Forgot Password</h1>
                  <h6 className="mb-4 text-secondary">Dont worry! Get Otp on Your Email</h6>
                  <div className="mb-3 form-fields">
                    <label className="form-label" htmlFor="name">
                      Email
                    </label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter Email Registered with us"
                      className="form-control"
                      type="text"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <button type="submit" className="login-btn">
                      {loading ? "Sending..." : "Send OTP"}
                    </button>
                  </div>
                  <p>
                    Not a User? <Link to="/register">click here</Link>
                  </p>
                </form>
              </div>
            </div>
          )}
          {tab === 1 && (
            <div className="col-12 col-md-6 col-lg-4">
              <div className="form-container">
                <form className="login-form" onSubmit={handleVerifyOtp}>
                  <h1 className="mb-0">Reset Your Password</h1>
                  <p className="d-block mt-3 bg-light text-danger p-2 rounded-3">
                    * Check your <strong>Spam</strong> or <strong>Promotions</strong> folder if you don't see the OTP in your inbox.
                  </p>
                  <div className="mb-3 form-fields">
                    <label className="form-label" htmlFor="name">
                      Enter Your Otp
                    </label>
                    <input
                      onChange={(e) => setUserEnteredOtp(e.target.value)}
                      placeholder="Enter Otp"
                      className="form-control"
                      type="text"
                      required
                    />
                  </div>
                  <div className="mb-3 form-fields">
                    <label className="form-label" htmlFor="name">
                      New Password
                    </label>
                    <input
                      onChange={(e) => setPass(e.target.value)}
                      className="form-control"
                      type="text"
                      placeholder="Enter password"
                      required
                    />
                  </div>
                  <div className="mb-3 form-fields">
                    <label className="form-label" htmlFor="name">
                      Confirm Password
                    </label>
                    <input
                      onChange={(e) => setCpass(e.target.value)}
                      className="form-control"
                      placeholder="Enter confirm password"
                      type="text"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <button type="submit" className="login-btn">
                      Verify & Update
                    </button>
                  </div>
                  <p>
                    Not a User? <Link to="/register">click here</Link>
                  </p>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPass;
