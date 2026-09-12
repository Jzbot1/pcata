import React, { useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";
import DashboardLayout from "./components/DashboardLayout";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import CryptoJS from "crypto-js";
import { message } from "antd";
import "./Account.css";
import { setUser } from "../redux/features/userSlice";

const Account = () => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [form, setForm] = useState(null);
  //email
  const [emailOtp, setEmailOtp] = useState(null);
  const [userEnteredEmailOtp, setUserEnteredEmailOtp] = useState("");
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [loading, setLoading] = useState({ loader: false, for: "" });
  //mobile
  const [mobileOtp, setMobileOtp] = useState(null);
  const [userEnteredMobileOtp, setUserEnteredMobileOtp] = useState("");
  const [mobileOtpSent, setMobileOtpSent] = useState(false);

  // sending email otp
  async function handleSendEmailOtp() {
    try {
      setLoading({ ...loading, loader: true, for: "email" });

      const res = await axios.post("/api/otp/send-email-otp", form);

      if (res.data.success) {
        const {
          emailOtp: encryptedEmailOTP,
          key: encryptedKey,
          iv: encryptedIv,
        } = res.data.data;

        const key = CryptoJS.enc.Hex.parse(encryptedKey);
        const iv = CryptoJS.enc.Hex.parse(encryptedIv);

        const decryptedEmailOTP = CryptoJS.AES.decrypt(
          { ciphertext: CryptoJS.enc.Hex.parse(encryptedEmailOTP) },
          key,
          { iv: iv }
        ).toString(CryptoJS.enc.Utf8);

        setEmailOtp(decryptedEmailOTP);
        setEmailOtpSent(true);
        setLoading({ ...loading, loader: false, for: "" });
      } else {
        setLoading({ ...loading, loader: false, for: "" });
        setEmailOtpSent(false);
      }
    } catch (error) {
      setLoading({ ...loading, loader: false, for: "" });
      setEmailOtpSent(false);
      console.log(error);
    }
  }

  // Verify email otp
  async function handleVerifyEmailOtp() {
    try {
      setLoading({ ...loading, loader: true, for: "email" });

      if (parseInt(emailOtp) !== parseInt(userEnteredEmailOtp)) {
        return message.error("Incorrect Email OTP");
      }

      const res = await axios.post("/api/otp/verify-email-otp", form);

      if (res.data.success) {
        setLoading({ ...loading, loader: false, for: "" });
        message.success(res.data.message);
        dispatch(setUser(res.data.data));
        setEmailOtpSent(false);
        getUserData();
      } else {
        message.error(res.data.message);
        setLoading({ ...loading, loader: false, for: "" });
        setEmailOtpSent(false);
      }
    } catch (error) {
      console.log(error);
      setEmailOtpSent(false);
      setLoading({ ...loading, loader: false, for: "" });
    }
  }

  // send mobile otp
  async function handleSendMobileOtp() {
    try {
      setLoading({ ...loading, loader: true, for: "mobile" });

      const res = await axios.post("/api/otp/send-mobile-otp", form);

      if (res.data.success) {
        const {
          mobileOtp: encryptedEmailOTP,
          key: encryptedKey,
          iv: encryptedIv,
        } = res.data.data;

        const key = CryptoJS.enc.Hex.parse(encryptedKey);
        const iv = CryptoJS.enc.Hex.parse(encryptedIv);

        const decryptedMobileOTP = CryptoJS.AES.decrypt(
          { ciphertext: CryptoJS.enc.Hex.parse(encryptedEmailOTP) },
          key,
          { iv: iv }
        ).toString(CryptoJS.enc.Utf8);

        setMobileOtp(decryptedMobileOTP);
        setMobileOtpSent(true);
        setLoading({ ...loading, loader: false, for: "" });
      } else {
        message.error(res.data.message);
        setLoading({ ...loading, loader: false, for: "" });
        setEmailOtpSent(false);
      }
    } catch (error) {
      setLoading({ ...loading, loader: false, for: "" });
      setEmailOtpSent(false);
      console.log(error);
    }
  }

  // verify mobile otp
  async function handleVerifyMobileOtp() {
    try {
      setLoading({ ...loading, loader: true, for: "mobile" });

      if (parseInt(mobileOtp) !== parseInt(userEnteredMobileOtp)) {
        return message.error("Incorrect Mobile OTP");
      }
      const res = await axios.post("/api/otp/verify-mobile-otp", form);

      if (res.data.success) {
        setLoading({ ...loading, loader: false, for: "" });
        message.success(res.data.message);
        dispatch(setUser(res.data.data));
        setMobileOtpSent(false);
        getUserData();
      } else {
        setMobileOtpSent(false);
        setLoading({ ...loading, loader: false, for: "" });
        message.error(res.data.message);
      }
    } catch (error) {
      setLoading({ ...loading, loader: false, for: "" });
      setMobileOtpSent(false);
      console.log(error);
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/user/user-profile-update", form, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (res.data.success) {
        setForm({ ...form, password: "" });
        message.success(res.data.message);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getUserData = async () => {
    axios
      .post(
        "/api/user/getUserData",
        {},
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      )
      .then((res) => {
        if (res.data.success) {
          setForm(res.data.data.user);
        } else {
          localStorage.removeItem("token");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <Layout>
      <DashboardLayout>
        <div className="user-accout-details" style={{ minHeight: "300px" }}>
          <div className="row">
            <div className="col-12 col-sm-12 col-md-6 col-lg-6">
              <div className="rounded bg-light col-12">
                <div className="form-fields mb-3">
                  <label htmlFor="" className="form-label">
                    Email
                  </label>
                  <h6>{form?.email}</h6>
                </div>
              </div>
              <div className="rounded bg-light col-12">
                <div className="form-fields mb-3">
                  <label htmlFor="" className="form-label">
                    Mobile
                  </label>
                  <h6>{form?.mobile}</h6>
                </div>
              </div>
              <div className="rounded bg-light col-12">
                <div className="form-fields mb-3">
                  <label htmlFor="" className="form-label">
                    Password
                  </label>
                  <input
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    type="text"
                    className="form-control pass-input"
                    placeholder="Change password"
                  />
                </div>
              </div>
              <button onClick={handleUpdate} className="theme-btn w-100 p-3">
                Update
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </Layout>
  );
};

export default Account;
