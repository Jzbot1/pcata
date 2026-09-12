import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import axios from "axios";
import DashboardLayout from "./components/DashboardLayout";
import InstallMobileIcon from "@mui/icons-material/InstallMobile";
import TollIcon from "@mui/icons-material/Toll";
import getUserData from "../utils/userDataService.js";
import "./Dashboard.css";
import { setUser } from "../redux/features/userSlice.js";

const Dashboard = () => {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const params = useParams();
  const [allOrders, setAllOrders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState("");

  useEffect(() => {
    getUserData(dispatch, setUser, setBalance);
  }, []);

  const getAllUserOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        "/api/order/get-user-orders",
        { email: user?.email },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      if (res.data.success) {
        setAllOrders(res.data.data);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    if (user !== null) {
      getAllUserOrders();
    }
  }, [user]);

  return (
    <Layout>
      <DashboardLayout>
        <div className="user-dashboard">
          <div
            className="shadow dash-card w-100 w-lg-50"
            onClick={() => navigate("/orders")}
          >
            <div className="count">
              <h1 className="m-0">
                <b>{allOrders?.length || 0}</b>
              </h1>
              <span>Orders</span>
            </div>
            <InstallMobileIcon className="icon" />
          </div>
          <div
            className="shadow dash-card w-100 w-lg-50"
            onClick={() => navigate("/wallet")}
          >
            <div className="count">
              <h1 className="m-0">
                <b>{parseFloat(balance).toFixed(2)}</b>
              </h1>
              <span>Z Coins</span>
            </div>
            <TollIcon className="icon" />
          </div>
        </div>
      </DashboardLayout>
    </Layout>
  );
};

export default Dashboard;
