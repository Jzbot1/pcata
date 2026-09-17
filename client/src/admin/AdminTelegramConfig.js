import React, { useState, useEffect } from "react";
import AdminLayout from "./components/AdminLayout";
import { message, Switch } from "antd";
import axios from "axios";
import SendIcon from "@mui/icons-material/Send";
import SaveIcon from "@mui/icons-material/Save";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import TelegramIcon from "@mui/icons-material/Telegram";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import "./AdminTelegramConfig.css";

const AdminTelegramConfig = () => {
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/telegram/get-config", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      if (res.data.success && res.data.data) {
        setBotToken(res.data.data.botToken || "");
        setChatId(res.data.data.chatId || "");
        setIsEnabled(res.data.data.isEnabled !== false);
      }
    } catch (error) {
      console.error("Error fetching Telegram config:", error);
      message.error(error.response?.data?.message || "Failed to load Telegram configuration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e) => {
    e?.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(
        "/api/telegram/update-config",
        {
          botToken: botToken.trim(),
          chatId: chatId.trim(),
          isEnabled,
        },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      if (res.data.success) {
        message.success(res.data.message || "Telegram settings saved successfully!");
      } else {
        message.error(res.data.message || "Failed to save settings");
      }
    } catch (error) {
      console.error("Save error:", error);
      message.error(error.response?.data?.message || "Error updating Telegram settings");
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    if (!botToken.trim() || !chatId.trim()) {
      return message.warning("Please enter both Bot Token and Chat ID to send a test message.");
    }

    try {
      setTesting(true);
      const res = await axios.post(
        "/api/telegram/test-notification",
        {
          botToken: botToken.trim(),
          chatId: chatId.trim(),
        },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      if (res.data.success) {
        message.success(res.data.message || "Test message sent to Telegram!");
      } else {
        message.error(res.data.message || "Failed to send test notification");
      }
    } catch (error) {
      console.error("Test message error:", error);
      message.error(error.response?.data?.message || "Failed to send test notification");
    } finally {
      setTesting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="telegram-config-container">
        <div className="telegram-card">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <div className="telegram-header-badge">
                <TelegramIcon fontSize="small" /> Telegram Bot Integration
              </div>
              <h4 className="telegram-title">Manual Order Instant Notifications</h4>
              <p className="telegram-subtitle">
                Receive instant alerts on Telegram whenever a customer pays for a Manual Order.
              </p>
            </div>
            {botToken && chatId && isEnabled && (
              <div className="badge bg-success d-flex align-items-center gap-1 p-2">
                <CheckCircleIcon fontSize="inherit" /> Active & Connected
              </div>
            )}
          </div>

          <form onSubmit={handleSave}>
            <div className="switch-wrapper">
              <div>
                <strong className="text-dark d-block">Enable Telegram Alerts</strong>
                <small className="text-muted">
                  Toggle on/off automatic notifications for manual orders.
                </small>
              </div>
              <Switch
                checked={isEnabled}
                onChange={(checked) => setIsEnabled(checked)}
              />
            </div>

            <div className="form-group-custom">
              <label>Telegram Bot Token</label>
              <div className="input-wrapper-custom">
                <input
                  type={showToken ? "text" : "password"}
                  className="input-custom"
                  placeholder="e.g. 1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                />
                <button
                  type="button"
                  className="toggle-btn-eye"
                  onClick={() => setShowToken(!showToken)}
                  title={showToken ? "Hide Token" : "Show Token"}
                >
                  {showToken ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </button>
              </div>
              <small className="text-muted mt-1 d-block">
                Generated from Telegram's <b>@BotFather</b>.
              </small>
            </div>

            <div className="form-group-custom">
              <label>Admin Telegram Chat ID / Channel ID</label>
              <div className="input-wrapper-custom">
                <input
                  type="text"
                  className="input-custom"
                  placeholder="e.g. 123456789 (Your Chat ID) or -1001234567890 (Channel/Group ID)"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                />
              </div>
              <small className="text-muted mt-1 d-block">
                Your personal Chat ID or an Admin Group/Channel ID where alerts will be delivered.
              </small>
            </div>

            <div className="btn-actions-group">
              <button
                type="submit"
                className="btn-tg-primary"
                disabled={loading}
              >
                <SaveIcon fontSize="small" /> {loading ? "Saving..." : "Save Settings"}
              </button>

              <button
                type="button"
                className="btn-tg-test"
                onClick={handleTest}
                disabled={testing || !botToken || !chatId}
              >
                <SendIcon fontSize="small" /> {testing ? "Sending..." : "Send Test Message"}
              </button>
            </div>
          </form>
        </div>

        <div className="instructions-card">
          <h6 className="fw-bold text-dark mb-3">
            <TelegramIcon className="me-1 text-primary" /> How to Setup Telegram Notifications:
          </h6>

          <div className="instruction-step">
            <div className="step-number">1</div>
            <div className="step-text">
              Open Telegram and search for <b>@BotFather</b>. Send <code>/newbot</code>, follow the prompts, and copy the <b>HTTP API Bot Token</b> provided.
            </div>
          </div>

          <div className="instruction-step">
            <div className="step-number">2</div>
            <div className="step-text">
              Open your newly created bot in Telegram and click <b>START</b> (or send any message like <code>/start</code>) so the bot can message you.
            </div>
          </div>

          <div className="instruction-step">
            <div className="step-number">3</div>
            <div className="step-text">
              To find your <b>Chat ID</b>, search for <b>@userinfobot</b> on Telegram, start it, and copy your numeric ID (e.g. <code>123456789</code>).
              <br />
              <i>Note: If sending to a group or channel, add your bot as Admin to the group and enter the group's ID (e.g. <code>-100xxxxxxxxxx</code>).</i>
            </div>
          </div>

          <div className="instruction-step">
            <div className="step-number">4</div>
            <div className="step-text">
              Paste the <b>Bot Token</b> and <b>Chat ID</b> above, click <b>"Send Test Message"</b> to verify, and then click <b>"Save Settings"</b>!
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminTelegramConfig;
