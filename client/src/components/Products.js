import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import "./Products.css";
import { useSelector } from "react-redux";

const Products = ({ title, homeLabel }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState(null);
  const { user } = useSelector((state) => state.user);

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

  const fetchCategories = async () => {
    try {
    const { data } = await axios.get("/api/categories", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
    setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
    setCategories([]); // Ensure it remains an array
    }
  };

  useEffect(() => {
    fetchCategories();
    getAllProducts();
  }, []);

  return (
    <div className="products-container">
      {categories &&
        [...categories]
          .sort((a, b) => a.serialNumber - b.serialNumber) // Sort by serialNumber
          .map((category) => {
            const filteredProducts = products?.filter((product) => product.category === category.name);

            // If no products belong to this category, don't render it
            if (filteredProducts?.length === 0) return null;

            return (
              <div key={category._id} className="product-title">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h2 className="text-light mb-0">{category.name}</h2> {/* Show category name */}
                  <div className="center gap-1" onClick={()=>{navigate("/games")}}>
                    <SportsEsportsIcon className="text-light icon" />
                    <span className="text-light">View All</span>
                  </div>
                </div>
                
                <div className="products">
                  {filteredProducts?.map((product, index) => (
                    <div
                      onClick={() => navigate(`/product/${product?.name}`)}
                      key={index}
                      className="product p-2 text-start"
                    >
                      <div className={`product-img-cont loading ${loading && "active"}`}>
                        <img src={`https://zelanstore.com/${product?.image}`} alt={product?.name} />
                      </div>
                      <div className="product-name center">
                        <p className="text-light mb-0 mt-1">{product?.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
    </div>
  );
};

export default Products;
