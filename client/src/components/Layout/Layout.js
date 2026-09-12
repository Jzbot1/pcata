import React, { useEffect } from "react";
import "./Layout.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { useLocation } from "react-router-dom";

const Layout = ({ children }) => {
  const { pathname } = useLocation();
  const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
      window.scrollTo(0, 0);
      // eslint-disable-next-line
    }, [pathname]);

    return null;
  };
  ScrollToTop();
  return (
    <React.Fragment>
      <Header />
      <div className="body">{children}</div>
      <Footer />
    </React.Fragment>
  );
};

export default Layout;
