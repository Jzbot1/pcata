import React, { useState } from "react";
import Layout from "../components/Layout/Layout";
import { Link, useNavigate } from "react-router-dom";
import { message } from "antd";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/features/userSlice";
import getUserData from "../utils/userDataService";
import { GoogleLogin } from "@react-oauth/google";
import "./Register.css";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post("/api/user/login", form);
      setLoading(false);
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        message.success(res.data.message || "Login Successful");
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
        error?.response?.data?.message || "Something went wrong during login"
      );
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        message.error("Google login failed to retrieve credentials");
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
        message.success(res.data.message || "Google Login Successful");
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
              <form className="login-form" onSubmit={handleSubmit}>
                <h1>Sign In</h1>

                <div className="google-btn-wrapper">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="outline"
                    size="large"
                    width="100%"
                    text="signin_with"
                    shape="rectangular"
                  />
                </div>

                <div className="auth-divider">
                  <span>OR</span>
                </div>

                <div className="form-fields mb-4">
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
                <div className="form-fields mb-4">
                  <input
                    onChange={handleChange}
                    value={form?.password}
                    name="password"
                    type="password"
                    className="form-control"
                    placeholder="Password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="login-btn"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Login"}
                </button>
                <div className="forgot-pass mt-3">
                  <div className="text-center">
                    <p>
                      New Customer? <Link to="/register">Sign Up</Link>
                    </p>
                    <p>
                      Forgot Password? <Link to="/forgot-password">Click Here</Link>
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

export default Login;

