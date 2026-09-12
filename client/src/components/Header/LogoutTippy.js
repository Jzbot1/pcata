import React, { useEffect } from "react";
import Person2Icon from "@mui/icons-material/Person2";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/features/userSlice";
import "./Header.css";

const LogoutTippy = ({ user }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    localStorage.removeItem("token");
    getUserData();
    navigate("/login");
  };

  const getUserData = async () => {
    axios
      .post(
        "/api/user/getUserData",
        {},
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
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
