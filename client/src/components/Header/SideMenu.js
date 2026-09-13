import React from "react";
import LogoutIcon from "@mui/icons-material/Logout";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../../redux/features/userSlice";
import "./SideMenu.css";
import { message } from "antd";

const SideMenu = ({ sideMenu, setSideMenu }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  const handleLogout = () => {
    localStorage.clear();
    dispatch(setUser(null));
    message.success("Logout Successful");
    setSideMenu(false);
    navigate("/login");
  };

  const onNavClick = (path) => {
    setSideMenu(false);
    navigate(path);
  };

  return (
    <div
      className={`sidemenu-container d-block d-md-block d-lg-none ${
        sideMenu ? "active" : ""
      }`}
    >
      <div className="sidemenu">
        <HighlightOffIcon
          onClick={() => setSideMenu(false)}
          className="close-icon"
        />
        <ul className="p-0 sidemenu-nav-list">
          <li
            className={`${location.pathname === "/" ? "active" : ""}`}
            onClick={() => onNavClick("/")}
          >
            <span>Home</span>
          </li>
          {user && (
            <li
              className={`${
                location.pathname === "/user-dashboard" ? "active" : ""
              }`}
              onClick={() => onNavClick("/user-dashboard")}
            >
              <span>Dashboard</span>
            </li>
          )}
          {user && (
            <li
              className={`${location.pathname === "/my-account" ? "active" : ""}`}
              onClick={() => onNavClick("/my-account")}
            >
              <span>Account</span>
            </li>
          )}
          <li
            className={`${location.pathname === "/leaderboard" ? "active" : ""}`}
            onClick={() => onNavClick("/leaderboard")}
          >
            <span>Leaderboard</span>
          </li>
          {user && (
            <li
              className={`${location.pathname === "/orders" ? "active" : ""}`}
              onClick={() => onNavClick("/orders")}
            >
              <span>Orders</span>
            </li>
          )}
          {user && (
            <li
              className={`${location.pathname === "/query" ? "active" : ""}`}
              onClick={() => onNavClick("/query")}
            >
              <span>Queries</span>
            </li>
          )}
          {user && (
            <li
              className={`${location.pathname === "/wallet" ? "active" : ""}`}
              onClick={() => onNavClick("/wallet")}
            >
              <span>Wallet</span>
            </li>
          )}
          <li
            className={`${location.pathname === "/games" ? "active" : ""}`}
            onClick={() => onNavClick("/games")}
          >
            <span>Games</span>
          </li>
          <li
            className={`${location.pathname === "/support" ? "active" : ""}`}
            onClick={() => onNavClick("/support")}
          >
            <span>Support</span>
          </li>
          {!user && (
            <li
              className="sidemenu-login-btn mt-3"
              onClick={() => onNavClick("/login")}
            >
              <span>Login</span>
            </li>
          )}
          {user && (
            <div className="logout my-4" onClick={handleLogout}>
              <span>Logout</span>
              <LogoutIcon className="icon ms-2" />
            </div>
          )}
        </ul>
      </div>
    </div>
  );
};

export default SideMenu;
