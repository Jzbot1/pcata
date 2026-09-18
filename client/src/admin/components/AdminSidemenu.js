import React from "react";
import { useSelector } from "react-redux";
import HomeIcon from "@mui/icons-material/Home";
import GroupIcon from "@mui/icons-material/Group";
import PaymentIcon from "@mui/icons-material/Payment";
import CancelIcon from "@mui/icons-material/Cancel";
import ReceiptIcon from "@mui/icons-material/Receipt";
import HelpIcon from "@mui/icons-material/Help";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import InventoryIcon from "@mui/icons-material/Inventory";
import ViewCarouselIcon from "@mui/icons-material/ViewCarousel";
import DiscountIcon from "@mui/icons-material/Discount";
import SettingsIcon from "@mui/icons-material/Settings";
import TelegramIcon from "@mui/icons-material/Telegram";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import CategoryIcon from "@mui/icons-material/Category";
import CollectionsIcon from "@mui/icons-material/Collections";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { useNavigate, useLocation } from "react-router-dom";

const SUPER_ADMIN_EMAIL = "zomuansangajacob523@gmail.com";

const AdminSidemenu = ({ menu, setMenu }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.user);
  const isSuperAdmin =
    user?.email && user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

  const handleNav = (path) => {
    setMenu(false);
    navigate(path);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`admin-sidemenu-container ${menu ? "active" : ""}`}>
      <div className="w-100 d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
        <span className="fw-bold" style={{ color: "var(--p)", fontSize: "1.1rem" }}>
          Admin Navigation
        </span>
        <CancelIcon
          onClick={() => setMenu(false)}
          className="cancel-icon"
        />
      </div>

      <small className="text-muted fw-bold d-block mb-1 text-uppercase" style={{ fontSize: "0.72rem" }}>
        Overview
      </small>
      <ul>
        <li
          className={isActive("/admin-dashboard") ? "active" : ""}
          onClick={() => handleNav("/admin-dashboard")}
        >
          <HomeIcon className="me-2" />
          Dashboard
        </li>
        <li
          className={`maint-item ${isActive("/admin-maintenance") ? "active" : ""}`}
          onClick={() => handleNav("/admin-maintenance")}
        >
          <BuildCircleIcon className="me-2 text-warning" />
          <b>Maintenance Mode</b>
        </li>
      </ul>

      <small className="text-muted fw-bold d-block mt-3 mb-1 text-uppercase" style={{ fontSize: "0.72rem" }}>
        Catalog & Orders
      </small>
      <ul>
        <li
          className={isActive("/admin-orders") ? "active" : ""}
          onClick={() => handleNav("/admin-orders")}
        >
          <ReceiptIcon className="me-2" />
          Orders
        </li>
        <li
          className={isActive("/admin-products") ? "active" : ""}
          onClick={() => handleNav("/admin-products")}
        >
          <InventoryIcon className="me-2" />
          Products
        </li>
        <li
          className={isActive("/admin-product-category") ? "active" : ""}
          onClick={() => handleNav("/admin-product-category")}
        >
          <CategoryIcon className="me-2" />
          Categories
        </li>
        <li
          className={isActive("/admin-add-coupon") ? "active" : ""}
          onClick={() => handleNav("/admin-add-coupon")}
        >
          <DiscountIcon className="me-2" />
          Coupons
        </li>
      </ul>

      <small className="text-muted fw-bold d-block mt-3 mb-1 text-uppercase" style={{ fontSize: "0.72rem" }}>
        Finance & Users
      </small>
      <ul>
        <li
          className={isActive("/admin-users") ? "active" : ""}
          onClick={() => handleNav("/admin-users")}
        >
          <GroupIcon className="me-2" />
          Customers
        </li>
        <li
          className={isActive("/admin-payments") ? "active" : ""}
          onClick={() => handleNav("/admin-payments")}
        >
          <PaymentIcon className="me-2" />
          Payments
        </li>
        <li
          className={isActive("/admin-wallet-history") ? "active" : ""}
          onClick={() => handleNav("/admin-wallet-history")}
        >
          <AccountBalanceWalletIcon className="me-2" />
          Wallet History
        </li>
        <li
          className={isActive("/admin-queries") ? "active" : ""}
          onClick={() => handleNav("/admin-queries")}
        >
          <HelpIcon className="me-2" />
          Queries
        </li>
      </ul>

      <small className="text-muted fw-bold d-block mt-3 mb-1 text-uppercase" style={{ fontSize: "0.72rem" }}>
        Marketing & Rewards
      </small>
      <ul>
        <li
          className={isActive("/admin-banners") ? "active" : ""}
          onClick={() => handleNav("/admin-banners")}
        >
          <ViewCarouselIcon className="me-2" />
          Banners
        </li>
        <li
          className={isActive("/admin-gallery") ? "active" : ""}
          onClick={() => handleNav("/admin-gallery")}
        >
          <CollectionsIcon className="me-2" />
          Gallery
        </li>
        <li
          className={isActive("/admin-add-reward") ? "active" : ""}
          onClick={() => handleNav("/admin-add-reward")}
        >
          <EmojiEventsIcon className="me-2" />
          Add Reward
        </li>
        <li
          className={isActive("/admin-rewards") ? "active" : ""}
          onClick={() => handleNav("/admin-rewards")}
        >
          <EmojiEventsIcon className="me-2" />
          Winner List
        </li>
      </ul>

      {isSuperAdmin && (
        <>
          <small className="text-muted fw-bold d-block mt-3 mb-1 text-uppercase" style={{ fontSize: "0.72rem" }}>
            Settings
          </small>
          <ul>
            <li
              className={isActive("/admin-payment-config") ? "active" : ""}
              onClick={() => handleNav("/admin-payment-config")}
            >
              <SettingsIcon className="me-2" />
              Payment Gateway
            </li>
            <li
              className={isActive("/admin-telegram-config") ? "active" : ""}
              onClick={() => handleNav("/admin-telegram-config")}
            >
              <TelegramIcon className="me-2" />
              Telegram Config
            </li>
          </ul>
        </>
      )}
    </div>
  );
};

export default AdminSidemenu;
