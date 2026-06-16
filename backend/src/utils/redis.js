/**
 * redis.js — Shared Redis client for session caching and rate limiting.
 *
 * Falls back gracefully if Redis is not available (e.g. local dev without Docker).
 * Import { redisClient, getCache, setCache, deleteCache } wherever needed.
 */

const { createClient } = require('redis');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient = null;
let connected = false;

async function connect() {
  try {
    redisClient = createClient({ url: REDIS_URL });

    redisClient.on('error', (err) => {
      // Non-fatal — log but don't crash the server
      if (connected) console.warn('[Redis] connection error:', err.message);
    });

    redisClient.on('connect', () => {
      connected = true;
      console.log('🔴 Redis connected at', REDIS_URL);
    });

    redisClient.on('end', () => {
      connected = false;
    });

    await redisClient.connect();
  } catch (err) {
    console.warn('[Redis] could not connect — caching disabled:', err.message);
    redisClient = null;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Get a cached value (returns null on miss or if Redis is unavailable). */
async function getCache(key) {
  if (!redisClient) return null;
  try {
    const val = await redisClient.get(key);
    return val ? JSON.parse(val) : null;
  } catch (_) { return null; }
}

/** Set a cached value with optional TTL in seconds (default 5 min). */
async function setCache(key, value, ttlSeconds = 300) {
  if (!redisClient) return;
  try {
    await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (_) {}
}

/** Delete a cached value. */
async function deleteCache(key) {
  if (!redisClient) return;
  try {
    await redisClient.del(key);
  } catch (_) {}
}

/**
 * Rate limiter: returns { allowed: boolean, remaining: number }.
 * Uses a sliding-window counter in Redis.
 *
 * @param {string} key      - Unique key (e.g. `login:${ip}`)
 * @param {number} limit    - Max hits per window
 * @param {number} windowMs - Window duration in milliseconds
 */
async function rateLimit(key, limit = 10, windowMs = 60_000) {
  if (!redisClient) return { allowed: true, remaining: limit };
  try {
    const redisKey = `rl:${key}`;
    const count = await redisClient.incr(redisKey);
    if (count === 1) {
      // First hit — set expiry
      await redisClient.pExpire(redisKey, windowMs);
    }
    return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
  } catch (_) {
    return { allowed: true, remaining: limit };
  }
}

module.exports = { connect, getCache, setCache, deleteCache, rateLimit, get client() { return redisClient; } };