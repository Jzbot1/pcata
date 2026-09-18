import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPass from "./pages/ForgotPass";
import Contact from "./pages/Contact";
import Dashboard from "./user/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import AdminDashboard from "./admin/AdminDashboard";
import AdminUsers from "./admin/AdminUsers";
import EditUser from "./admin/EditUser";
import AdminPayments from "./admin/AdminPayments";
import Terms from "./pages/Terms";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import GamePage from "./pages/GamePage";
import Search from "./pages/Search";
import AdminProduct from "./admin/AdminProduct";
import AdminAddProduct from "./admin/AdminAddProduct";
import AdminEditProduct from "./admin/AdminEditProduct";
import AdminOrder from "./admin/AdminOrder";
import ProductInfo from "./pages/ProductInfo";
import Orders from "./user/Orders";
import Account from "./user/Account";
import ViewOrder from "./user/ViewOrder";
import AdminViewOrder from "./admin/AdminViewOrder";
import AdminAddCoupon from "./admin/AdminAddCoupon.js";
import AdminPaymentConfig from "./admin/AdminPaymentConfig.js";
import AdminTelegramConfig from "./admin/AdminTelegramConfig.js";
import AdminQueries from "./admin/AdminQueries";
import Wallet from "./user/Wallet";
import Query from "./user/Query";
import AdminGallery from "./admin/AdminGallery";
import AdminRoute from "./components/AdminRoute.js";
import SuperAdminRoute from "./components/SuperAdminRoute.js";
import AdminWalletHistory from "./admin/components/AdminWalletHistory.js";
import Leaderboard from "./pages/Leaderboard.js";
import AddProductCategory from "./admin/components/AddProductCategory.js";
import getUserData from "./utils/userDataService.js";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setBanners, setUser } from "./redux/features/userSlice.js";
import AdminBanners from "./admin/AdminBanners.js";
import axios from "axios";
import { message } from "antd";
import AdminAddReward from "./admin/AdminAddReward.js";
import AdminRewards from "./admin/AdminRewards.js";
import AdminMaintenance from "./admin/AdminMaintenance.js";
import MaintenancePage from "./pages/MaintenancePage.js";
import { GoogleOAuthProvider } from "@react-oauth/google";

function App() {
  const dispatch = useDispatch(); 
  const [balance, setBalance] = useState("");
  const [googleClientId, setGoogleClientId] = useState(
    process.env.REACT_APP_GOOGLE_CLIENT_ID || ""
  );
  const [maintenance, setMaintenance] = useState(null);
  const [userState, setUserState] = useState(null);

  async function getAuthConfig() {
    try {
      const res = await axios.get("/api/user/auth-config");
      if (res.data.success && res.data.googleClientId) {
        setGoogleClientId(res.data.googleClientId);
      }
    } catch (err) {
      console.log("Error loading auth config:", err);
    }
  }

  async function getMaintenanceConfig() {
    try {
      const res = await axios.get("/api/maintenance/status");
      if (res.data.success && res.data.data) {
        setMaintenance(res.data.data);
      }
    } catch (err) {
      console.log("Error loading maintenance status:", err);
    }
  }

  async function getBanners() {
    try {
      const res = await axios.get("/api/banner/get-banners", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (res.data.success) {
        dispatch(setBanners(res.data.data));
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getAuthConfig();
    getMaintenanceConfig();
    getBanners();
    getUserData(dispatch, (u) => {
      dispatch(setUser(u));
      setUserState(u);
    }, setBalance);

    const mInterval = setInterval(getMaintenanceConfig, 15000);
    return () => clearInterval(mInterval);
  }, []);

  const isSuperAdmin =
    userState?.email &&
    userState.email.toLowerCase() === "zomuansangajacob523@gmail.com".toLowerCase();
  const isAdmin = Boolean(userState?.isAdmin || isSuperAdmin);

  const renderWithMaintenanceGuard = (component) => {
    if (maintenance && maintenance.isMaintenance && !isAdmin) {
      return <MaintenancePage config={maintenance} />;
    }
    return component;
  };

  return (
    <GoogleOAuthProvider clientId={googleClientId || "dummy-client-id"}>
      <BrowserRouter>
        <Routes>
        {/* pages */}
        <Route path="/:token?" element={renderWithMaintenanceGuard(<Home />)} />
        <Route
          path="/register"
          element={
            <Register />
          }
        />
        <Route
          path="/login"
          element={
            <Login />
          }
        />
        <Route path="/forgot-password" element={<ForgotPass />} />
        <Route path="/games" element={renderWithMaintenanceGuard(<GamePage />)} />
        <Route path="/search" element={renderWithMaintenanceGuard(<Search />)} />
        <Route path="/support" element={<Contact />} />
        <Route path="/product/:name?" element={renderWithMaintenanceGuard(<ProductInfo/>)} />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <Wallet />
            </ProtectedRoute>
          }
        />
        <Route
          path="/query"
          element={
            <ProtectedRoute>
              <Query />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-order/:orderId?"
          element={
            <ProtectedRoute>
              <ViewOrder />
            </ProtectedRoute>
          }
        />
        <Route path="/terms" element={<Terms />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        {/* ======================== USER PAGES =============================== */}
        {/* ========== EMAIL VERIFY */}
        <Route
          path="/user-dashboard/:token?"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        {/* ======================== USER PAGES =============================== */}
        {/* ======================== ADMIN PAGES =============================== */}

        <Route
          path="/admin-dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin-banners"
          element={
            <AdminRoute>
              <AdminBanners />
            </AdminRoute>
          }
        />
        <Route
          path="/admin-orders"
          element={
            <AdminRoute>
              <AdminOrder />
            </AdminRoute>
          }
        />
        <Route
          path="/admin-view-order/:orderId?"
          element={
            <AdminRoute>
              <AdminViewOrder />
            </AdminRoute>
          }
        />
        <Route
          path="/admin-products"
          element={
            <AdminRoute>
              <AdminProduct />
            </AdminRoute>
          }
        />
        <Route
          path="/admin-add-product"
          element={
            <AdminRoute>
              <AdminAddProduct />
            </AdminRoute>
          }
        />
        <Route
          path="/admin-product-category"
          element={
            <AdminRoute>
              <AddProductCategory />
            </AdminRoute>
          }
        />
        <Route
          path="/admin-edit-product/:id?"
          element={
            <AdminRoute>
              <AdminEditProduct />
            </AdminRoute>
          }
        />
        <Route
          path="/admin-users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin-add-reward"
          element={
            <AdminRoute>
              <AdminAddReward />
            </AdminRoute>
          }
        />
        <Route
          path="/admin-rewards"
          element={
            <AdminRoute>
              <AdminRewards />
            </AdminRoute>
          }
        />
        <Route
          path="/admin-edit-user/:id?"
          element={
            <AdminRoute>
              <EditUser />
            </AdminRoute>
          }
        />
        <Route
          path="/admin-payments"
          element={
            <AdminRoute>
              <AdminPayments />
            </AdminRoute>
          }
        />

        <Route
          path="/admin-maintenance"
          element={
            <AdminRoute>
              <AdminMaintenance />
            </AdminRoute>
          }
        />

        <Route
          path="/admin-wallet-history"
          element={
            <AdminRoute>
              <AdminWalletHistory />
            </AdminRoute>
          }
        />

        <Route
          path="/admin-queries"
          element={
            <AdminRoute>
              <AdminQueries />
            </AdminRoute>
          }
        />
        <Route
          path="/admin-gallery"
          element={
            <AdminRoute>
              <AdminGallery />
            </AdminRoute>
          }
        />

        <Route
          path="/admin-add-coupon"
          element={
            <AdminRoute>
              <AdminAddCoupon />
            </AdminRoute>
          }
        />

        <Route
          path="/admin-payment-config"
          element={
            <SuperAdminRoute>
              <AdminPaymentConfig />
            </SuperAdminRoute>
          }
        />

        <Route
          path="/admin-telegram-config"
          element={
            <SuperAdminRoute>
              <AdminTelegramConfig />
            </SuperAdminRoute>
          }
        />
        {/* ======================== ADMIN PAGES =============================== */}
      </Routes>
    </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
