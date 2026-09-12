import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import SideMenu from "./SideMenu";
import Backdrop from "./Backdrop";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../redux/features/userSlice";
import axios from "axios";
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
  const [profileMenu, setProfileMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [cartMenu, setCartMenu] = useState(false);
  const [balance, setBalance] = useState("");

  useEffect(() => {
    getUserData(dispatch, setUser, setBalance);
  }, []);

  return (
    <>
      <header className="header">
        <div className="header-main">
          <div
            className="d-flex justify-content-center align-items-center gap-3 burger-icon d-block d-lg-none"
            onClick={() => setSideMenu(!sideMenu)}
          >
            <MenuIcon className="icon" />
            <div className="logo" onClick={() => navigate("/")}>
              ZELAN<span>STORE</span>
            </div>
          </div>
          <SideMenu sideMenu={sideMenu} setSideMenu={setSideMenu} />
          <Backdrop sideMenu={sideMenu} setSideMenu={setSideMenu} />
          <div className="logo d-none d-lg-block" onClick={() => navigate("/")}>
            ZELAN<span>STORE</span>
          </div>
          
          {/* <div className="w-100">
            <ul className="p-0 text-end">
              {!user && (
                <li>
                  <Link className="text-white border bg-opacity-25 bg-white rounded py-1 px-2" to="/login">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-fill mb-1 me-1" viewBox="0 0 16 16">
                      <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
                    </svg>
                    <span>Login</span>
                  </Link>
                </li>
              )}
              {user && (
                <li>
                  <Link className="text-white border bg-opacity-25 bg-white rounded py-1 px-2" to="/user-dashboard">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-fill mb-1 me-1" viewBox="0 0 16 16">
                      <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
                    </svg>
                    <span>Dashboard</span>
                  </Link>
                </li>
              )}
            </ul>
          </div> */}
          
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
            </ul>
          </div>
          <div className="action-btns">
            {user && (
              <div onClick={() => navigate("/wallet")} className="wallet-cont">
                <span className="me-2">
                  <TollIcon className="icon" />
                </span>
                <span>{parseFloat(balance).toFixed(2)}</span>
              </div>
            )}
            {!user && (
              <div onClick={() => navigate("/login")} className="wallet-cont">
                <span className="me-2">
                <PersonIcon
                  className="icon"
                  onClick={() => navigate("/login")}
                />
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
                  onClick={() => navigate("/login")}
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
      <SearchContainer search={search} setSearch={setSearch} />
    </>
  );
};

export default Header;
