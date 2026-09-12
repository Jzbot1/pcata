import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import "./Games.css";
import Slider from "react-slick";

const Games = ({ title }) => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [slider, setSlider] = useState("Mobile Games");
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const getAllProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/product/get-all-products");
      if (res.data.success) {
        setProducts(res.data.data);
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    getAllProducts();
  }, []);

  var settings = {
    dots: false,
    className: "center",
    infinite: false,
    centerMode: false, // Ensures single slides are not centered
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
              <div className="game-cont">
                <div
                  key={index}
                  className="game"
                  onClick={() => navigate(`/product/${item?.name}`)}
                >
                  <img
                    src={`https://divinestoreorig/${item?.image}`}
                    alt="pro-img"
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
            <div className="game-cont">
              <div
                key={index}
                className="game"
                onClick={() => navigate(`/product/${item?.name}`)}
              >
                <img
                  src={`https://divinestoreorig/${item?.image}`}
                  alt="pro-img"
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
      {renderCategory(slider, 10)}

      <div className="game-filter-tabs promo-filter-tabs mt-3">
        <button
          onClick={() => setFilter("All")}
          className={`${filter === "All" && "active"}`}
        >
          ALL
        </button>
        <button
          onClick={() => setFilter("Mobile Games")}
          className={`${filter === "Mobile Games" && "active"}`}
        >
          MOBILE GAMES
        </button>
        <button
          onClick={() => setFilter("PC Games")}
          className={`${filter === "PC Games" && "active"}`}
        >
          PC GAMES
        </button>
        <button
          onClick={() => setFilter("Games Vouchers")}
          className={`${filter === "Games Vouchers" && "active"}`}
        >
          GAMES VOUCHERS
        </button>
        <button
          onClick={() => setFilter("Social Media Services")}
          className={`${filter === "Social Media Services" && "active"}`}
        >
          SOCIAL MEDIA
        </button>
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
            if (filter !== "All" && item.category !== filter) {
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
              <div className="game-cont">
                <div
                  key={index}
                  className="game"
                  onClick={() => navigate(`/product/${item?.name}`)}
                >
                  <img
                    src={`https://divinestoreorig/${item?.image}`}
                    alt="pro-img"
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
