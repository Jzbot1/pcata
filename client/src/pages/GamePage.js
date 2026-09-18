import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import axios from "axios";
import "../components/Products.css";
import "./GamePage.css";

const getImageUrl = (imagePath) => {
  if (!imagePath) return "/logo192.png";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
  const cleanPath = imagePath.replace(/\\/g, "/").replace(/^\/+/, "");
  return `/${cleanPath}`;
};

const GamePage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [games, setGames] = useState(null);
  const [loading, setLoading] = useState(false);

  const getAllProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/product/get-all-products");
      if (res.data.success && Array.isArray(res.data.data)) {
        setGames(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching games in GamePage:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllProducts();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <Layout>
      <div className="game-page-container">
        <h4>Search Games</h4>
        <div className="game-search">
          <input
            type="text"
            placeholder="Search for games..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="game-container mobile-game-cont">
          {games
            ?.filter((item) => {
              if (
                searchTerm &&
                !item?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase())
              ) {
                return false;
              }
              return true;
            })
            ?.map((product, index) => {
              return (
                <div
                  onClick={() => navigate(`/product/${encodeURIComponent(product?.name)}`)}
                  key={product._id || index}
                  className="game-page-container-product text-start"
                  style={{ cursor: "pointer" }}
                >
                  <div
                    className={`product-img-cont loading ${
                      loading ? "active" : ""
                    }`}
                  >
                    <img
                      src={getImageUrl(product?.image)}
                      alt={product?.name || "product"}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/logo192.png";
                      }}
                    />
                  </div>
                  <div className="product-name">
                    <p>{product?.name}</p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </Layout>
  );
};

export default GamePage;

