import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Games.css";
import Slider from "react-slick";

const getImageUrl = (imagePath) => {
  if (!imagePath) return "/logo192.png";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
  const cleanPath = imagePath.replace(/\\/g, "/").replace(/^\/+/, "");
  return `/${cleanPath}`;
};

const norm = (str) => (str || "").toString().trim().toLowerCase();

const Games = ({ title }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [slider, setSlider] = useState("Mobile Games");
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const getAllProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/product/get-all-products");
      if (res.data.success && Array.isArray(res.data.data)) {
        setProducts(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching products in Games component:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllProducts();
  }, []);

  const settings = {
    dots: false,
    className: "center",
    infinite: false,
    centerMode: false,
    centerPadding: "60px",
    slidesToShow: 6,
    swipeToSlide: true,
    responsive: [
      {
        breakpoint: 1025,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4,
          infinite: true,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          dots: false,
        },
      },
    ],
  };

  const renderCategory = () => {
    return (
      <div className="popular-games">
        <div className="titlee">
          <div>
            <span>ALL</span>
            <h2>Now Trending</h2>
          </div>
          <span
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/games")}
          >
            View More
          </span>
        </div>
        <div className="d-none d-md-block d-lg-block">
          <Slider {...settings}>
            {products?.map((item, index) => (
              <div className="game-cont" key={item._id || index}>
                <div
                  className="game"
                  onClick={() => navigate(`/product/${encodeURIComponent(item?.name)}`)}
                >
                  <img
                    src={getImageUrl(item?.image)}
                    alt={item?.name || "product"}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/logo192.png";
                    }}
                  />
                  <div className="m-0 text-center">
                    <span>{item?.category}</span>
                    <h5 className="m-0">{item?.name}</h5>
                  </div>
                  <button className="buy-now">Topup</button>
                </div>
              </div>
            ))}
          </Slider>
        </div>
        <div className="mobile-game-cont d-block d-flex d-md-none d-lg-none">
          {products?.map((item, index) => (
            <div className="game-cont" key={item._id || index}>
              <div
                className="game"
                onClick={() => navigate(`/product/${encodeURIComponent(item?.name)}`)}
              >
                <img
                  src={getImageUrl(item?.image)}
                  alt={item?.name || "product"}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/logo192.png";
                  }}
                />
                <div className="m-0 text-center">
                  <span>{item?.category}</span>
                  <h5 className="m-0">{item?.name}</h5>
                </div>
                <button className="buy-now">Topup</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="explore-products-container">
      {renderCategory()}

      <div className="game-filter-tabs promo-filter-tabs mt-3">
        {["All", "Mobile Games", "PC Games", "Games Vouchers", "Social Media Services"].map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={filter === tab ? "active" : ""}
            >
              {tab.toUpperCase()}
            </button>
          )
        )}
      </div>

      <div className="game-search w-100 d-block d-lg-none">
        <input
          type="text"
          placeholder="Search Games"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className="game-container">
        {products
          ?.filter((item) => {
            if (filter !== "All" && norm(item.category) !== norm(filter)) {
              return false;
            }
            if (
              searchTerm &&
              !item?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase())
            ) {
              return false;
            }
            return true;
          })
          ?.map((item, index) => {
            return (
              <div className="game-cont" key={item._id || index}>
                <div
                  className="game"
                  onClick={() => navigate(`/product/${encodeURIComponent(item?.name)}`)}
                >
                  <img
                    src={getImageUrl(item?.image)}
                    alt={item?.name || "product"}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/logo192.png";
                    }}
                  />
                  <div className="m-0 text-center">
                    <span>{item?.category}</span>
                    <h5 className="m-0">{item?.name}</h5>
                  </div>
                  <button className="buy-now">Topup</button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Games;

