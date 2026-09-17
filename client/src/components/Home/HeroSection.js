import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import "./HeroSection.css";
import { useSelector } from "react-redux";

const HeroSection = () => {
  const { banners = [] } = useSelector((state) => state.user) || {};
  const arrowRef = useRef();
  const navigate = useNavigate();

  // Create a shallow copy of banners and sort it by 'seq'
  const sortedBanners = Array.isArray(banners)
    ? [...banners].sort((a, b) => Number(a.seq || 0) - Number(b.seq || 0))
    : [];

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    const normalized = String(imagePath).replace(/\\/g, "/");
    if (/^(https?:\/\/|data:|\/\/)/i.test(normalized)) {
      return normalized;
    }
    if (normalized.startsWith("/")) {
      return `https://zelanstore.com${normalized}`;
    }
    return `https://zelanstore.com/${normalized}`;
  };

  const handleBannerClick = (link) => {
    if (!link) return;
    const trimmed = String(link).trim();
    if (!trimmed || trimmed === "#") return;

    // 1. External URL or protocol-relative (http://, https://, //)
    if (/^(https?:\/\/|\/\/)/i.test(trimmed)) {
      try {
        const parsed = new URL(trimmed.startsWith("//") ? `https:${trimmed}` : trimmed);
        const currentHost = window.location.hostname.toLowerCase();
        const targetHost = parsed.hostname.toLowerCase();

        // If domain is zelanstore.com or matches current host, navigate internally
        if (
          targetHost === currentHost ||
          targetHost === "zelanstore.com" ||
          targetHost === "www.zelanstore.com"
        ) {
          const path = parsed.pathname + parsed.search + parsed.hash;
          navigate(path || "/");
          return;
        }
      } catch (err) {
        console.error("URL parsing error:", err);
      }
      window.open(trimmed, "_blank", "noopener,noreferrer");
      return;
    }

    // 2. Domain without protocol (e.g. zelanstore.com/collection or instagram.com/zelan)
    if (/^(www\.|([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})/i.test(trimmed) && !trimmed.startsWith("/")) {
      if (
        trimmed.startsWith("zelanstore.com") ||
        trimmed.startsWith("www.zelanstore.com")
      ) {
        const path = trimmed.replace(/^(www\.)?zelanstore\.com/i, "");
        navigate(path.startsWith("/") ? path : `/${path}`);
        return;
      }
      window.open(`https://${trimmed}`, "_blank", "noopener,noreferrer");
      return;
    }

    // 3. Internal path (e.g. /all-products, category/xyz, product-details/123)
    const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    navigate(cleanPath);
  };

  const settings = {
    dots: false,
    slidesToShow: 3,
    slidesToScroll: 3,
    initialSlide: 0,
    className: "center",
    centerMode: true,
    infinite: true,
    centerPadding: "0px",
    autoplay: false,
    speed: 500,
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
        <div
          className="single-banner-wrapper"
          onClick={() => handleBannerClick(sortedBanners[0]?.link)}
          style={{ cursor: sortedBanners[0]?.link ? "pointer" : "default" }}
          role={sortedBanners[0]?.link ? "button" : undefined}
          tabIndex={sortedBanners[0]?.link ? 0 : undefined}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleBannerClick(sortedBanners[0]?.link);
            }
          }}
        >
          <div className="banner-content">
            <img
              className="d-block w-100 banner-img single-banner-img"
              src={getImageUrl(sortedBanners[0]?.image)}
              alt={sortedBanners[0]?.title || "banner"}
            />
            {sortedBanners[0]?.title && (
              <h3 className="banner-title">{sortedBanners[0]?.title}</h3>
            )}
            {sortedBanners[0]?.heading && (
              <p className="banner-heading">{sortedBanners[0]?.heading}</p>
            )}
          </div>
        </div>
      )}

      {sortedBanners?.length > 1 && (
        <Slider ref={arrowRef} {...settings}>
          {sortedBanners?.map((item, index) => (
            <div className="p-2" key={item._id || index}>
              <div
                className="banner-link"
                onClick={() => handleBannerClick(item?.link)}
                style={{ cursor: item?.link ? "pointer" : "default" }}
                role={item?.link ? "button" : undefined}
                tabIndex={item?.link ? 0 : undefined}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleBannerClick(item?.link);
                  }
                }}
              >
                <div className="banner-content">
                  <img
                    src={getImageUrl(item?.image)}
                    className="d-block w-100 banner-img"
                    alt={item?.title || "banner"}
                  />
                  {item?.title && (
                    <h3 className="banner-title">{item?.title}</h3>
                  )}
                  {item?.heading && (
                    <p className="banner-heading">{item?.heading}</p>
                  )}
                </div>
              </div>
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
