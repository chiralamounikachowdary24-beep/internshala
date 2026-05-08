const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const router = express.Router();
const User = require("../Model/User");
const { SUBSCRIPTION_PLANS } = require("../utils/subscriptionPlans");
const { sendSubscriptionInvoiceEmail } = require("../utils/mailer");

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

function getIstMinutes(date = new Date()) {
  const utcMinutes = date.getUTCHours() * 60 + date.getUTCMinutes();
  return (utcMinutes + 330) % 1440;
}

function isPaymentWindowOpen(date = new Date()) {
  const istMinutes = getIstMinutes(date);
  return istMinutes >= 10 * 60 && istMinutes < 11 * 60;
}

function formatIstDateTime(date = new Date()) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function validatePaymentWindow(res) {
  if (isPaymentWindowOpen()) return true;

  res.status(403).json({
    message: "Payment is allowed only between 10:00 AM and 11:00 AM IST.",
    currentIstTime: formatIstDateTime(),
  });
  return false;
}

router.get("/plans", (req, res) => {
  res.json(
    Object.entries(SUBSCRIPTION_PLANS).map(([id, plan]) => ({
      id,
      ...plan,
    }))
  );
});

router.post("/create-order", async (req, res) => {
  try {
    if (!validatePaymentWindow(res)) return;

    const { plan, email } = req.body;
    const selectedPlan = SUBSCRIPTION_PLANS[plan];

    if (!email) {
      return res.status(400).json({ message: "Please login before payment." });
    }

    if (!selectedPlan || plan === "free") {
      return res.status(400).json({ message: "Please choose a valid paid plan." });
    }

    if (isDemoPaymentEnabled()) {
      return res.json({
        id: `order_demo_${Date.now()}`,
        amount: selectedPlan.price * 100,
        currency: "INR",
        key: "demo",
        plan,
        planName: selectedPlan.name,
        amountInRupees: selectedPlan.price,
        demo: true,
      });
    }

    const order = await razorpay.orders.create({
      amount: selectedPlan.price * 100,
      currency: "INR",
      receipt: `sub_${plan}_${Date.now()}`,
      notes: {
        email,
        plan,
      },
    });

    res.json({
      ...order,
      key: RAZORPAY_KEY_ID,
      plan,
      planName: selectedPlan.name,
      amountInRupees: selectedPlan.price,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error creating order" });
  }
});

router.post("/verify", async (req, res) => {
  try {
    if (!validatePaymentWindow(res)) return;

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      email,
      plan,
    } = req.body;

    const selectedPlan = SUBSCRIPTION_PLANS[plan];

    if (!selectedPlan || plan === "free") {
      return res.status(400).json({ message: "Invalid subscription plan." });
    }

    if (!email) {
      return res.status(400).json({ message: "User email is required." });
    }

    if (isDemoPaymentEnabled()) {
      if (!String(razorpay_order_id || "").startsWith("order_demo_")) {
        return res.status(400).json({ message: "Invalid demo payment order." });
      }
    } else {
      if (!RAZORPAY_KEY_SECRET) {
        return res.status(500).json({ message: "Razorpay secret is not configured." });
      }

      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ message: "Invalid payment signature." });
      }
    }

    const invoice = {
      invoiceId: `INV-${Date.now()}`,
      plan,
      planName: selectedPlan.name,
      amount: selectedPlan.price,
      applicationLimit: selectedPlan.applicationLimit,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      paidAt: formatIstDateTime(),
    };

    const updatedUser = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          email,
          plan,
          subscription: {
            plan,
            amount: selectedPlan.price,
            interval: selectedPlan.interval,
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
            invoiceId: invoice.invoiceId,
            paidAt: new Date(),
          },
        },
      },
      { new: true, upsert: true }
    );

    let emailSent = false;
    try {
      await sendSubscriptionInvoiceEmail(email, invoice);
      emailSent = true;
    } catch (emailError) {
      console.log("Subscription invoice email failed:", emailError.message);
    }

    res.json({
      success: true,
      message: emailSent
        ? "Payment successful. Invoice sent to your email."
        : "Payment successful. Invoice email is not configured.",
      plan: updatedUser.plan,
      invoice,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Payment verification failed" });
  }
});

module.exports = router;
