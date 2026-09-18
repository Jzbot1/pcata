import React, { useEffect, useState } from "react";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import TelegramIcon from "@mui/icons-material/Telegram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { Link } from "react-router-dom";
import "./MaintenancePage.css";

const MaintenancePage = ({ config }) => {
  const title = config?.maintenanceTitle || "Scheduled Maintenance in Progress 🚀";
  const message =
    config?.maintenanceMessage ||
    "We are currently upgrading Zelan Store systems to serve you better. We'll be back online shortly!";
  const endTime = config?.estimatedEndTime || "";
  const telegram = config?.supportTelegram || "https://t.me/zelanstore";
  const whatsapp = config?.supportWhatsapp || "";

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    if (!endTime) return;

    const calculateTime = () => {
      const difference = new Date(endTime).getTime() - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="maintenance-page-wrapper">
      <div className="maintenance-bg-glow"></div>
      <div className="maintenance-card">
        <div className="maintenance-icon-cont">
          <BuildCircleIcon className="maintenance-icon" />
        </div>

        <div className="maintenance-brand">Zelan Store System Notice</div>
        <h1 className="maintenance-title">{title}</h1>
        <p className="maintenance-msg">{message}</p>

        {endTime && !timeLeft.isExpired && (
          <div className="countdown-box-wrapper">
            <div className="countdown-label">Estimated System Uptime In</div>
            <div className="countdown-grid">
              {timeLeft.days > 0 && (
                <div className="countdown-unit">
                  <div className="countdown-num">{pad(timeLeft.days)}</div>
                  <div className="countdown-sub">Days</div>
                </div>
              )}
              <div className="countdown-unit">
                <div className="countdown-num">{pad(timeLeft.hours)}</div>
                <div className="countdown-sub">Hours</div>
              </div>
              <div className="countdown-unit">
                <div className="countdown-num">{pad(timeLeft.minutes)}</div>
                <div className="countdown-sub">Mins</div>
              </div>
              <div className="countdown-unit">
                <div className="countdown-num">{pad(timeLeft.seconds)}</div>
                <div className="countdown-sub">Secs</div>
              </div>
            </div>
          </div>
        )}

        <div className="maintenance-actions">
          {telegram && (
            <a
              href={telegram.startsWith("http") ? telegram : `https://${telegram}`}
              target="_blank"
              rel="noreferrer"
              className="m-btn m-btn-telegram"
            >
              <TelegramIcon /> Telegram Support
            </a>
          )}
          {whatsapp && (
            <a
              href={whatsapp.startsWith("http") ? whatsapp : `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="m-btn m-btn-whatsapp"
            >
              <WhatsAppIcon /> WhatsApp Support
            </a>
          )}
        </div>

        <div>
          <Link to="/login" className="maintenance-admin-link">
            <LockOpenIcon style={{ fontSize: 13, marginRight: 4 }} /> Admin & Reseller Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
