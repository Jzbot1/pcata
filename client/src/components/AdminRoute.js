import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { setUser } from "../redux/features/userSlice";
import { message } from "antd";
import Loader from "./Loader";

export default function AdminRoute({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await axios.post(
          "/api/user/getUserData",
          { token },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          dispatch(setUser(res.data.data.user));

          if (!res.data.data.user.isAdmin) {
            message.error("Access Denied! Admins only.");
            navigate("/user-dashboard"); // नॉर्मल यूज़र को डैशबोर्ड पर भेजें
          }
        } else {
          message.error("Session expired! Please login again.");
          localStorage.removeItem("token");
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      getUser();
    } else {
      setLoading(false);
    }
  }, [token, dispatch, navigate]);

  if (loading) {
    return <Loader />;
  }

  if (!token) {
    message.error("Please login");
    return <Navigate to="/login" replace />;
  }

  return children;
}
