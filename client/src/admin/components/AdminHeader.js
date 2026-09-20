import React, { useState, useEffect } from "react";
import LogoutIcon from "@mui/icons-material/Logout";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import StorefrontIcon from "@mui/icons-material/Storefront";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import "./AdminLayout.css";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

const AdminHeader = ({ onToggleMenu }) => {
  const navigate = useNavigate();
  const [isMaintenance, setIsMaintenance] = useState(false);
  const { user } = useSelector((state) => state.user);

  const getMaintenanceStatus = async () => {
    try {
      const res = await axios.get("/api/maintenance/status");
      if (res.data.success && res.data.data) {
        setIsMaintenance(res.data.data.isMaintenance);
      }
    } catch (err) {
      console.log("Error loading maintenance status:", err);
    }
  };

  useEffect(() => {
    getMainMaintenanceStatus();
    const interval = setInterval(getMainMaintenanceStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const getMainMaintenanceStatus = () => {
    getMaintenanceStatus();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const initial = user?.name ? user.name[0].toUpperCase() : "A";

  return (
    <header className="admin-header-main">
      <div className="admin-brand" onClick={() => navigate("/admin-dashboard")}>
        <img
          src="/logo.png"
          alt="Zelan Store"
          className="admin-brand-logo"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/android-chrome-192x192.png";
          }}
        />
        <h1 className="admin-brand-title">Zelan Admin</h1>
        <span className="admin-badge-pill">
          <AdminPanelSettingsIcon style={{ fontSize: "14px", verticalAlign: "-2px", marginRight: "4px" }} />
          Control Panel
        </span>
      </div>

      <div className="admin-tools">
        <button
          className={`admin-header-maint-btn ${isMaintenance ? "on" : "off"}`}
          title="Maintenance Mode Control"
          onClick={() => navigate("/admin-maintenance")}
        >
          <BuildCircleIcon style={{ fontSize: "16px" }} />
          <span>{isMaintenance ? "Maint: ON ⚠️" : "Maint: OFF 🟢"}</span>
        </button>

        <button
          className="admin-tool-btn d-none d-sm-flex"
          title="Go to Live Store"
          onClick={() => navigate("/")}
        >
          <StorefrontIcon style={{ fontSize: "20px" }} />
        </button>

        <div className="admin-user-info d-none d-md-flex">
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
          title="Open Menu"
          onClick={onToggleMenu}
        >
          <DragHandleIcon style={{ fontSize: "22px" }} />
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
