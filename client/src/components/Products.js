import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import "./Products.css";

const getImageUrl = (imagePath) => {
  if (!imagePath) return "/logo192.png";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
  const cleanPath = imagePath.replace(/\\/g, "/").replace(/^\/+/, "");
  return `/${cleanPath}`;
};

const norm = (str) => (str || "").toString().trim().toLowerCase();

const Products = ({ title, homeLabel }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState(null);

  const getAllProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/product/get-all-products");
      if (res.data.success && Array.isArray(res.data.data)) {
        setProducts(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("/api/categories");
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchCategories();
    getAllProducts();
  }, []);

  const registeredCategoryNorms = new Set(
    (categories || []).map((c) => norm(c.name))
  );

  const otherProducts = (products || []).filter(
    (p) => !p.category || !registeredCategoryNorms.has(norm(p.category))
  );

  return (
    <div className="products-container">
      {categories &&
        [...categories]
          .sort((a, b) => (Number(a.serialNumber) || 999) - (Number(b.serialNumber) || 999))
          .map((category) => {
            const filteredProducts = products?.filter(
              (product) => norm(product.category) === norm(category.name)
            );

            // If no products belong to this category, don't render it
            if (!filteredProducts || filteredProducts.length === 0) return null;

            return (
              <div key={category._id} className="product-title mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h2 className="category-title-text mb-0">{category.name}</h2>
                  <div
                    className="center gap-1 view-all-link"
                    onClick={() => navigate("/games")}
                    style={{ cursor: "pointer" }}
                  >
                    <SportsEsportsIcon className="icon" />
                    <span>View All</span>
                  </div>
                </div>

                <div className="products">
                  {filteredProducts.map((product, index) => (
                    <div
                      onClick={() => navigate(`/product/${encodeURIComponent(product?.name)}`)}
                      key={product._id || index}
                      className="product p-2 text-start"
                      style={{ cursor: "pointer" }}
                    >
                      <div className={`product-img-cont loading ${loading ? "active" : ""}`}>
                        <img
                          src={getImageUrl(product?.image)}
                          alt={product?.name || "product"}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/logo192.png";
                          }}
                        />
                      </div>
                      <div className="product-name center">
                        <p className="product-card-title mb-0 mt-1">{product?.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

      {otherProducts.length > 0 && (
        <div className="product-title mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="category-title-text mb-0">OTHER POPULAR SERVICES</h2>
            <div
              className="center gap-1 view-all-link"
              onClick={() => navigate("/games")}
              style={{ cursor: "pointer" }}
            >
              <SportsEsportsIcon className="icon" />
              <span>View All</span>
            </div>
          </div>

          <div className="products">
            {otherProducts.map((product, index) => (
              <div
                onClick={() => navigate(`/product/${encodeURIComponent(product?.name)}`)}
                key={product._id || index}
                className="product p-2 text-start"
                style={{ cursor: "pointer" }}
              >
                <div className={`product-img-cont loading ${loading ? "active" : ""}`}>
                  <img
                    src={getImageUrl(product?.image)}
                    alt={product?.name || "product"}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/logo192.png";
                    }}
                  />
                </div>
                <div className="product-name center">
                  <p className="product-card-title mb-0 mt-1">{product?.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;

