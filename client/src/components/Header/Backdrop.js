import React from "react";
import "./Backdrop.css";

const Backdrop = ({ sideMenu, setSideMenu }) => {
  return (
    <div
      className={`backdrop d-block d-md-block d-lg-none ${
        sideMenu ? "bactive" : ""
      }`}
      onClick={() => setSideMenu(!sideMenu)}
    ></div>
  );
};

export default Backdrop;
