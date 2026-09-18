import React, { useState } from "react";
import LogoutIcon from "@mui/icons-material/Logout";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import StorefrontIcon from "@mui/icons-material/Storefront";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import "./AdminLayout.css";
import AdminSidemenu from "./AdminSidemenu";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const AdminHeader = () => {
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);
  const { user } = useSelector((state) => state.user);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const initial = user?.name ? user.name[0].toUpperCase() : "A";

  return (
    <header className="admin-header-main">
      <div className="admin-brand" onClick={() => navigate("/admin-dashboard")}>
        <img src="/logo192.png" alt="Zelan Store" className="admin-brand-logo" />
        <h1 className="admin-brand-title">Zelan Admin</h1>
        <span className="admin-badge-pill">
          <AdminPanelSettingsIcon style={{ fontSize: "14px", verticalAlign: "-2px", marginRight: "4px" }} />
          Control Panel
        </span>
      </div>

      <div className="admin-tools">
        <button
          className="admin-tool-btn"
          title="Go to Live Store"
          onClick={() => navigate("/")}
        >
          <StorefrontIcon style={{ fontSize: "20px" }} />
        </button>

        <div className="admin-user-info d-none d-sm-flex">
          <div className="admin-avatar">{initial}</div>
          <span className="admin-email-text">{user?.email || "admin@zelanstore.com"}</span>
        </div>

        <button
          className="admin-tool-btn text-danger"
          title="Logout"
          onClick={handleLogout}
        >
          <LogoutIcon style={{ fontSize: "20px" }} />
        </button>

        <button
          className="admin-tool-btn d-lg-none"
          onClick={() => setMenu(!menu)}
        >
          <DragHandleIcon style={{ fontSize: "22px" }} />
        </button>

        <AdminSidemenu menu={menu} setMenu={setMenu} />
      </div>
    </header>
  );
};

export default AdminHeader;
