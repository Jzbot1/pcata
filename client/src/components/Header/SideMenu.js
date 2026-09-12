import React, { useState } from "react";
import LogoutIcon from "@mui/icons-material/Logout";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "./SideMenu.css";
import { message } from "antd";
import IMAGES from "../../img/image";

const SideMenu = ({ sideMenu, setSideMenu }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.user);
  const [submenu, setSubmenu] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    message.success("Logout Successful");
    navigate("/login");
  };

  const onSideMenuButtonClick = (link)=>{
    setSideMenu(!sideMenu);
    navigate(link)
  }
  return (
    <div
      className={`sidemenu-container d-block d-md-block d-lg-none ${
        sideMenu ? "active" : ""
      }`}
    >
      <div className="sidemenu">
        <HighlightOffIcon
          onClick={() => setSideMenu(!sideMenu)}
          className="close-icon"
        />
        <ul className="p-0">
          <li
            className={`${location.pathname === "/" && "active"}`}
            onClick={()=>{onSideMenuButtonClick("/")}}
          >
            <Link to="/">Home</Link>
          </li>
          {user && (
            <li
              className={`${
                location.pathname === "/user-dashboard" && "active"
              }`}
              onClick={()=>{onSideMenuButtonClick("/user-dashboard")}}
            >
              <Link to="/user-dashboard">Dashboard</Link>
            </li>
          )}
          {user && (
            <li
              className={`${location.pathname === "/my-account" && "active"}`}
              onClick={()=>{onSideMenuButtonClick("/my-account")}}
            >
              <Link to="/my-account">Account</Link>
            </li>
          )}
          <li
            className={`${location.pathname === "/leaderboard" && "active"}`}
            onClick={()=>{onSideMenuButtonClick("/leaderboard")}}
          >
            <Link to="/leaderboard">Leaderbboard</Link>
          </li>
          {user && (
            <li
              className={`${location.pathname === "/orders" && "active"}`}
              onClick={()=>{onSideMenuButtonClick("/orders")}}
            >
              <Link to="/orders">Orders</Link>
            </li>
          )}
          {user && (
            <li
              className={`${location.pathname === "/query" && "active"}`}
              onClick={()=>{onSideMenuButtonClick("/query")}}
            >
              <Link to="/query">Queries</Link>
            </li>
          )}
          {user && (
            <li
              className={`${location.pathname === "/wallet" && "active"}`}
              onClick={()=>{onSideMenuButtonClick("/wallet")}}
            >
              <Link to="/wallet">Wallet</Link>
            </li>
          )}
          <li
            className={`${location.pathname === "/games" && "active"}`}
            onClick={()=>{onSideMenuButtonClick("/games")}}
          >
            <Link onClick={() => setSideMenu(!sideMenu)} to="/games">
              Games
            </Link>
          </li>
          <li
            className={`${location.pathname === "/support" && "active"}`}
            onClick={()=>{onSideMenuButtonClick("/support")}}
          >
            <Link onClick={() => setSideMenu(!sideMenu)} to="/support">
              Support
            </Link>
          </li>
          {!user && (
            <div
              className="sidemenu-action-btn logout my-4"
              onClick={() => setSideMenu(!sideMenu)}
            >
              <Link to="/login">Login</Link>
            </div>
          )}
          {user && (
            <div className="logout my-4" onClick={handleLogout}>
              Logout
              <LogoutIcon className="icon" />
            </div>
          )}
        </ul>
      </div>
    </div>
  );
};

export default SideMenu;
