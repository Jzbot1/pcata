import React, { useEffect } from "react";
import Person2Icon from "@mui/icons-material/Person2";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/features/userSlice";
import "./Header.css";

import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

const SUPER_ADMIN_EMAIL = "zomuansangajacob523@gmail.com";

const LogoutTippy = ({ user }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isAdmin = Boolean(
    user?.isAdmin ||
      (user?.email &&
        user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    getUserData();
    navigate("/login");
  };

  const getUserData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      dispatch(setUser(null));
      return;
    }
    axios
      .post(
        "/api/user/getUserData",
        {},
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      )
      .then((res) => {
        if (res.data.success) {
          dispatch(setUser(res.data.data.user));
        } else {
          dispatch(setUser(null));
          localStorage.removeItem("token");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <div className="logout-tippy">
      {user && user ? (
        <>
          {isAdmin && (
            <div className="section-1" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", paddingBottom: "6px" }}>
              <span>
                <AdminPanelSettingsIcon className="me-2 icon text-success" />
              </span>
              <span onClick={() => navigate("/admin-dashboard")} style={{ fontWeight: "700", color: "#2d5533" }}>
                Admin Panel
              </span>
            </div>
          )}
          <div className="section-1">
            <span>
              <Person2Icon className="me-2 icon" />
            </span>
            <span onClick={() => navigate("/user-dashboard")}>
              My Dashboard
            </span>
          </div>
          <div className="section-2">
            <span>
              <LogoutIcon className="me-2 icon" />
            </span>
            <span onClick={handleLogout}>Logout</span>
          </div>
        </>
      ) : (
        <>
          <div className="section-1">
            <span onClick={() => navigate("/login")}>Login</span>
          </div>
          <hr />
          <div className="section-1">
            <span onClick={() => navigate("/register")}>Register</span>
          </div>
        </>
      )}
    </div>
  );
};

export default LogoutTippy;
