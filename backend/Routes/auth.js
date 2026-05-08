const router = require("express").Router();
const { UAParser } = require("ua-parser-js");
const User = require("../Model/User");
const LoginHistory = require("../Model/LoginHistory");
const otpStore = require("../utils/otpStore");
const { sendOTP, sendPasswordResetEmail } = require("../utils/mailer");

const MOBILE_LOGIN_START_HOUR_IST = 10;
const MOBILE_LOGIN_END_HOUR_IST = 13;

function generatePassword(length = 8) {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const letters = lowercase + uppercase;

  const password = [
    lowercase[Math.floor(Math.random() * lowercase.length)],
    uppercase[Math.floor(Math.random() * uppercase.length)],
  ];

  while (password.length < length) {
    password.push(letters[Math.floor(Math.random() * letters.length)]);
  }

  return password.sort(() => Math.random() - 0.5).join("");
}

function normalizePhone(value = "") {
  return String(value).replace(/\D/g, "");
}

function buildUserLookup(identifier, email, phoneNumber) {
  const rawValue = String(identifier || email || phoneNumber || "").trim();

  if (!rawValue) return null;

  const normalizedPhone = normalizePhone(rawValue);
  const lookup = [{ email: rawValue }, { phoneNumber: rawValue }, { phone: rawValue }];

  if (normalizedPhone) {
    lookup.push({ phoneNumber: normalizedPhone }, { phone: normalizedPhone });
  }

  return { $or: lookup };
}

function getClientIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (forwardedFor) {
    return String(forwardedFor).split(",")[0].trim();
  }

  return req.socket?.remoteAddress || req.ip || "";
}

function getIstHour() {
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: false,
    timeZone: "Asia/Kolkata",
  });

  return Number(formatter.format(new Date()));
}

function isMobileDevice(type) {
  return type === "mobile" || type === "tablet";
}

function isWithinMobileLoginWindow() {
  const hour = getIstHour();
  return hour >= MOBILE_LOGIN_START_HOUR_IST && hour < MOBILE_LOGIN_END_HOUR_IST;
}

function getLoginMetadata(req) {
  const parser = new UAParser(req.headers["user-agent"] || "");
  const result = parser.getResult();
  const deviceType = result.device?.type || "desktop";

  return {
    browser: result.browser?.name || "Unknown browser",
    browserVersion: result.browser?.version || "",
    os: result.os?.name || "Unknown OS",
    osVersion: result.os?.version || "",
    device: deviceType,
    deviceVendor: result.device?.vendor || "",
    deviceModel: result.device?.model || "",
    systemType: isMobileDevice(deviceType) ? "Mobile/Tablet" : "Desktop/Laptop",
    ip: getClientIp(req),
  };
}

async function saveLoginHistory(req, userPayload, status, extra = {}) {
  const metadata = getLoginMetadata(req);

  return LoginHistory.create({
    userId: userPayload.uid || userPayload.email,
    email: userPayload.email,
    name: userPayload.name,
    ...metadata,
    status,
    ...extra,
  });
}

async function upsertLoginUser(userPayload) {
  const update = {
    email: userPayload.email,
    name: userPayload.name || "User",
    phoneNumber: userPayload.phoneNumber || "",
  };

  const user = await User.findOneAndUpdate(
    { email: userPayload.email },
    { $set: update, $setOnInsert: { plan: "free" } },
    { upsert: true, new: true }
  );

  return {
    uid: userPayload.uid,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    photo: userPayload.photo || null,
    plan: user.plan || "free",
  };
}

async function resetPassword(req, res) {
  try {
    const { identifier, email, phoneNumber } = req.body;
    const lookup = buildUserLookup(identifier, email, phoneNumber);

    if (!lookup) {
      return res.status(400).json({ message: "Please enter email or phone number" });
    }

    const user = await User.findOne(lookup);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const today = new Date().toDateString();

    if (user.lastPasswordReset?.toDateString() === today) {
      return res.status(429).json({
        message: "You can use forgot password only one time a day.",
      });
    }

    const password = generatePassword();
    user.password = password;
    user.lastPasswordReset = new Date();
    await user.save();

    let emailSent = false;

    if (user.email) {
      try {
        await sendPasswordResetEmail(user.email, password);
        emailSent = true;
      } catch (emailError) {
        console.log("Password reset email failed:", emailError.message);
      }
    }

    res.json({
      message: emailSent
        ? "New password generated and sent to your email."
        : "New password generated. Email delivery is not configured, so use the generated password shown here.",
      password,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

router.post("/reset-password", resetPassword);
router.post("/forgot-password", resetPassword);

router.post("/login/start", async (req, res) => {
  try {
    const { uid, email, name, photo, phoneNumber } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const userPayload = { uid, email, name, photo, phoneNumber };
    const metadata = getLoginMetadata(req);

    if (isMobileDevice(metadata.device) && !isWithinMobileLoginWindow()) {
      await saveLoginHistory(req, userPayload, "blocked", {
        reason: "Mobile login is allowed only from 10:00 AM to 1:00 PM IST",
      });

      return res.status(403).json({
        message: "Mobile login is allowed only from 10:00 AM to 1:00 PM IST.",
      });
    }

    const user = await upsertLoginUser(userPayload);
    await saveLoginHistory(req, userPayload, "success", { otpVerified: false });

    res.json({
      requiresOtp: false,
      user,
      message: "Login allowed",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Login access check failed" });
  }
});

router.get("/login-history", async (req, res) => {
  try {
    const email = String(req.query.email || "").trim();

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const history = await LoginHistory.find({ email })
      .sort({ createdAt: -1 })
      .limit(25)
      .lean();

    res.json(history);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch login history" });
  }
});

router.post("/language/send-otp", async (req, res) => {
  try {
    const { email, language } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (language !== "fr") {
      return res.status(400).json({ message: "OTP is required only for French language" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(`language:${email}:fr`, otp);

    await sendOTP(email, otp, "French language verification");

    res.json({ message: "OTP sent to your email" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to send language OTP" });
  }
});

router.post("/language/verify-otp", (req, res) => {
  const { email, language, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  if (language !== "fr") {
    return res.status(400).json({ message: "OTP is required only for French language" });
  }

  const key = `language:${email}:fr`;
  const isValid = otpStore.verify(key, otp);

  if (!isValid) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  otpStore.clear(key);
  res.json({ success: true, language: "fr" });
});

module.exports = router;
