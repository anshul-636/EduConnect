const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || "30m";
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || "7d";

/**
 * Creates a short-lived access token (default 30 minutes).
 * @param {object} payload - Data to encode, e.g. { userId, role }
 */
const createAccessToken = (payload) => {
  return jwt.sign({ ...payload, type: "access" }, SECRET, {
    expiresIn: ACCESS_EXPIRES,
  });
};

/**
 * Creates a long-lived refresh token (default 7 days).
 * @param {object} payload - Data to encode, e.g. { userId, role }
 */
const createRefreshToken = (payload) => {
  return jwt.sign({ ...payload, type: "refresh" }, SECRET, {
    expiresIn: REFRESH_EXPIRES,
  });
};

/**
 * Creates a short-lived reset token (15 minutes).
 * @param {object} payload - Data to encode, e.g. { userId }
 */
const createResetToken = (payload) => {
  return jwt.sign({ ...payload, type: "reset" }, SECRET, {
    expiresIn: "15m",
  });
};

/**
 * Verifies a token and returns its payload.
 * Returns null if the token is invalid or expired.
 * @param {string} token
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
};

module.exports = { createAccessToken, createRefreshToken, createResetToken, verifyToken };
