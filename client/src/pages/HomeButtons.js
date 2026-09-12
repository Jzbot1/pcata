import React from "react";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import FeedIcon from "@mui/icons-material/Feed";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import GamesIcon from '@mui/icons-material/Games';
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import DatasetIcon from '@mui/icons-material/Dataset';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import HistoryIcon from "@mui/icons-material/History";
import PaymentsIcon from "@mui/icons-material/Payments";
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import HelpIcon from "@mui/icons-material/Help";
import ChatIcon from "@mui/icons-material/Chat";
import "./HomeButtons.css";

const HomeButtons = () => {
  const navigate = useNavigate();
  return (
    <div className="d-flex d-md-flex d-lg-none mobile-buttons-container">
      <div className="buttons" onClick={() => navigate("/wallet")}>
        <div className="iconcontainer">
          <CurrencyRupeeIcon className="icon" />
        </div>
        <span>Add Money</span>
      </div>
      <div className="buttons" onClick={() => navigate("/orders")}>
        <div className="iconcontainer">
          <HistoryIcon className="icon" />
        </div>
        <span>History</span>
      </div>
      <div className="buttons" onClick={() => navigate("/games")}>
        <div className="iconcontainer">
          <GamesIcon className="icon" />
        </div>
        <span>Games</span>
      </div>
      <div className="buttons position-relative" onClick={() => navigate("/leaderboard")}>
        <span className="new-badge text-dark">New</span>
        <div className="iconcontainer">
            <LeaderboardIcon className="icon" />
        </div>
        <span>Leaderboard</span>
    </div>
      {/* <div className="buttons" onClick={() => navigate("/leaderboard")}>
        <div className="iconcontainer">
          <EmojiEventsIcon className="icon" />
        </div>
        <span>Leaderboard</span>
      </div> */}
    </div>
  );
};

export default HomeButtons;
