import React, { useEffect, useState } from "react";
import AdminLayout from "./components/AdminLayout";
import { message, Switch } from "antd";
import axios from "axios";
import MaintenancePage from "../pages/MaintenancePage";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SaveIcon from "@mui/icons-material/Save";
import "./AdminMaintenance.css";

const AdminMaintenance = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState({
    isMaintenance: false,
    maintenanceTitle: "Scheduled Maintenance in Progress 🚀",
    maintenanceMessage:
      "We are currently upgrading Zelan Store systems to serve you better. We'll be back online shortly!",
    estimatedEndTime: "",
    supportTelegram: "https://t.me/zelanstore",
    supportWhatsapp: "",
  });

  const getMaintenanceStatus = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/maintenance/status");
      if (res.data.success && res.data.data) {
        setFormData({
          isMaintenance: Boolean(res.data.data.isMaintenance),
          maintenanceTitle:
            res.data.data.maintenanceTitle || "Scheduled Maintenance in Progress 🚀",
          maintenanceMessage:
            res.data.data.maintenanceMessage ||
            "We are currently upgrading Zelan Store systems to serve you better. We'll be back online shortly!",
          estimatedEndTime: res.data.data.estimatedEndTime || "",
          supportTelegram: res.data.data.supportTelegram || "https://t.me/zelanstore",
          supportWhatsapp: res.data.data.supportWhatsapp || "",
        });
      }
    } catch (err) {
      console.error("Error loading maintenance config:", err);
      message.error("Failed to load maintenance status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMaintenanceStatus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleSwitch = (checked) => {
    setFormData((prev) => ({ ...prev, isMaintenance: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await axios.post("/api/maintenance/update", formData, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      if (res.data.success) {
        message.success(
          `Maintenance mode ${formData.isMaintenance ? "ENABLED" : "DISABLED"} successfully!`
        );
      } else {
        message.error(res.data.message || "Failed to update configuration");
      }
    } catch (err) {
      console.error("Error saving maintenance settings:", err);
      message.error("Error saving maintenance settings: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-maintenance-container">
        <div className="maintenance-hero-banner">
          <div>
            <h2 className="m-0 mb-1 d-flex align-items-center gap-2">
              <BuildCircleIcon style={{ color: "#818cf8" }} /> Store Maintenance Mode
            </h2>
            <p className="m-0 text-muted">
              Control public access, schedule downtime, and customize the maintenance screen.
            </p>
          </div>

          <div
            className={`maintenance-status-badge ${
              formData.isMaintenance ? "active" : "inactive"
            }`}
          >
            <span
              className={`status-dot ${
                formData.isMaintenance ? "active" : "inactive"
              }`}
            ></span>
            {formData.isMaintenance ? "Maintenance ACTIVE (STORE CLOSED)" : "Store ONLINE"}
          </div>
        </div>

        <div className="maintenance-form-grid">
          <div className="maintenance-form-card">
            <form onSubmit={handleSubmit}>
              <div className="maintenance-switch-control">
                <Switch
                  checked={formData.isMaintenance}
                  onChange={handleToggleSwitch}
                  style={{
                    backgroundColor: formData.isMaintenance ? "#ef4444" : "#475569",
                  }}
                />
                <div>
                  <div className="switch-label-title">
                    {formData.isMaintenance
                      ? "⚠️ Maintenance Mode is ON"
                      : "✅ Store is Live & Accepting Orders"}
                  </div>
                  <p className="switch-label-desc">
                    {formData.isMaintenance
                      ? "Visitors will see the maintenance screen. Admins can still navigate & manage the site."
                      : "Visitors can browse, register, and place orders normally."}
                  </p>
                </div>
              </div>

              <div className="form-group-item">
                <label>Maintenance Headline</label>
                <input
                  type="text"
                  name="maintenanceTitle"
                  value={formData.maintenanceTitle}
                  onChange={handleChange}
                  placeholder="e.g. Scheduled Maintenance in Progress 🚀"
                  required
                />
              </div>

              <div className="form-group-item">
                <label>Custom Notice Message</label>
                <textarea
                  name="maintenanceMessage"
                  rows="3"
                  value={formData.maintenanceMessage}
                  onChange={handleChange}
                  placeholder="Describe the update or maintenance work..."
                  required
                />
              </div>

              <div className="form-group-item">
                <label>Estimated Completion Date & Time (Optional Countdown)</label>
                <input
                  type="datetime-local"
                  name="estimatedEndTime"
                  value={formData.estimatedEndTime}
                  onChange={handleChange}
                />
                <small className="text-muted d-block mt-1">
                  Leave empty if you don't want to display a countdown timer.
                </small>
              </div>

              <div className="row">
                <div className="col-md-6 form-group-item">
                  <label>Support Telegram Link</label>
                  <input
                    type="text"
                    name="supportTelegram"
                    value={formData.supportTelegram}
                    onChange={handleChange}
                    placeholder="https://t.me/yourchannel"
                  />
                </div>
                <div className="col-md-6 form-group-item">
                  <label>Support WhatsApp Number / Link</label>
                  <input
                    type="text"
                    name="supportWhatsapp"
                    value={formData.supportWhatsapp}
                    onChange={handleChange}
                    placeholder="+919876543210 or wa.me link"
                  />
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-between mt-4">
                <button
                  type="button"
                  className="preview-toggle-btn d-flex align-items-center gap-1"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  {showPreview ? "Hide Preview" : "Live Preview"}
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="maintenance-save-btn d-flex align-items-center gap-2"
                >
                  <SaveIcon /> {saving ? "Saving Changes..." : "Save Settings"}
                </button>
              </div>
            </form>
          </div>

          {showPreview && (
            <div className="preview-modal-container">
              <div className="text-center mb-3">
                <span className="badge bg-primary">Live Visitor Screen Preview</span>
              </div>
              <MaintenancePage config={formData} />
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMaintenance;
