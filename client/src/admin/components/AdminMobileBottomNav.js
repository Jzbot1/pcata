import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import ReceiptIcon from "@mui/icons-material/Receipt";
import InventoryIcon from "@mui/icons-material/Inventory";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import WidgetsIcon from "@mui/icons-material/Widgets";
import axios from "axios";
import "./AdminMobileBottomNav.css";

const AdminMobileBottomNav = ({ onOpenMenu }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMaintenance, setIsMaintenance] = useState(false);

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
    getMaintenanceStatus();
    const interval = setInterval(getMaintenanceStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="admin-mobile-bottom-nav">
      <button
        type="button"
        className={`admin-bottom-nav-item ${isActive("/admin-dashboard") ? "active" : ""}`}
        onClick={() => navigate("/admin-dashboard")}
      >
        <HomeIcon />
        <span>Home</span>
      </button>

      <button
        type="button"
        className={`admin-bottom-nav-item ${isActive("/admin-orders") ? "active" : ""}`}
        onClick={() => navigate("/admin-orders")}
      >
        <ReceiptIcon />
        <span>Orders</span>
      </button>

      <button
        type="button"
        className={`admin-bottom-nav-item ${isActive("/admin-products") ? "active" : ""}`}
        onClick={() => navigate("/admin-products")}
      >
        <InventoryIcon />
        <span>Products</span>
      </button>

      <button
        type="button"
        className={`admin-bottom-nav-item ${isActive("/admin-maintenance") ? "active" : ""}`}
        onClick={() => navigate("/admin-maintenance")}
      >
        <BuildCircleIcon />
        <span className={`bottom-nav-badge-dot ${isMaintenance ? "" : "off"}`} />
        <span>Maint</span>
      </button>

      <button
        type="button"
        className="admin-bottom-nav-item"
        onClick={onOpenMenu}
      >
        <WidgetsIcon />
        <span>More</span>
      </button>
    </div>
  );
};

export default AdminMobileBottomNav;
