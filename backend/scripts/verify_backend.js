const mongoose = require("mongoose");
const { connectDB, isDBConnected } = require("../config/db");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

async function verify() {
  console.log("=== STARTING BACKEND VERIFICATION ===");
  await connectDB();

  // Wait 1.5s for connection establishment
  await new Promise((resolve) => setTimeout(resolve, 1500));

  console.log("1. DB Connection state:", isDBConnected() ? "CONNECTED (SUCCESS)" : "FAILED");

  const productModel = require("../models/productModel");
  const products = await productModel.find({ isDeleted: { $ne: true } });
  console.log("2. Total active products count:", products.length);

  const categoryModel = require("../models/categoryModel");
  const categories = await categoryModel.find();
  console.log("3. Total categories count:", categories.length);
  console.log("   Categories list:", categories.map((c) => `"${c.name}"`));

  // Test name matching
  const testName = "MOBILE LEGENDS BANG BANG";
  const found = await productModel.findOne({
    name: { $regex: new RegExp(`^${testName}$`, "i") },
    isDeleted: { $ne: true },
  });
  console.log("4. Sample product query for:", testName, "-> Found:", found ? found.name : "NOT FOUND");

  console.log("=== VERIFICATION COMPLETE ===");
  process.exit(0);
}

verify().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
