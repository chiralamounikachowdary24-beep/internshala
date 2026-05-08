const otpStore = {}; 
const verifiedStore = {};
// structure: { email: { otp: "123456", expiresAt: timestamp } }

module.exports = {
  // ✅ Save OTP
  set(email, otp) {
    otpStore[email] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    };
  },

  // ✅ Verify OTP
  verify(email, otp) {
    const record = otpStore[email];

    if (!record) return false;

    // check expiry
    if (Date.now() > record.expiresAt) {
      delete otpStore[email];
      return false;
    }

    return record.otp === otp;
  },

  // ✅ Clear OTP after success
  clear(email) {
    delete otpStore[email];
  },

  markVerified(email) {
    verifiedStore[email] = Date.now() + 10 * 60 * 1000;
  },

  isVerified(email) {
    const expiresAt = verifiedStore[email];

    if (!expiresAt) return false;

    if (Date.now() > expiresAt) {
      delete verifiedStore[email];
      return false;
    }

    return true;
  },

  clearVerified(email) {
    delete verifiedStore[email];
  },
};
