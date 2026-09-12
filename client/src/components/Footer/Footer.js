import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import EmailIcon from "@mui/icons-material/Email";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookSharpIcon from "@mui/icons-material/FacebookSharp";
import HelpCenterIcon from "@mui/icons-material/HelpCenter";
import FeedbackIcon from "@mui/icons-material/Feedback";
import IMAGES from "../../img/image";
import "../Footer/Footer.css";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.user);
  return (
    <React.Fragment>
      <div className="footer-subscribe">
        <span>Follow Us!</span>
        <h2>For Every Latest News.</h2>
        <div className="social-media-links social mt-3">
          <Link target="_blank" to="https://www.instagram.com/shoyo_hinata0_0">
            <InstagramIcon className="icon" />
          </Link>
          <Link
            target="_blank"
            to="https://www.facebook.com/KiTsuNe.HT?mibextid=ZbWKwL"
          >
            <FacebookSharpIcon className="icon" />
          </Link>
          <Link target="_blank" to="https://wa.me/919862118985">
            <WhatsAppIcon className="icon" />
          </Link>
          <Link target="_blank" to="mailto:zelanstoreofficial@gmail.com">
            <EmailIcon className="icon" />
          </Link>
        </div>
      </div>
      <div className="container-fluid footer-container">
        <div className="wa-icon-cont">
          <Link target="_blank" to="https://wa.me/919862118985" className="wa-link">
            <div className="wa-icon-text">
              <WhatsAppIcon className="icon" />
              <span className="wa-text">Support</span>
            </div>
          </Link>
        </div>

        <div className="row">
          <div className="col-12 col-sm-12 col-md-3 col-lg-3 mb-4">
            <div className="footer-logo">
              <b>
                ZELAN<span className="ffca00">STORE</span>
              </b>
            </div>
            <span>
              <small>
                Welcome to Zelan Store! Discover in-game currencies for Mobile
                Legends, BGMI, PUBG, Genshin Impact, and more. Enjoy fast,
                reliable service and exceptional customer support.
              </small>
            </span>
            <br />
            <br />
            <p className="m-0 mt-2" style={{ color: `var(--t)` }}>
              SUPPORT
            </p>
            <span>+91 9862118985</span>
            <br />
            <span>zelanstoreofficial@gmail.com</span>
          </div>
          <div className="px-lg-5 quick-links col-6 col-sm-6 col-md-3 col-lg-3 mb-4">
            <h6>Quick Links</h6>
            <hr />
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              {!user && (
                <>
                  <li>
                    <Link to="/login">Login</Link>
                  </li>
                  <li>
                    <Link to="/register">Register</Link>
                  </li>
                </>
              )}
              {user && (
                <>
                  <li>
                    <Link to="/wallet">Wallet</Link>
                  </li>
                  <li>
                    <Link to="/orders">Orders</Link>
                  </li>
                  <li>
                    <Link to="/user-dashboard">Dashboard</Link>
                  </li>
                </>
              )}
              <li>
                <Link to="/support">Customer Support</Link>
              </li>
            </ul>
          </div>
          <div className="quick-links col-6 col-sm-6 col-md-3 col-lg-3 mb-4">
            <h6>Important Pages</h6>
            <hr />
            <ul>
              <li>
                <Link to="/privacy-policy">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/refund-policy">Refund Policy</Link>
              </li>
            </ul>
          </div>
          <div className="quick-links col-12 col-sm-12 col-md-3 col-lg-3 mb-4">
            <h6>Payment Modes</h6>
            <hr />
            <div className="payment-channels">
              <img src={IMAGES.phonepe} alt="" />
              <img src={IMAGES.gpay} alt="" />
              <img src={IMAGES.upi} alt="" />
            </div>
          </div>
          <hr />
          <span className="text-lg-center text-start">
            <small>All Rights Reserved © 2024 | ZELAN STORE</small>
          </span>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Footer;
