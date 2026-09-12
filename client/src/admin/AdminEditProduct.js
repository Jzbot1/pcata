import React, { useEffect, useRef, useState } from "react";
import AdminLayout from "./components/AdminLayout";
import "./AdminUsers.css";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./AdminAddProduct.css";
import { message } from "antd";

const AdminEditProduct = () => {
  const params = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [moogold, setMoogold] = useState(null);
  const [servers, setServers] = useState(null);
  const [categories, setCategories] = useState(null);
  const [yokcash, setYokcash] = useState(null);

  const [form, setForm] = useState({
    name: "",
    desc: "",
    descTwo: "",
    api: "",
    category: "",
    apiName: "",
    gameName: "",
    stock: "",
    region: "",
    fields: "",
    tagOne: "",
    tagTwo: "",
    playerCheckBtn: "",
  });

  const [cost, setCost] = useState([
    {
      id: "",
      amount: "",
      amountData: "",
      price: "",
      fakePrice: "",
      pimg: "",
      resPrice: "",
    },
  ]);

  const handleAddCostField = (index) => {
    const updatedCost = [...cost];
    updatedCost.splice(index + 1, 0, {
      id: "",
      amount: "",
      amountData: "",
      price: "",
      fakePrice: "",
      pimg: "",
      resPrice: "",
    });
    setCost(updatedCost);
  };
  const handleRemoveCostField = (index) => {
    const updatedCost = [...cost];
    updatedCost.splice(index, 1);
    setCost(updatedCost);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "image") {
      setForm({ ...form, [name]: e.target.files });
    } else if (
      name.startsWith("id") ||
      name.startsWith("amount") ||
      name.startsWith("packData") ||
      name.startsWith("price") ||
      name.startsWith("fakePrice") ||
      name.startsWith("pimg") ||
      name.startsWith("resPrice")
    ) {
      const index = parseInt(name.split("-")[1]);
      const updatedCost = [...cost];
      const property = name.startsWith("amount")
        ? "amount"
        : name.startsWith("packData")
        ? "packData"
        : name.startsWith("price")
        ? "price"
        : name.startsWith("fakePrice")
        ? "fakePrice"
        : name.startsWith("pimg")
        ? "pimg"
        : name.startsWith("resPrice")
        ? "resPrice"
        : "id";
      updatedCost[index][property] = value;
      setCost(updatedCost);
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpdateProduct = async () => {
    const formData = new FormData();
    formData.append("id", form?._id);
    formData.append("name", form?.name);
    formData.append("api", form?.api);
    formData.append("apiName", form?.apiName);
    formData.append("category", form?.category);
    formData.append("gameName", form?.gameName);
    formData.append("region", form?.region);
    formData.append("fields", form?.fields);
    formData.append("tagOne", form?.tagOne);
    formData.append("tagTwo", form?.tagTwo);
    formData.append("playerCheckBtn", form?.playerCheckBtn);
    formData.append("stock", form?.stock);
    formData.append("desc", form?.desc);
    formData.append("descTwo", form?.descTwo);
    formData.append("image", selectedFile);
    // Append cost array elements individually
    cost.forEach((costItem, index) => {
      formData.append(`cost[${index}][id]`, costItem.id);
      formData.append(`cost[${index}][amount]`, costItem.amount);
      formData.append(`cost[${index}][packData]`, costItem.packData);
      formData.append(`cost[${index}][price]`, costItem.price);
      formData.append(`cost[${index}][fakePrice]`, costItem.fakePrice);
      formData.append(`cost[${index}][pimg]`, costItem.pimg);
      formData.append(`cost[${index}][resPrice]`, costItem.resPrice);
    });

    setLoading(true);

    try {
      const res = await axios.post("/api/product/update-product", formData, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        message.success(res.data.message);
        setLoading(false);
        navigate("/admin-products");
      } else {
        setLoading(false);
        message.error(res.data.message);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error uploading files:", error);
    }
  };

  const getProduct = async () => {
    try {
      const res = await axios.post("/api/product/get-product", {
        id: params.id,
      });
      if (res.data.success) {
        setForm(res.data.data);
        setCost(res.data.data.cost);
        setSelectedFile(res.data.data.image);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCategories = async () => {
    try {
    const { data } = await axios.get("/api/categories");
    setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
    message.error("Error fetching categories");
    setCategories([]); // Ensure it remains an array
    }
  };

  useEffect(() => {
    fetchCategories();
    getProduct();
  }, []);

  const getMobileLegendGame = async () => {
    try {
      const res = await axios.post(
        "/api/product/get-mobile-legend",
        { region: form?.region },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      if (res.data.success) {
        setData(res.data.data.product);
      } else {
        message.error("Api Error, Try after sometime");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (form?.region !== "") {
      getMobileLegendGame();
    }
  }, [form?.region]);

  const fetchYokcashServices = async () => {
    try {
      const res = await axios.post("/api/yok/get-yokcash", {
        gameName: form?.gameName,
      });
      if (res.data.success) {
        setYokcash(res.data.data);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchMoogoldServices = async () => {
    try {
      const res = await axios.post("/api/moogold/moogold-product", {
        product_id: form?.gameName,
      });
      if (res.data.success) {
        setMoogold(res.data.data.Variation);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchMoogoldServers = async () => {
    try {
      const res = await axios.post("/api/moogold/moogold-servers", {
        product_id: form?.gameName,
      });
      if (res.data.success) {
        setServers(res.data.data);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  useEffect(() => {
    if (form?.apiName === "yokcash" && form?.gameName !== "") {
      fetchYokcashServices();
    } else if (form?.apiName === "moogold" && form?.gameName !== "") {
      fetchMoogoldServices();
      fetchMoogoldServers();
    }
  }, [form?.gameName]);

  return (
    <AdminLayout>
      <div className="admin-users-container">
        <div className="page-title">
          <h3 className="m-0">Edit Product</h3>
        </div>
        <hr />
        <div className="add-product-container">
          <div className="form-fields mb-3">
            <input
              className="w-100"
              aria-label="Select Image"
              type="file"
              accept=".jpg, .jpeg, .png, .webp"
              name="image"
              required
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>
          <div className="form-fields mb-3">
            <input
              className="w-100"
              name="name"
              onChange={handleChange}
              value={form?.name}
              type="text"
              placeholder="Enter name"
            />
          </div>
          <select  
            onChange={handleChange}
            value={form?.category}
            name="category"
            className="w-100 form-control border-dark border mb-4"
          >
            <option value="">Select Category</option>
            {categories && categories.map((data) => (
              <option key={data._id} value={data.name}>{data.name}</option>
            ))}
          </select>
          <div className="form-fields mb-3">
            <textarea
              style={{ border: "1px solid #000" }}
              name="desc"
              cols="30"
              rows="3"
              placeholder="Description"
              className="form-control"
              onChange={handleChange}
              value={form?.desc}
            ></textarea>
          </div>
          {/* <div className="form-fields mb-3">
            <textarea
              style={{ border: "1px solid #000" }}
              name="descTwo"
              cols="30"
              rows="3"
              placeholder="Description"
              className="form-control"
              onChange={handleChange}
              value={form?.descTwo}
            ></textarea>
          </div> */}

          {/* <div className="form-fields mb-3">
            <select
              onChange={handleChange}
              value={form?.category}
              name="category"
              className="w-100"
            >
              <option value="">Select Category</option>
              <option value="Mobile Games">Mobile Games</option>
              <option value="PC Games">PC Games</option>
              <option value="Games Vouchers">Games Vouchers</option>
              <option value="Social Media Services">
                Social Media Services
              </option>
              <option value="Other">Other</option>
            </select>
          </div> */}
          <div className="form-fields mb-3">
            <select
              onChange={handleChange}
              value={form?.stock}
              name="stock"
              className="w-100"
            >
              <option value="">Stock</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div className="form-fields mb-3">
            <select
              onChange={handleChange}
              value={form?.api}
              name="api"
              className="w-100"
            >
              <option value="">API BASED?</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          {form?.api === "yes" && (
            <div className="form-fields mb-3">
              <select
                onChange={handleChange}
                value={form?.apiName}
                name="apiName"
                className="w-100"
              >
                <option value="">Select API</option>
                <option value="smileOne">Smile One Api</option>
                <option value="moogold">Moogold</option>
                <option value="yokcash">Yokcash</option>
              </select>
            </div>
          )}
          {form?.api === "yes" && form?.apiName === "moogold" && (
            <div className="form-fields mb-3">
              <select
                onChange={handleChange}
                value={form?.gameName}
                name="gameName"
                className="w-100"
              >
                <option value="">Select Game</option>
                <option value="15145">Mobile Legends</option>
                <option value="2362359">Mobile Legends (Indonesia)</option>
                <option value="8996566">Mobile Legends (Singapore)</option>
                <option value="6637539">Mobile Legends (Russia)</option>
                <option value="428075">Genshin Impact</option>
                <option value="4233885">Honkai: Star Rail</option>
                <option value="6963">PUBG Mobile (Global)</option>
                <option value="5177311">Honor of Kings</option>
                <option value="9477186">Zenless Zone Zero</option>
                <option value="8582211">Wuthering Waves</option>
                <option value="11563195">Magic Chess: Go Go</option>
                <option value="8957885">Love and Deepspace</option>
                <option value="4690648">MLBB (Malaysia)</option>
                <option value="5846232">MLBB (Brazil)</option>
                <option value="8957883">MLBB (Philippines)</option>
                <option value="4427071">Clash of Clans</option>
                <option value="4427072">Clash Royale</option>
                <option value="4427073">Brawl Stars</option>
                <option value="4514780">FC Mobile</option>
                <option value="15226">Bigo Live</option>
              </select>
            </div>
          )}
          {form?.api === "yes" && form?.apiName === "yokcash" && (
            <div className="form-fields mb-3">
              <select
                onChange={handleChange}
                value={form?.gameName}
                name="gameName"
                className="w-100"
              >
                <option value="">Select Game</option>
                <option value="MLBB">ML Region Luar</option>
                <option value="Mobile Legends">Mobile Legends</option>
                <option value="Honor Of Kings">Honor Of Kings</option>
                <option value="Honkai Star Rail">Honkai Star Rail</option>
                <option value="PUBG Mobile">PUBG Mobile</option>
                <option value="Genshin Impact">Genshin Impact</option>
              </select>
            </div>
          )}
          {form?.api === "yes" && form?.apiName === "smileOne" && (
            <div className="form-fields mb-3">
              <select
                onChange={handleChange}
                value={form?.region}
                name="region"
                className="w-100"
              >
                <option value="">Select Region</option>
                <option value="brazil">Brazil</option>
                <option value="philippines">Philippines</option>
              </select>
            </div>
          )}
          {cost &&
            cost?.map((item, index) => (
              <div className="d-flex form-fields mb-3" key={index}>
                <input
                  className="w-100"
                  name={`id-${index}`}
                  onChange={handleChange}
                  value={cost[index]?.id || ""}
                  type="text"
                  placeholder="Enter id"
                />
                <input
                  className="w-100"
                  name={`amount-${index}`}
                  onChange={handleChange}
                  value={cost[index]?.amount || ""}
                  type="text"
                  placeholder="Enter Amount"
                />
                <input
                  className="w-100"
                  name={`packData-${index}`}
                  onChange={handleChange}
                  value={cost[index]?.packData || ""}
                  type="text"
                  placeholder="Enter Pack Data"
                />
                <input
                  className="w-100"
                  name={`price-${index}`}
                  onChange={handleChange}
                  value={cost[index]?.price || ""}
                  type="text"
                  placeholder="Enter Price"
                />
                <input
                  className="w-100"
                  name={`fakePrice-${index}`}
                  onChange={handleChange}
                  value={cost[index]?.fakePrice || ""}
                  type="text"
                  placeholder="Enter Fake Price"
                />
                <input
                  className="w-100"
                  name={`resPrice-${index}`}
                  onChange={handleChange}
                  value={cost[index]?.resPrice || ""}
                  type="text"
                  placeholder="Enter Reseller Price"
                />
                <input
                  className="w-100"
                  name={`pimg-${index}`}
                  onChange={handleChange}
                  value={cost[index]?.pimg || ""}
                  type="text"
                  placeholder="Enter image link"
                />
                <button onClick={() => handleAddCostField(index)}>+</button>
                {index > 0 && (
                  <button onClick={() => handleRemoveCostField(index)}>
                    -
                  </button>
                )}
              </div>
            ))}

          <div className="form-fields mb-3">
            <select
              onChange={handleChange}
              value={form?.fields}
              name="fields"
              className="w-100"
            >
              <option value="">Fields</option>
              <option value="1">1 (USER ID/PlayerId/Link)</option>
              <option value="2">2 (USERID ZONEID)</option>
              <option value="3">3 (USERID AND SELECT SERVER)</option>
            </select>
          </div>

          {(form?.fields === "1" ||
            form?.fields === "2" ||
            form?.fields === "3") && (
            <div className="form-fields mb-3">
              <input
                className="w-100"
                name="tagOne"
                onChange={handleChange}
                value={form?.tagOne}
                type="text"
                placeholder="Enter Tag One"
              />
            </div>
          )}
          {(form?.fields === "2" || form?.fields === "3") && (
            <div className="form-fields mb-3">
              <input
                className="w-100"
                name="tagTwo"
                onChange={handleChange}
                value={form?.tagTwo}
                type="text"
                placeholder="Enter Tag Two"
              />
            </div>
          )}

          <div className="form-fields mb-3">
            <select
              onChange={handleChange}
              value={form?.playerCheckBtn}
              name="playerCheckBtn"
              className="w-100"
            >
              <option value="">Player Check Btn</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <button className="w-100 py-3" onClick={handleUpdateProduct}>
            Update Product
          </button>
        </div>
      </div>
      {form?.apiName === "smileOne" && data && (
        <table className="table mt-5 bg-white text-dark">
          <thead>
            <tr>
              <th>ID</th>
              <th>SPU</th>
              <th>PRICE</th>
              <th>COST PRICE</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((item, index) => {
              return (
                <tr>
                  <td>{item?.id}</td>
                  <td>{item.spu}</td>
                  <td>{item.price}</td>
                  <td>{item.cost_price}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {form?.apiName === "moogold" && moogold && (
        <table className="table mt-5 bg-white text-dark">
          <thead>
            <tr>
              <th>ID</th>
              <th>NAME</th>
              <th>PRICE</th>
            </tr>
          </thead>
          <tbody>
            {moogold &&
              moogold?.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>{item.variation_id}</td>
                    <td>{item?.variation_name}</td>
                    <td>{item.variation_price}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      )}
      {form?.apiName === "yokcash" && yokcash && (
        <table className="table mt-5 bg-white text-dark">
          <thead>
            <tr>
              <th>Product Id</th>
              <th>Name</th>
              <th>Category</th>
              <th>price_pro</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {yokcash?.map((item, index) => {
              return (
                <tr key={index}>
                  <td>{item?.id}</td>
                  <td>{item?.nama_layanan}</td>
                  <td>{item?.kategori}</td>
                  <td>{item?.harga_pro}</td>
                  <td>{item?.status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
};

export default AdminEditProduct;
