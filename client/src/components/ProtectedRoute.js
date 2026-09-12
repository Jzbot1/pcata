import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { setUser } from "../redux/features/userSlice";
import { message } from "antd";
import Loader from "./Loader";

export default function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true); // Token ho toh loading true ho, warna false

  useEffect(() => {
    if (!token) {
      setLoading(false); // Token nahi hai toh loading off kar do
      return;
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

        if (data.success) {
          dispatch(setUser(data.data.user));
        } else {
          message.error("Session expired, please login again");
          localStorage.removeItem("token");
        }
      } catch (error) {
        message.error("Error fetching user data");
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchUser();
    else setLoading(false);
  }, [token, dispatch]); 

  if (loading) return <Loader />; // Loader sirf tab dikhe jab data load ho raha ho

  if (!token){
    message.error("please login")
    return <Navigate to="/login" replace />; // Agar token nahi hai toh login pe redirect kar do
  }

  return children; // Authenticated user ke liye content dikhao
}
