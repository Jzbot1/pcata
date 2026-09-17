import React from "react";
import { useSelector } from "react-redux";
import HomeIcon from "@mui/icons-material/Home";
import GroupIcon from "@mui/icons-material/Group";
import PaymentIcon from "@mui/icons-material/Payment";
import ReceiptIcon from "@mui/icons-material/Receipt";
import HelpIcon from "@mui/icons-material/Help";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import InventoryIcon from "@mui/icons-material/Inventory";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import CollectionsIcon from "@mui/icons-material/Collections";
import ViewCarouselIcon from "@mui/icons-material/ViewCarousel";
import DiscountIcon from "@mui/icons-material/Discount";
import SettingsIcon from "@mui/icons-material/Settings";
import TelegramIcon from "@mui/icons-material/Telegram";
import { Link } from "react-router-dom";
import "./AdminSidebar.css";

const SUPER_ADMIN_EMAIL = "zomuansangajacob523@gmail.com";

const AdminSidebar = () => {
  const { user } = useSelector((state) => state.user);
  const isSuperAdmin =
    user?.email && user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

  return (
    <div className="admin-sidebar-container">
      <span>
        <small>MAIN</small>
      </span>
      <ul>
        <li>
          <Link to="/admin-dashboard">
            <HomeIcon className="me-2" />
            Dashboard
          </Link>
        </li>
      </ul>
      <span>
        <small>LISTS</small>
      </span>
      <ul>
        <li>
          <Link to="/admin-orders">
            <ReceiptIcon className="me-2" />
            Orders
          </Link>
        </li>
        <li>
          <Link to="/admin-products">
            <InventoryIcon className="me-2" />
            Products
          </Link>
        </li>
        <li>
          <Link to="/admin-users">
            <GroupIcon className="me-2" />
            Customers
          </Link>
        </li>
        <li>
          <Link to="/admin-payments">
            <PaymentIcon className="me-2" />
            Payments
          </Link>
        </li>
        {isSuperAdmin && (
          <>
            <li>
              <Link to="/admin-payment-config">
                <SettingsIcon className="me-2" />
                Payment Gateway
              </Link>
            </li>
            <li>
              <Link to="/admin-telegram-config">
                <TelegramIcon className="me-2" />
                Telegram Config
              </Link>
            </li>
          </>
        )}
        <li>
          <Link to="/admin-wallet-history">
            <PaymentIcon className="me-2" />
            Wallet History
          </Link>
        </li>
        <li>
          <Link to="/admin-queries">
            <HelpIcon className="me-2" />
            Queries
          </Link>
        </li>
        <li>
          <Link to="/admin-gallery">
            <CollectionsIcon className="me-2" />
            Gallery
          </Link>
        </li>
        <li>
          <Link to="/admin-banners">
            <CollectionsIcon className="me-2" />
            Banners
          </Link>
        </li>
        <li>
          <Link to="/admin-add-reward">
            <EmojiEventsIcon className="me-2" />
            Add Rewards
          </Link>
        </li>
        <li>
          <Link to="/admin-rewards">
            <EmojiEventsIcon className="me-2" />
            Winner List
          </Link>
        </li>
        <li>
          <Link to="/admin-product-category">
            <CollectionsIcon className="me-2" />
            Add Category
          </Link>
        </li>
        {/* <li>
          <Link to="/admin-banners">
            <ViewCarouselIcon className="me-2" />
            Banners
          </Link>
        </li> */}
        {/* <li>
          <Link to="/admin-notification">
            <NotificationsActiveIcon className="me-2" />
            Notification
          </Link>
        </li> */}
        <li>
          <Link to="/admin-add-coupon">
            <DiscountIcon className="me-2" />
            Coupons
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default AdminSidebar;
