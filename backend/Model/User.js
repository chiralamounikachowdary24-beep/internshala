const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  phoneNumber: String,
  phone: String,
  plan: {
    type: String,
    enum: ["free", "bronze", "silver", "gold"],
    default: "free"
  },
  friends: [String],
  subscription: Object,
  lastPasswordReset: Date,
  password: String // if not already present
});

module.exports = mongoose.model("User", UserSchema);
