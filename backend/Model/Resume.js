const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema({
  userEmail: String,
  name: String,
  email: String,
  phone: String,
  qualification: String,
  experience: String,
  personalDetails: String,
  skills: String,
  photo: String,
  paymentId: String,
  orderId: String,
  amount: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Resume", ResumeSchema);
