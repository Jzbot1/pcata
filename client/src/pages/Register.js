import React, { useState } from "react";
import Layout from "../components/Layout/Layout";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { message } from "antd";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/features/userSlice";
import getUserData from "../utils/userDataService";
import { GoogleLogin } from "@react-oauth/google";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  async function handleRegister(e) {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form?.email)) {
      message.error("Invalid email format");
      return;
    }
    if (form?.mobile?.length !== 10) {
      return message.error("Enter a 10 digit Mobile Number");
    }

    try {
      setLoading(true);
      const res = await axios.post("/api/user/register", form);
      setLoading(false);
      if (res.data.success) {
        message.success(res.data.message);
        navigate("/login");
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      setLoading(false);
      message.error(error.message);
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        message.error("Google sign up failed to retrieve credentials");
        return;
      }
      setLoading(true);
      const res = await axios.post("/api/user/google-login", {
        credential: credentialResponse.credential,
        client_id: credentialResponse.clientId,
      });
      setLoading(false);
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        message.success(res.data.message || "Signed in with Google successfully");
        await getUserData(dispatch, setUser, () => {});
        if (res.data.isAdmin) {
          navigate("/admin-dashboard");
        } else {
          navigate("/");
        }
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      message.error(
        error?.response?.data?.message || "Google authentication failed"
      );
    }
  };

  const handleGoogleError = () => {
    message.error("Google Sign-In was unsuccessful. Please try again.");
  };

  return (
    <Layout>
      <div className="container-fluid login-container">
        <div className="row justify-content-center align-items-center">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="form-container">
              <form className="login-form" onSubmit={handleRegister}>
                <h1 className="form-title">Create Your Account</h1>

                <div className="google-btn-wrapper">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="outline"
                    size="large"
                    width="100%"
                    text="signup_with"
                    shape="rectangular"
                  />
                </div>

                <div className="auth-divider">
                  <span>OR</span>
                </div>

                <div className="form-fields mb-3">
                  <input
                    onChange={handleChange}
                    value={form?.fname}
                    name="fname"
                    type="text"
                    className="form-control"
                    placeholder="First Name"
                    required
                  />
                </div>
                <div className="form-fields mb-3">
                  <input
                    onChange={handleChange}
                    value={form?.lname}
                    name="lname"
                    type="text"
                    className="form-control"
                    placeholder="Last Name"
                    required
                  />
                </div>
                <div className="form-fields mb-3">
                  <input
                    onChange={handleChange}
                    value={form?.email}
                    name="email"
                    type="email"
                    className="form-control"
                    placeholder="Email"
                    required
                  />
                </div>
                <div className="form-fields mb-3">
                  <input
                    onChange={handleChange}
                    value={form?.mobile}
                    name="mobile"
                    type="text"
                    className="form-control"
                    placeholder="Mobile"
                    required
                  />
                </div>
                <div className="form-fields mb-3">
                  <input
                    onChange={handleChange}
                    value={form?.password}
                    name="password"
                    type="password"
                    className="form-control"
                    required
                    placeholder="Password"
                  />
                </div>
                <button
                  type="submit"
                  className="login-btn"
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Create Now"}
                </button>
                <div className="forgot-pass mt-3">
                  <div className="text-center">
                    <p>
                      Already a Customer? <Link to="/login">Click here</Link>
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
