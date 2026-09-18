import React from "react";
import { useSelector } from "react-redux";
import HomeIcon from "@mui/icons-material/Home";
import GroupIcon from "@mui/icons-material/Group";
import CollectionsIcon from "@mui/icons-material/Collections";
import CancelIcon from "@mui/icons-material/Cancel";
import ReceiptIcon from "@mui/icons-material/Receipt";
import HelpIcon from "@mui/icons-material/Help";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MobileScreenShareIcon from "@mui/icons-material/MobileScreenShare";
import InventoryIcon from "@mui/icons-material/Inventory";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import ViewCarouselIcon from "@mui/icons-material/ViewCarousel";
import DiscountIcon from "@mui/icons-material/Discount";
import SettingsIcon from "@mui/icons-material/Settings";
import TelegramIcon from "@mui/icons-material/Telegram";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import { Link, useNavigate } from "react-router-dom";

const SUPER_ADMIN_EMAIL = "zomuansangajacob523@gmail.com";

const AdminSidemenu = ({ menu, setMenu }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const isSuperAdmin =
    user?.email && user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

  return (
    <div className={`admin-sidemenu-container ${menu && "active"}`}>
      <div className="w-100 d-flex justify-content-end p-3">
        <CancelIcon
          onClick={() => setMenu(!menu)}
          className="text-dark cancel-icon"
        />
      </div>
      <ul>
        <li
          onClick={() => {
            setMenu(!menu);
            navigate("/admin-dashboard");
          }}
        >
          <HomeIcon className="me-2" />
          Dashboard
        </li>
        <li
          onClick={() => {
            setMenu(!menu);
            navigate("/admin-maintenance");
          }}
        >
          <BuildCircleIcon className="me-2" />
          Maintenance Mode
        </li>
        <li
          onClick={() => {
            setMenu(!menu);
            navigate("/admin-orders");
          }}
        >
          <ReceiptIcon className="me-2" />
          Orders
        </li>
        <li
          onClick={() => {
            setMenu(!menu);
            navigate("/admin-payments");
          }}
        >
          <MobileScreenShareIcon className="me-2" />
          Payment
        </li>
        {isSuperAdmin && (
          <>
            <li
              onClick={() => {
                setMenu(!menu);
                navigate("/admin-payment-config");
              }}
            >
              <SettingsIcon className="me-2" />
              Payment Gateway
            </li>
            <li
              onClick={() => {
                setMenu(!menu);
                navigate("/admin-telegram-config");
              }}
            >
              <TelegramIcon className="me-2" />
              Telegram Config
            </li>
          </>
        )}
        <li
          onClick={() => {
            setMenu(!menu);
            navigate("/admin-wallet-history");
          }}
        >
          <MobileScreenShareIcon className="me-2" />
          Wallet History
        </li>
        <li
          onClick={() => {
            setMenu(!menu);
            navigate("/admin-users");
          }}
        >
          <GroupIcon className="me-2" />
          Customers
        </li>
        <li
          onClick={() => {
            setMenu(!menu);
            navigate("/admin-gallery");
          }}
        >
          <GroupIcon className="me-2" />
          Gallery
        </li>
        <li
          onClick={() => {
            setMenu(!menu);
            navigate("/admin-banners");
          }}
        >
          <GroupIcon className="me-2" />
          Banners
        </li>
        <li
          onClick={() => {
            setMenu(!menu);
            navigate("/admin-add-reward");
          }}
        >
          <EmojiEventsIcon className="me-2" />
          Add Reward
        </li>
        <li
          onClick={() => {
            setMenu(!menu);
            navigate("/admin-rewards");
          }}
        >
          <EmojiEventsIcon className="me-2" />
          Winner List
        </li>
        <li
          onClick={() => {
            setMenu(!menu);
            navigate("/admin-product-category");
          }}
        >
          <GroupIcon className="me-2" />
          Add Category
        </li>
        <li
          onClick={() => {
            setMenu(!menu);
            navigate("/admin-products");
          }}
        >
          <InventoryIcon className="me-2" />
          Products
        </li>
        <li
          onClick={() => {
            setMenu(!menu);
            navigate("/admin-queries");
          }}
        >
          <HelpIcon className="me-2" />
          Queries
        </li>
        <li
          onClick={() => {
            setMenu(!menu);
            navigate("/admin-add-coupon");
          }}
        >
          <DiscountIcon className="me-2" />
          Coupons
        </li>
        {/* <li
          onClick={() => {
            setMenu(!menu);
            navigate("/admin-gallery");
          }}
        >
          <CollectionsIcon className="me-2" />
          Gallery
        </li> */}
        {/* <li
          onClick={() => {
            setMenu(!menu);
            navigate("/admin-banners");
          }}
        >
          <ViewCarouselIcon className="me-2" />
          Banners
        </li> */}
        {/* <li
          onClick={() => {
            setMenu(!menu);
            navigate("/admin-notification");
          }}
        >
          <NotificationsActiveIcon className="me-2" />
          Notification
        </li> */}
        {/* <li
          onClick={() => {
            setMenu(!menu);
            navigate("/admin-add-coupon");
          }}
        >
          <DiscountIcon className="me-2" />
          Notification
        </li> */}
      </ul>
    </div>
  );
};

export default AdminSidemenu;
