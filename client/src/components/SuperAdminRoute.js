import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { setUser } from "../redux/features/userSlice";
import { message } from "antd";
import Loader from "./Loader";

const SUPER_ADMIN_EMAILS = [
  "zomuansangajacob523@gmail.com",
  "mszapachuau@gmail.com",
  "aashirdigital@gmail.com",
];

export default function SuperAdminRoute({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    let isMounted = true;

    const checkSuperAdminAuth = async () => {
      if (!token) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload?.exp && payload.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          if (isMounted) {
            setLoading(false);
            message.error("Session expired! Please login again.");
            navigate("/login");
          }
          return;
        }
      } catch (e) {
        // Continue
      }

      try {
        const res = await axios.post(
          "/api/user/getUserData",
          { token },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!isMounted) return;

        if (res.data?.success && res.data?.data?.user) {
          const fetchedUser = res.data.data.user;
          dispatch(setUser(fetchedUser));

          const isSuperAdmin =
            fetchedUser?.email &&
            SUPER_ADMIN_EMAILS.some(
              (em) => em.toLowerCase() === fetchedUser.email.toLowerCase()
            );

          if (!isSuperAdmin) {
            message.error("Access Denied: Only Super Admin can access Payment Settings");
            navigate("/admin-dashboard");
          }
        } else {
          if (res.data?.message?.toLowerCase().includes("session") || res.data?.message?.toLowerCase().includes("token")) {
            localStorage.removeItem("token");
            navigate("/login");
          }
        }
      } catch (error) {
        console.error("SuperAdminRoute error fetching user data:", error);
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("token");
          if (isMounted) navigate("/login");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkSuperAdminAuth();

    return () => {
      isMounted = false;
    };
  }, [token, dispatch, navigate]);

  if (loading) {
    return <Loader />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const isSuperAdmin =
    user?.email &&
    SUPER_ADMIN_EMAILS.some(
      (em) => em.toLowerCase() === user.email.toLowerCase()
    );

  if (user && !isSuperAdmin) {
    return <Navigate to="/admin-dashboard" replace />;
  }

  return children;
}

