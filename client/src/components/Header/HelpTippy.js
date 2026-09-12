import React from "react";
import { useNavigate } from "react-router-dom";
import TelegramIcon from "@mui/icons-material/Telegram";
import EmailIcon from "@mui/icons-material/Email";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import "./Header.css";

const HelpTippy = ({ user }) => {
  const navigate = useNavigate();
  return (
    <div className="logout-tippy">
      <div className="section-1">
        <span>
          <TelegramIcon className="me-2 icon" />
        </span>
        <a
          className="text-dark"
          target="_blank"
          href="https://t.me/muslimsaathi"
        >
          Telegram
        </a>
      </div>
      <div className="section-2">
        <span>
          <EmailIcon className="me-2 icon" />
        </span>
        <a
          className="text-dark"
          target="_blank"
          href="mailto:hello@muslimsaathi.in"
        >
          Mail Us
        </a>
      </div>
      <div className="section-3">
        <small>
          <SupportAgentIcon className="me-2 icon" />
        </small>
        <small>
          <span>24 x 7</span>
        </small>
      </div>
    </div>
  );
};

export default HelpTippy;
