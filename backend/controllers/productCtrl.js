const productModel = require("../models/productModel");
const mongoose = require("mongoose");
const fs = require("fs");
const axios = require("axios");
const querystring = require("querystring");
const md5 = require("md5");

const addProductController = async (req, res) => {
  try {
    const {
      name,
      cost,
      api,
      category,
      apiName,
      gameName,
      region,
      fields,
      tagOne,
      tagTwo,
      desc,
      descTwo,
      stock,
      playerCheckBtn,
    } = req.body;
    // Parse the cost field as JSON
    const parsedCost = JSON.parse(cost);
    let product = await productModel.findOne({ name });
    if (product) {
      return res.status(200).send({
        success: false,
        message: "Product with this name already exists",
      });
    }
    // Create a new product if it doesn't exist
    product = new productModel({
      name,
      api,
      category,
      apiName,
      gameName,
      region,
      fields,
      tagOne,
      tagTwo,
      stock,
      desc,
      descTwo,
      playerCheckBtn,
      cost: parsedCost,
      image: req.file.path,
    });
    await product.save();

    return res.status(200).send({
      message: "Product added successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
};

const updateProductController = async (req, res) => {
  try {
    const {
      id,
      name,
      desc,
      descTwo,
      api,
      category,
      apiName,
      gameName,
      fields,
      tagOne,
      tagTwo,
      stock,
      region,
      cost,
      playerCheckBtn,
    } = req.body;

    const product = await productModel.findOne({ _id: id });
    if (!product) {
      return res
        .status(201)
        .send({ success: false, message: "No product found" });
    }

    const updatedFields = {
      name,
      desc,
      descTwo,
      api,
      category,
      apiName,
      gameName,
      region,
      cost,
      stock,
      fields,
      tagOne,
      tagTwo,
      playerCheckBtn,
    };

    if (req.file) {
      updatedFields.image = req.file.path;
    }

    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      updatedFields,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Error updating product. Please try again later.",
    });
  }
};

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getAllProductsController = async (req, res) => {
  try {
    const allProducts = await productModel.find({ isDeleted: { $ne: true } });
    return res.status(200).send({
      success: true,
      message: "Products Fetched Success",
      data: allProducts || [],
    });
  } catch (error) {
    console.error("Error in getAllProductsController:", error);
    res.status(500).send({
      success: false,
      message: `Get All Products Controller ${error.message}`,
    });
  }
};

const getProductController = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ success: false, message: "Invalid product ID" });
    }
    const product = await productModel.findById(id);
    if (!product || product.isDeleted) {
      return res
        .status(404)
        .send({ success: false, message: "No Product Found" });
    }
    res.status(200).send({
      success: true,
      message: "Product Fetched Success",
      data: product,
    });
  } catch (error) {
    console.error("Error in getProductController:", error);
    res.status(500).send({
      success: false,
      message: `Get Product Controller ${error.message}`,
    });
  }
};

const deleteProductController = async (req, res) => {
  try {
    const { id, image } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ success: false, message: "Invalid product ID" });
    }

    const product = await productModel.findById(id);
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "No product found",
      });
    }

    const deleteProduct = await productModel.findByIdAndDelete(id);
    if (!deleteProduct) {
      return res.status(500).send({
        success: false,
        message: "Error deleting product. Please try again later.",
      });
    }

    // Safely attempt file removal if path is within project upload dirs
    if (image && typeof image === "string") {
      const normalizedPath = image.replace(/\\/g, "/");
      if (!normalizedPath.includes("..")) {
        const fullPath = path.join(process.cwd(), normalizedPath);
        if (fs.existsSync(fullPath)) {
          try {
            fs.unlinkSync(fullPath);
          } catch (unlinkErr) {
            console.warn("Could not remove product image file:", unlinkErr.message);
          }
        }
      }
    }

    return res
      .status(200)
      .send({ success: true, message: "Product Deleted Successful" });
  } catch (error) {
    console.error("Error in deleteProductController:", error);
    res.status(500).send({
      message: `Delete Product Ctrl ${error.message}`,
      success: false,
    });
  }
};

const getProductByNameController = async (req, res) => {
  try {
    const rawName = (req.body.name || "").toString().trim();
    if (!rawName) {
      return res.status(400).send({
        success: false,
        message: "Product name is required",
      });
    }

    // Exact or case-insensitive matching
    let product = await productModel.findOne({
      name: { $regex: new RegExp(`^${escapeRegex(rawName)}$`, "i") },
      isDeleted: { $ne: true },
    });

    if (!product) {
      // Fallback partial search if exact match not found
      product = await productModel.findOne({
        name: { $regex: new RegExp(escapeRegex(rawName), "i") },
        isDeleted: { $ne: true },
      });
    }

    if (!product) {
      return res.status(200).send({
        success: false,
        message: "No Product Found",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Product Fetched Success",
      data: product,
    });
  } catch (error) {
    console.error("Error in getProductByNameController:", error);
    res.status(500).send({
      message: `Product By Name Ctrl ${error.message}`,
      success: false,
    });
  }
};

const getMobileLegendGameController = async (req, res) => {
  try {
    const { region } = req.body;
    const uid = process.env.UID;
    const email = process.env.EMAIL;
    const product = "mobilelegends";
    const time = Math.floor(Date.now() / 1000);
    const mKey = process.env.KEY;
    // GENERATING SIGN
    const signArr = {
      uid,
      email,
      product,
      time,
    };
    const sortedSignArr = Object.fromEntries(Object.entries(signArr).sort());
    const str =
      Object.keys(sortedSignArr)
        .map((key) => `${key}=${sortedSignArr[key]}`)
        .join("&") +
      "&" +
      mKey;
    const sign = md5(md5(str));
    const formData = querystring.stringify({
      uid,
      email,
      product,
      time,
      sign,
    });
    let apiUrl =
      region === "brazil"
        ? "https://www.smile.one/br/smilecoin/api/productlist"
        : "https://www.smile.one/ph/smilecoin/api/productlist";
    let apiProduct;
    apiProduct = await axios.post(apiUrl, formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    if (apiProduct.data.status === 200) {
      return res.status(200).send({
        success: true,
        message: "success",
        data: apiProduct.data.data,
      });
    } else {
      console.log("Failed:", apiProduct.data.message);
    }
  } catch (smileOneError) {
    console.error("Error during Smile One order creation:", smileOneError);
    res.status(500).json({ error: "Error during Smile One order creation" });
  }
};

module.exports = {
  addProductController,
  getAllProductsController,
  getProductController,
  updateProductController,
  deleteProductController,
  getProductByNameController,
  getMobileLegendGameController
};
