import React from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import GroupIcon from "@mui/icons-material/Group";
import PaymentIcon from "@mui/icons-material/Payment";
import ReceiptIcon from "@mui/icons-material/Receipt";
import HelpIcon from "@mui/icons-material/Help";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import InventoryIcon from "@mui/icons-material/Inventory";
import CollectionsIcon from "@mui/icons-material/Collections";
import DiscountIcon from "@mui/icons-material/Discount";
import SettingsIcon from "@mui/icons-material/Settings";
import TelegramIcon from "@mui/icons-material/Telegram";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import CategoryIcon from "@mui/icons-material/Category";
import ViewCarouselIcon from "@mui/icons-material/ViewCarousel";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import "./AdminSidebar.css";

const SUPER_ADMIN_EMAIL = "zomuansangajacob523@gmail.com";

const AdminSidebar = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.user);
  const isSuperAdmin =
    user?.email && user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="admin-sidebar-container">
      <span className="admin-sidebar-section-title">Overview</span>
      <ul className="admin-sidebar-menu">
        <li className="admin-sidebar-item">
          <Link
            to="/admin-dashboard"
            className={`admin-sidebar-link ${isActive("/admin-dashboard") ? "active" : ""}`}
          >
            <HomeIcon />
            Dashboard
          </Link>
        </li>
        <li className="admin-sidebar-item">
          <Link
            to="/admin-maintenance"
            className={`admin-sidebar-link ${isActive("/admin-maintenance") ? "active" : ""}`}
          >
            <BuildCircleIcon />
            Maintenance Mode
          </Link>
        </li>
      </ul>

      <span className="admin-sidebar-section-title">Catalog & Store</span>
      <ul className="admin-sidebar-menu">
        <li className="admin-sidebar-item">
          <Link
            to="/admin-orders"
            className={`admin-sidebar-link ${isActive("/admin-orders") ? "active" : ""}`}
          >
            <ReceiptIcon />
            Orders
          </Link>
        </li>
        <li className="admin-sidebar-item">
          <Link
            to="/admin-products"
            className={`admin-sidebar-link ${isActive("/admin-products") ? "active" : ""}`}
          >
            <InventoryIcon />
            Products
          </Link>
        </li>
        <li className="admin-sidebar-item">
          <Link
            to="/admin-product-category"
            className={`admin-sidebar-link ${isActive("/admin-product-category") ? "active" : ""}`}
          >
            <CategoryIcon />
            Categories
          </Link>
        </li>
        <li className="admin-sidebar-item">
          <Link
            to="/admin-add-coupon"
            className={`admin-sidebar-link ${isActive("/admin-add-coupon") ? "active" : ""}`}
          >
            <DiscountIcon />
            Coupons
          </Link>
        </li>
      </ul>

      <span className="admin-sidebar-section-title">Finance & Users</span>
      <ul className="admin-sidebar-menu">
        <li className="admin-sidebar-item">
          <Link
            to="/admin-users"
            className={`admin-sidebar-link ${isActive("/admin-users") ? "active" : ""}`}
          >
            <GroupIcon />
            Customers
          </Link>
        </li>
        <li className="admin-sidebar-item">
          <Link
            to="/admin-payments"
            className={`admin-sidebar-link ${isActive("/admin-payments") ? "active" : ""}`}
          >
            <PaymentIcon />
            Payments
          </Link>
        </li>
        <li className="admin-sidebar-item">
          <Link
            to="/admin-wallet-history"
            className={`admin-sidebar-link ${isActive("/admin-wallet-history") ? "active" : ""}`}
          >
            <AccountBalanceWalletIcon />
            Wallet History
          </Link>
        </li>
        <li className="admin-sidebar-item">
          <Link
            to="/admin-queries"
            className={`admin-sidebar-link ${isActive("/admin-queries") ? "active" : ""}`}
          >
            <HelpIcon />
            Queries
          </Link>
        </li>
      </ul>

      <span className="admin-sidebar-section-title">Marketing & Content</span>
      <ul className="admin-sidebar-menu">
        <li className="admin-sidebar-item">
          <Link
            to="/admin-banners"
            className={`admin-sidebar-link ${isActive("/admin-banners") ? "active" : ""}`}
          >
            <ViewCarouselIcon />
            Banners
          </Link>
        </li>
        <li className="admin-sidebar-item">
          <Link
            to="/admin-gallery"
            className={`admin-sidebar-link ${isActive("/admin-gallery") ? "active" : ""}`}
          >
            <CollectionsIcon />
            Gallery
          </Link>
        </li>
        <li className="admin-sidebar-item">
          <Link
            to="/admin-add-reward"
            className={`admin-sidebar-link ${isActive("/admin-add-reward") ? "active" : ""}`}
          >
            <EmojiEventsIcon />
            Add Reward
          </Link>
        </li>
        <li className="admin-sidebar-item">
          <Link
            to="/admin-rewards"
            className={`admin-sidebar-link ${isActive("/admin-rewards") ? "active" : ""}`}
          >
            <EmojiEventsIcon />
            Winner List
          </Link>
        </li>
      </ul>

      {isSuperAdmin && (
        <>
          <span className="admin-sidebar-section-title">System & Gateway</span>
          <ul className="admin-sidebar-menu">
            <li className="admin-sidebar-item">
              <Link
                to="/admin-payment-config"
                className={`admin-sidebar-link ${isActive("/admin-payment-config") ? "active" : ""}`}
              >
                <SettingsIcon />
                Payment Gateways
              </Link>
            </li>
            <li className="admin-sidebar-item">
              <Link
                to="/admin-telegram-config"
                className={`admin-sidebar-link ${isActive("/admin-telegram-config") ? "active" : ""}`}
              >
                <TelegramIcon />
                Telegram Bots
              </Link>
            </li>
          </ul>
        </>
      )}
    </nav>
  );
};

export default AdminSidebar;
