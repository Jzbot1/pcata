const mongoose = require("mongoose");
const colors = require("colors");

const connectionOptions = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxPoolSize: 50,
  minPoolSize: 5,
};

let isConnected = false;

const connectDB = async (retryCount = 0) => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, connectionOptions);
    isConnected = true;
    console.log(`Mongodb Connected: ${conn.connection.host}`.bgGreen.white);
  } catch (error) {
    isConnected = false;
    console.error(`Mongodb Connection Error: ${error.message}`.bgRed.white);
    if (retryCount < 5) {
      const waitTime = Math.min(5000 * (retryCount + 1), 30000);
      console.log(`Retrying MongoDB connection in ${waitTime / 1000}s (Attempt ${retryCount + 1}/5)...`.yellow);
      setTimeout(() => connectDB(retryCount + 1), waitTime);
    }
  }
};

mongoose.connection.on("connected", () => {
  isConnected = true;
  console.log("Mongoose connected to DB".green);
});

mongoose.connection.on("error", (err) => {
  isConnected = false;
  console.error(`Mongoose connection error: ${err.message}`.red);
});

mongoose.connection.on("disconnected", () => {
  isConnected = false;
  console.warn("Mongoose connection disconnected. Attempting reconnect...".yellow);
});

const isDBConnected = () => isConnected && mongoose.connection.readyState === 1;

module.exports = {
  connectDB,
  isDBConnected,
};

