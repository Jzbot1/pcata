import React, { useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";
import HeroSection from "../components/Home/HeroSection";
import SliderText from "../components/Home/SliderText";
import Products from "../components/Products";
import axios from "axios";
import "./Home.css";
import HomeButtons from "./HomeButtons";

const Home = () => {
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "Are you sure you want quit?";
      localStorage.setItem("giveaway", "true");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <Layout>
      <div className="main-home-container">
        <HeroSection />
        <SliderText
          text={"ZELAN STORE"}
          direction={"left"}
          bg={"var(--bg)"}
          fs={16}
        />
        <HomeButtons />
        <Products title={"Trending Games"} />
      </div>
    </Layout>
  );
};

export default Home;
