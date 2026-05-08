const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  userEmail: String,
  userName: String,

  media: String, // image/video URL
  type: String,  // "image" | "video"
  caption: String,

  likes: [String], // array of emails

  comments: [
    {
      userEmail: String,
      userName: String,
      text: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Post", PostSchema);
