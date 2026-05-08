const router = require("express").Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Resume = require("../Model/Resume");
const User = require("../Model/User");
const otpStore = require("../utils/otpStore");
const { sendSmsOTP } = require("../utils/mailer");

const RESUME_PRICE = 50;
const PREMIUM_PLANS = ["bronze", "silver", "gold"];
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const razorpay =
  RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
      })
    : null;

const isDemoPaymentEnabled = () => !razorpay || process.env.PAYMENT_GATEWAY === "demo";

async function getPremiumUser(email) {
  if (!email) return null;

  const user = await User.findOne({ email });
  if (!user || !PREMIUM_PLANS.includes(user.plan)) return null;

  return user;
}

router.post("/send-otp", async (req, res) => {
  const { email, phone } = req.body;

  if (!email || !phone) return res.status(400).json({ message: "Email and Phone required" });

  const user = await getPremiumUser(email);
  if (!user) {
    return res.status(403).json({
      message: "Resume creation is available only for premium plan students.",
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(phone, otp);

  try {
    await sendSmsOTP(phone, otp);
    res.json({ message: "OTP sent", testOtp: otp });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

router.post("/verify-otp", (req, res) => {
  const { phone, otp } = req.body;

  const isValid = otpStore.verify(phone, otp);

  if (!isValid) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  otpStore.clear(phone);
  otpStore.markVerified(phone);

  res.json({ success: true });
});

router.post("/create-order", async (req, res) => {
  try {
    const { email, phone } = req.body;

    const user = await getPremiumUser(email);
    if (!user) {
      return res.status(403).json({
        message: "Resume creation is available only for premium plan students.",
      });
    }

    if (!otpStore.isVerified(phone)) {
      return res.status(403).json({ message: "Verify mobile OTP before payment." });
    }

    if (isDemoPaymentEnabled()) {
      return res.json({
        id: `resume_demo_${Date.now()}`,
        amount: RESUME_PRICE * 100,
        currency: "INR",
        key: "demo",
        demo: true,
      });
    }

    const order = await razorpay.orders.create({
      amount: RESUME_PRICE * 100,
      currency: "INR",
      receipt: `resume_${Date.now()}`,
      notes: {
        email,
        purpose: "resume-builder",
      },
    });

    res.json({
      ...order,
      key: RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error creating resume payment order" });
  }
});

router.post("/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      resume,
    } = req.body;

    const email = resume?.userEmail || resume?.email;
    const phone = resume?.phone;

    const user = await getPremiumUser(email);
    if (!user) {
      return res.status(403).json({
        message: "Resume creation is available only for premium plan students.",
      });
    }

    if (!otpStore.isVerified(phone)) {
      return res.status(403).json({ message: "Verify mobile OTP before payment." });
    }

    if (isDemoPaymentEnabled()) {
      if (!String(razorpay_order_id || "").startsWith("resume_demo_")) {
        return res.status(400).json({ message: "Invalid demo resume payment order." });
      }
    } else {
      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ message: "Invalid payment signature." });
      }
    }

    const savedResume = await Resume.create({
      ...resume,
      userEmail: email,
      email,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount: RESUME_PRICE,
    });

    otpStore.clearVerified(phone);

    res.json({
      success: true,
      message: "Resume created and added to your profile.",
      resume: savedResume,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Payment verification or resume saving failed" });
  }
});

router.post("/create", async (req, res) => {
  try {
    const email = req.body.userEmail || req.body.email;
    const user = await getPremiumUser(email);

    if (!user) {
      return res.status(403).json({
        message: "Resume creation is available only for premium plan students.",
      });
    }

    const resume = await Resume.create(req.body);
    res.json(resume);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error saving resume" });
  }
});

module.exports = router;
