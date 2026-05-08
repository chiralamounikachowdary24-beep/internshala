const express = require("express");
const router = express.Router();

const internship = require("./internship");
const job = require("./job");
const application = require("./application");
const auth = require("./auth");
const payment = require("./payment");
const post = require("./post");
const resume = require("./resume");

router.use("/internship", internship);
router.use("/job", job);
router.use("/application", application);
router.use("/auth", auth);
router.use("/payment", payment);
router.use("/post", post);
router.use("/resume", resume);

module.exports = router;
