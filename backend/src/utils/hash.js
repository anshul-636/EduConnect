const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 10;

/**
 * Hashes a plain-text password using bcrypt.
 * @param {string} password
 * @returns {Promise<string>} hashed password
 */
const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compares a plain-text password against a bcrypt hash.
 * @param {string} plain - password the user typed
 * @param {string} hashed - password stored in DB
 * @returns {Promise<boolean>}
 */
const verifyPassword = async (plain, hashed) => {
  return bcrypt.compare(plain, hashed);
};

module.exports = { hashPassword, verifyPassword };
