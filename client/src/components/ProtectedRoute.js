import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setUser } from "../redux/features/userSlice";
import { message } from "antd";
import Loader from "./Loader";

export default function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload?.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        if (isMounted) {
          setLoading(false);
          message.error("Session expired! Please login again.");
        }
        return;
      }
    } catch (e) {
      // Continue
    }

    const fetchUser = async () => {
      try {
        const { data } = await axios.post(
          "/api/user/getUserData",
          { token },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!isMounted) return;

        if (data?.success && data?.data?.user) {
          dispatch(setUser(data.data.user));
        } else {
          if (data?.message?.toLowerCase().includes("session") || data?.message?.toLowerCase().includes("token")) {
            localStorage.removeItem("token");
          }
        }
      } catch (error) {
        console.error("ProtectedRoute error fetching user data:", error);
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("token");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [token, dispatch]);

  if (loading) return <Loader />;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

