import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { setUser } from "../redux/features/userSlice";
import { message } from "antd";
import Loader from "./Loader";

const SUPER_ADMIN_EMAIL = "zomuansangajacob523@gmail.com";

export default function SuperAdminRoute({ children }) {
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
          const fetchedUser = res.data.data.user;
          dispatch(setUser(fetchedUser));

          const isSuperAdmin =
            fetchedUser.isAdmin &&
            fetchedUser.email &&
            fetchedUser.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

          if (!isSuperAdmin) {
            message.error("Access Denied: Only Super Admin can access Payment Settings");
            navigate("/admin-dashboard");
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

  const isSuperAdmin =
    user?.isAdmin &&
    user?.email &&
    user?.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

  if (!isSuperAdmin) {
    return <Navigate to="/admin-dashboard" replace />;
  }

  return children;
}
