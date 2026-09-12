import React, { useState, useEffect } from "react";
import AdminLayout from "./components/AdminLayout";
import "./AdminPaymentConfig.css";
import axios from "axios";
import { message, Switch, Spin, Select } from "antd";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SaveIcon from "@mui/icons-material/Save";
import PaymentIcon from "@mui/icons-material/Payment";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SyncAltIcon from "@mui/icons-material/SyncAlt";

const { Option } = Select;

const GATEWAY_DEFAULTS = {
  JZSTORE: {
    apiUrl: "https://checkout.pages.jzstore.in",
    apiKey: "509ffd178aff24dc09640796da90fc22",
    label: "JZStore / All-in-One UPI Gateway",
  },
  UPIGATEWAY: {
    apiUrl: "https://api.ekqr.in",
    apiKey: "f4d678cf-beb7-4235-a85f-51e17200976b",
    label: "EkQR / UPIGateway",
  },
};

const AdminPaymentConfig = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(true);

  const [formData, setFormData] = useState({
    gatewayType: "JZSTORE",
    apiUrl: "https://checkout.pages.jzstore.in",
    apiKey: "509ffd178aff24dc09640796da90fc22",
    isActive: true,
    updatedAt: null,
  });

  const getPaymentConfig = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/get-payment-config", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      if (res.data && res.data.success) {
        const config = res.data.data;
        const gatewayType =
          config.gatewayType ||
          (config.apiUrl && config.apiUrl.includes("jzstore")
            ? "JZSTORE"
            : "UPIGATEWAY");

        setFormData({
          gatewayType: gatewayType,
          apiUrl: config.apiUrl || GATEWAY_DEFAULTS[gatewayType].apiUrl,
          apiKey: config.apiKey || GATEWAY_DEFAULTS[gatewayType].apiKey,
          isActive: typeof config.isActive === "boolean" ? config.isActive : true,
          updatedAt: config.updatedAt || null,
        });
      } else {
        message.error(res.data?.message || "Failed to load payment configuration");
      }
    } catch (error) {
      console.error("Error fetching payment config:", error);
      message.error(
        error.response?.data?.message || "Failed to load payment configuration"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPaymentConfig();
  }, []);

  const handleGatewayChange = (type) => {
    const defaults = GATEWAY_DEFAULTS[type] || GATEWAY_DEFAULTS.JZSTORE;
    setFormData((prev) => ({
      ...prev,
      gatewayType: type,
      apiUrl: defaults.apiUrl,
      apiKey: defaults.apiKey,
    }));
    message.info(`Switched template to ${defaults.label}`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (checked) => {
    setFormData((prev) => ({
      ...prev,
      isActive: checked,
    }));
  };

  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    message.success(`${fieldName} copied to clipboard!`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.apiUrl.trim()) {
      return message.warning("Please provide a valid API URL");
    }

    if (!formData.apiUrl.trim().startsWith("https://")) {
      return message.error("API URL must begin with https:// for security");
    }

    if (!formData.apiKey.trim()) {
      return message.warning("Please provide an API Key / Token");
    }

    try {
      setSaving(true);
      const res = await axios.post(
        "/api/admin/update-payment-config",
        {
          gatewayType: formData.gatewayType,
          apiUrl: formData.apiUrl.trim(),
          apiKey: formData.apiKey.trim(),
          isActive: formData.isActive,
        },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      if (res.data && res.data.success) {
        message.success(res.data.message || "Payment configuration saved successfully");
        if (res.data.data) {
          setFormData((prev) => ({
            ...prev,
            updatedAt: res.data.data.updatedAt,
          }));
        }
      } else {
        message.error(res.data?.message || "Failed to update configuration");
      }
    } catch (error) {
      console.error("Error updating payment config:", error);
      message.error(
        error.response?.data?.message || "Error saving payment gateway configuration"
      );
    } finally {
      setSaving(false);
    }
  };

  const webhookUrl = `${window.location.origin}/api/wallet/webhook`;

  return (
    <AdminLayout>
      <div className="payment-config-wrapper">
        <div className="payment-config-header">
          <div>
            <h2>
              <PaymentIcon style={{ color: "#ebef29" }} />
              Payment Gateway Settings
            </h2>
            <p>
              Configure live API URL and Token for UPI Payments and Wallet top-ups.
            </p>
          </div>
          <div>
            <span
              className={`gateway-status-pill ${
                formData.isActive ? "active" : "inactive"
              }`}
            >
              <span
                className={`status-dot-pulse ${
                  formData.isActive ? "active" : "inactive"
                }`}
              ></span>
              {formData.isActive ? "Gateway Active" : "Gateway Disabled"}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spin size="large" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="config-form-section">
            {/* Gateway Provider Selection */}
            <div className="config-field-group">
              <label className="config-field-label" htmlFor="gatewayType">
                <span>
                  <SyncAltIcon style={{ fontSize: "16px", marginRight: "4px" }} />
                  Select Gateway Provider <strong style={{ color: "#e11d48" }}>*</strong>
                </span>
              </label>
              <Select
                value={formData.gatewayType}
                onChange={handleGatewayChange}
                size="large"
                style={{ width: "100%" }}
              >
                <Option value="JZSTORE">
                  ⚡ JZStore / All-in-One UPI Gateway (checkout.pages.jzstore.in)
                </Option>
                <Option value="UPIGATEWAY">
                  💳 EkQR / UPIGateway (api.ekqr.in)
                </Option>
              </Select>
              <div className="field-help-text">
                Switching provider automatically sets the default API URL and recommended Token template.
              </div>
            </div>

            {/* API URL Field */}
            <div className="config-field-group">
              <label className="config-field-label" htmlFor="apiUrl">
                <span>
                  API Base URL <strong style={{ color: "#e11d48" }}>*</strong>
                </span>
                <button
                  type="button"
                  className="toggle-visibility-button"
                  onClick={() => copyToClipboard(formData.apiUrl, "API URL")}
                >
                  <ContentCopyIcon style={{ fontSize: "14px" }} /> Copy
                </button>
              </label>
              <div className="config-input-box">
                <input
                  type="url"
                  id="apiUrl"
                  name="apiUrl"
                  className="config-input-field"
                  placeholder={
                    formData.gatewayType === "JZSTORE"
                      ? "https://checkout.pages.jzstore.in"
                      : "https://api.ekqr.in"
                  }
                  value={formData.apiUrl}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="field-help-text">
                Base endpoint for the payment gateway. Must begin with <code>https://</code>.
              </div>
            </div>

            {/* API Key / Token Field */}
            <div className="config-field-group">
              <label className="config-field-label" htmlFor="apiKey">
                <span>
                  {formData.gatewayType === "JZSTORE" ? "Merchant User Token" : "Secret API Key"}{" "}
                  <strong style={{ color: "#e11d48" }}>*</strong>
                </span>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="toggle-visibility-button"
                    style={{ position: "static" }}
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <>
                        <VisibilityOffIcon style={{ fontSize: "14px" }} /> Hide
                      </>
                    ) : (
                      <>
                        <VisibilityIcon style={{ fontSize: "14px" }} /> Show
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="toggle-visibility-button"
                    style={{ position: "static" }}
                    onClick={() => copyToClipboard(formData.apiKey, "API Token")}
                  >
                    <ContentCopyIcon style={{ fontSize: "14px" }} /> Copy
                  </button>
                </div>
              </label>
              <div className="config-input-box">
                <input
                  type={showApiKey ? "text" : "password"}
                  id="apiKey"
                  name="apiKey"
                  className="config-input-field"
                  placeholder={
                    formData.gatewayType === "JZSTORE"
                      ? "Enter your JZStore user_token"
                      : "Enter your UPIGateway API key"
                  }
                  value={formData.apiKey}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="field-help-text">
                {formData.gatewayType === "JZSTORE"
                  ? "Your merchant user_token generated in the JZStore gateway portal."
                  : "Your merchant API Key from the EkQR / UPIGateway merchant dashboard."}
              </div>
            </div>

            {/* Gateway Status */}
            <div className="config-switch-box">
              <div className="config-switch-info">
                <h5>Gateway Active Status</h5>
                <span>Turn ON to process all user payments & wallet recharges through this gateway.</span>
              </div>
              <Switch
                checked={formData.isActive}
                onChange={handleSwitchChange}
              />
            </div>

            {/* Webhook Callback Display */}
            <div className="config-field-group" style={{ marginTop: "10px" }}>
              <label className="config-field-label">
                <span>Instant Webhook URL (For Merchant Portal)</span>
                <button
                  type="button"
                  className="toggle-visibility-button"
                  onClick={() => copyToClipboard(webhookUrl, "Webhook URL")}
                >
                  <ContentCopyIcon style={{ fontSize: "14px" }} /> Copy
                </button>
              </label>
              <div className="config-input-box">
                <input
                  type="text"
                  className="config-input-field"
                  value={webhookUrl}
                  readOnly
                  style={{ backgroundColor: "#f9fafb", cursor: "pointer" }}
                  onClick={() => copyToClipboard(webhookUrl, "Webhook URL")}
                />
              </div>
              <div className="field-help-text">
                Paste this URL in your Gateway Merchant Dashboard under <strong>Webhook Settings</strong> for instant payment confirmations.
              </div>
            </div>

            {formData.updatedAt && (
              <div style={{ fontSize: "13px", color: "#6b7280" }}>
                Last Updated: {new Date(formData.updatedAt).toLocaleString("en-IN")}
              </div>
            )}

            <div>
              <button
                type="submit"
                className="save-config-action-btn"
                disabled={saving}
              >
                <SaveIcon style={{ fontSize: "18px" }} />
                {saving ? "Saving Changes..." : "Save Configuration"}
              </button>
            </div>
          </form>
        )}

        <div className="gateway-guide-box">
          <h4>
            <InfoOutlinedIcon style={{ fontSize: "18px", color: "#3b82f6" }} />
            Active Gateway Details: {formData.gatewayType}
          </h4>
          <ul>
            <li>
              <strong>Instant Updates:</strong> Changes saved take effect immediately across all customer checkout flows without requiring a server restart.
            </li>
            <li>
              <strong>Endpoints Utilized:</strong>
              <ul>
                <li>
                  Order Creation:{" "}
                  <code>
                    {formData.apiUrl || "https://checkout.pages.jzstore.in"}
                    {formData.gatewayType === "JZSTORE" ? "/api/create-order" : "/api/create_order"}
                  </code>
                </li>
                <li>
                  Status Check:{" "}
                  <code>
                    {formData.apiUrl || "https://checkout.pages.jzstore.in"}
                    {formData.gatewayType === "JZSTORE" ? "/api/check-order-status" : "/api/check_order_status"}
                  </code>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPaymentConfig;
