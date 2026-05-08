const nodemailer = require("nodemailer");
require("dotenv").config();

const getMailTransportConfig = () => {
  const user = process.env.EMAIL_USER || "";

  if (process.env.EMAIL_HOST) {
    return {
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: process.env.EMAIL_SECURE === "true",
      connectionTimeout: Number(process.env.EMAIL_TIMEOUT || 15000),
      greetingTimeout: Number(process.env.EMAIL_TIMEOUT || 15000),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    };
  }

  if (user.endsWith("@gmail.com")) {
    return {
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    };
  }

  return {
    host: "smtp.mail.com",
    port: 587,
    secure: false,
    connectionTimeout: Number(process.env.EMAIL_TIMEOUT || 15000),
    greetingTimeout: Number(process.env.EMAIL_TIMEOUT || 15000),
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  };
};

const transporter = nodemailer.createTransport(getMailTransportConfig());

async function sendOTP(email, otp, purpose = "Resume Generation") {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL_USER and EMAIL_PASS are required in .env");
  }

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Your OTP for ${purpose}`,
    text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
  });
}

async function sendPasswordResetEmail(email, password) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL_USER and EMAIL_PASS are required in .env");
  }

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your new Internarea password",
    text: `Your new password is ${password}. You can request a new password only once per day.`,
  });
}

async function sendSubscriptionInvoiceEmail(email, invoice) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL_USER and EMAIL_PASS are required in .env");
  }

  const limitText =
    invoice.applicationLimit === null
      ? "Unlimited internship applications"
      : `${invoice.applicationLimit} internship applications`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Internarea invoice - ${invoice.planName} plan`,
    text: [
      "Thank you for your subscription.",
      "",
      `Invoice ID: ${invoice.invoiceId}`,
      `Plan: ${invoice.planName}`,
      `Price: Rs.${invoice.amount}/month`,
      `Benefits: ${limitText}`,
      `Payment ID: ${invoice.paymentId}`,
      `Order ID: ${invoice.orderId}`,
      `Paid at: ${invoice.paidAt}`,
    ].join("\n"),
  });
}

async function sendSmsOTP(phone, otp, purpose = "Resume Generation") {
  console.log("================================================");
  console.log(`[MOCK SMS SENDER] To: ${phone}`);
  console.log(`[MOCK SMS SENDER] Message: Your OTP for ${purpose} is ${otp}. It is valid for 5 minutes.`);
  console.log("================================================");
}

module.exports = { sendOTP, sendPasswordResetEmail, sendSubscriptionInvoiceEmail, sendSmsOTP };
