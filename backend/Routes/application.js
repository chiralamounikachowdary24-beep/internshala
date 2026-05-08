const express = require("express");
const router = express.Router();
const application = require("../Model/Application");
const Resume = require("../Model/Resume");
const User = require("../Model/User");
const { getApplicationLimit } = require("../utils/subscriptionPlans");

router.post("/", async (req, res) => {
  try {
    const userEmail = req.body.user?.email;

    if (!userEmail) {
      return res.status(400).json({ message: "Please login before applying." });
    }

    const savedUser = await User.findOne({ email: userEmail });
    const userPlan = savedUser?.plan || "free";
    const limit = getApplicationLimit(userPlan);

    const count = await application.countDocuments({
      "user.email": userEmail,
    });

    if (limit !== null && count >= limit) {
      return res.status(403).json({
        message: `Application limit reached for your ${userPlan} plan. Upgrade your plan to apply more.`,
      });
    }

    const resume = await Resume.findOne({
      userEmail,
    });

    const applicationipdata = new application({
      company: req.body.company,
      category: req.body.category,
      coverLetter: req.body.coverLetter,
      user: {
        ...req.body.user,
        plan: userPlan,
      },
      Application: req.body.Application,
      body: req.body.body,
      resume: resume || null,
    });

    const data = await applicationipdata.save();

    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "internal server error" });
  }
});

module.exports = router;
