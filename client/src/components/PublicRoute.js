import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const SUPER_ADMIN_EMAIL = "zomuansangajacob523@gmail.com";

export default function PublicRoute({ children }) {
  const { user } = useSelector((state) => state.user);
  const token = localStorage.getItem("token");

  if (token) {
    let tokenIsAdmin = false;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      tokenIsAdmin = Boolean(payload?.isAdmin);
    } catch (e) {
      // ignore parse error
    }

    const isAdmin = Boolean(
      user?.isAdmin ||
        tokenIsAdmin ||
        (user?.email &&
          user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase())
    );

    if (isAdmin) {
      return <Navigate to="/admin-dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
