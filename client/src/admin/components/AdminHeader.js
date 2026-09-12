import React, { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import "./AdminLayout.css";
import AdminSidemenu from "./AdminSidemenu";
import { useNavigate } from "react-router-dom";

const AdminHeader = () => {
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  return (
    <div className="admin-header-main">
      <span className="" onClick={()=>{navigate("/")}}>
        Hello! <b>ADMIN</b>
      </span>
      <div className="admin-tools">
        {/* <SearchIcon /> */}
        {/* <NotificationsIcon /> */}
        <LogoutIcon onClick={handleLogout} />
        <DragHandleIcon
          onClick={() => setMenu(!menu)}
          className="d-block d-md-block d-lg-none"
        />
        <AdminSidemenu menu={menu} setMenu={setMenu} />
      </div>
    </div>
  );
};

export default AdminHeader;
