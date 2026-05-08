const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  userId: String,
  email: String,
  name: String,
  browser: String,
  browserVersion: String,
  os: String,
  osVersion: String,
  device: String,
  deviceVendor: String,
  deviceModel: String,
  systemType: String,
  ip: String,
  status: {
    type: String,
    enum: ["success", "pending_otp", "blocked", "failed"],
    default: "success",
  },
  reason: String,
  otpVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("LoginHistory", schema);
