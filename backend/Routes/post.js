const router = require("express").Router();
const Post = require("../Model/Post");
const User = require("../Model/User");

const getTodayStart = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const getDailyLimit = (friendCount = 0) => {
  if (friendCount > 10) return null;
  if (friendCount >= 2) return 2;
  return 1;
};

const getPostAllowance = async (userEmail) => {
  const user = await User.findOne({ email: userEmail });
  const friendCount = user?.friends?.length || 0;
  const limit = getDailyLimit(friendCount);

  const usedToday = await Post.countDocuments({
    userEmail,
    createdAt: { $gte: getTodayStart() },
  });

  return {
    friendCount,
    limit,
    usedToday,
    remaining: limit === null ? null : Math.max(limit - usedToday, 0),
  };
};

router.get("/allowance", async (req, res) => {
  try {
    const { userEmail } = req.query;

    if (!userEmail) {
      return res.status(400).json({ message: "User email is required" });
    }

    const allowance = await getPostAllowance(userEmail);
    res.json(allowance);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error checking post allowance" });
  }
});

router.post("/create", async (req, res) => {
  try {
    const { userEmail, caption, media, type } = req.body;

    if (!userEmail) {
      return res.status(400).json({ message: "Login first" });
    }

    if (!caption?.trim() && !media) {
      return res.status(400).json({ message: "Add a caption, picture, or video" });
    }

    if (media && !["image", "video"].includes(type)) {
      return res.status(400).json({ message: "Media type must be image or video" });
    }

    const allowance = await getPostAllowance(userEmail);

    if (allowance.limit !== null && allowance.usedToday >= allowance.limit) {
      return res.status(429).json({
        message:
          allowance.limit === 1
            ? "Post limit reached today. Add at least 2 friends to post twice a day."
            : "Post limit reached today. Add more than 10 friends for unlimited daily posts.",
        allowance,
      });
    }

    const post = await Post.create({
      ...req.body,
      caption: caption?.trim() || "",
      likes: [],
      comments: [],
    });

    const nextAllowance = await getPostAllowance(userEmail);

    res.status(201).json({ post, allowance: nextAllowance });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error creating post" });
  }
});

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error loading posts" });
  }
});

router.post("/like/:id", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Login first" });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.likes.includes(email)) {
      post.likes = post.likes.filter((likedEmail) => likedEmail !== email);
    } else {
      post.likes.push(email);
    }

    await post.save();

    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error liking post" });
  }
});

router.post("/comment/:id", async (req, res) => {
  try {
    const { userEmail, userName, text } = req.body;

    if (!userEmail) {
      return res.status(400).json({ message: "Login first" });
    }

    if (!text?.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({ userEmail, userName, text: text.trim() });

    await post.save();

    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error adding comment" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const userEmail = req.body.userEmail || req.query.userEmail;

    if (!userEmail) {
      return res.status(400).json({ message: "Login first to delete posts" });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userEmail !== userEmail) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error deleting post" });
  }
});

module.exports = router;
