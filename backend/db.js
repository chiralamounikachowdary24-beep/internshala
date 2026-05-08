const mongoose = require("mongoose");
require("dotenv").config();

const url = process.env.DATABASE_URL;
let isConnected = false;

module.exports.connect = async () => {
  if (!url) {
    throw new Error("DATABASE_URL is missing in .env");
  }

  await mongoose.connect(url);
  isConnected = true;
  console.log("Database is connected");
};

module.exports.isDatabaseConnected = () => isConnected;
