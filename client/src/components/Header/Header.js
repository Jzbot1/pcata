import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SideMenu from "./SideMenu";
import Backdrop from "./Backdrop";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../redux/features/userSlice";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Tippy from "@tippyjs/react";
import LogoutTippy from "./LogoutTippy";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import MenuIcon from "@mui/icons-material/Menu";
import SearchContainer from "../SearchContainer";
import getUserData from "../../utils/userDataService.js";
import TollIcon from "@mui/icons-material/Toll";
import "./Header.css";

const Header = () => {
  const { user } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [sideMenu, setSideMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [balance, setBalance] = useState("");

  useEffect(() => {
    getUserData(dispatch, setUser, setBalance);
  }, []);

  return (
    <>
      {/* Top-level mobile overlays outside header stacking context */}
      <Backdrop sideMenu={sideMenu} setSideMenu={setSideMenu} />
      <SideMenu sideMenu={sideMenu} setSideMenu={setSideMenu} />
      <SearchContainer search={search} setSearch={setSearch} />

      <header className="header">
        <div className="header-main">
          {/* Mobile hamburger and logo separated */}
          <div className="d-flex align-items-center gap-2 d-block d-lg-none">
            <div
              className="burger-icon"
              onClick={() => setSideMenu((prev) => !prev)}
            >
              <MenuIcon className="icon" />
            </div>
            <div className="logo" onClick={() => navigate("/")}>
              ZELAN<span>STORE</span>
            </div>
          </div>

          {/* Desktop logo */}
          <div className="logo d-none d-lg-block" onClick={() => navigate("/")}>
            ZELAN<span>STORE</span>
          </div>

          {/* Desktop Menu */}
          <div className="menus d-none d-md-none d-lg-block">
            <ul className="p-0">
              <li>
                <Link to="/games">Games</Link>
              </li>
              <li>
                <Link to="/support">Contact Us</Link>
              </li>
              <li>
                <Link to="/leaderboard">Leaderboard</Link>
              </li>
              {!user && (
                <li>
                  <Link to="/login">Login</Link>
                </li>
              )}
              {user && (
                <li>
                  <Link to="/user-dashboard">Dashboard</Link>
                </li>
              )}
              {user && (user?.isAdmin || user?.email?.toLowerCase() === "zomuansangajacob523@gmail.com") && (
                <li>
                  <Link to="/admin-dashboard" style={{ color: "#22c55e", fontWeight: "700" }}>
                    Admin Panel
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Action buttons (Wallet, Login, Search) */}
          <div className="action-btns">
            {user && (
              <div onClick={() => navigate("/wallet")} className="wallet-cont">
                <span className="me-2">
                  <TollIcon className="icon" />
                </span>
                <span>{parseFloat(balance || 0).toFixed(2)}</span>
              </div>
            )}
            {!user && (
              <div onClick={() => navigate("/login")} className="wallet-cont">
                <span className="me-2">
                  <PersonIcon className="icon" />
                </span>
                <span>Login</span>
              </div>
            )}
            <SearchIcon
              onClick={() => setSearch(!search)}
              className="icon d-none d-lg-block"
            />
            <Tippy
              interactive
              theme="light"
              content={<LogoutTippy user={user && user} />}
            >
              <span className="menu-img-container d-flex">
                <PersonIcon
                  className="icon d-lg-block d-md-none d-none"
                  onClick={() => navigate(user ? "/user-dashboard" : "/login")}
                />
                {user && (
                  <KeyboardArrowDownIcon
                    className="d-lg-block d-md-none d-none"
                    style={{ color: "#fff" }}
                  />
                )}
              </span>
            </Tippy>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
