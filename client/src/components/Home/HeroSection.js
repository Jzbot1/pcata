import React, { useRef } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import "./HeroSection.css";
import { useSelector } from "react-redux";

const HeroSection = () => {
  const { banners = [] } = useSelector((state) => state.user) || {}; 
  const arrowRef = useRef();

  // Create a shallow copy of banners and sort it by 'seq'
  // Ensure banners is an array before sorting
  const sortedBanners = Array.isArray(banners) ? [...banners].sort((a, b) => a.seq - b.seq) : [];

  const settings = {
    dots: false,
    slidesToShow: 3,
    slidesToScroll: 3,
    initialSlide: 0,
    className: "center",
    centerMode: true,
    infinite: true,
    centerPadding: "0px",
    autoplay: false, // Disabled autoplay
    speed: 500, // Slower speed for slide transition
    cssEase: "linear",
    nextArrow: false,
    prevArrow: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          dots: true,
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          dots: true,
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="container-fluid hero-container">
      {sortedBanners?.length === 1 && (
        <img className="bannerimg" src={sortedBanners[0]?.image} alt="banner" />
      )}
      {sortedBanners?.length > 1 && (
        <Slider ref={arrowRef} {...settings}>
          {sortedBanners?.map((item, index) => (
            <div className="p-2" key={index}>
              <Link to={item?.link} target="_blank" className="banner-link">
                <div className="banner-content">
                  <img
                    src={`https://zelanstore.com/${item.image}`}
                    className="d-block w-100 banner-img"
                    alt="banners"
                  />
                  {item?.title && <h3 className="banner-title">{item?.title}</h3>}
                  {item?.heading && <p className="banner-heading">{item?.heading}</p>}
                </div>
              </Link>
            </div>
          ))}
        </Slider>
      )}

      {sortedBanners?.length > 1 && (
        <div className="hero-slider-btns">
          <div onClick={() => arrowRef.current.slickPrev()}>
            <KeyboardArrowLeftIcon className="icon arrow-left" />
          </div>
          <div onClick={() => arrowRef.current.slickNext()}>
            <KeyboardArrowRightIcon className="icon arrow-right" />
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroSection;
