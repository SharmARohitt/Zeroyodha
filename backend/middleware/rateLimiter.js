/**
 * Rate Limiting Configuration
 * 
 * Prevents API abuse and protects against DDoS attacks.
 * Different limits for different endpoints based on sensitivity.
 */

const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req, res) => {
    // Skip rate limiting for OPTIONS requests (CORS preflight)
    return req.method === 'OPTIONS';
  },
  keyGenerator: (req, res) => {
    // Use X-Forwarded-For for accurate IP in production (Render, AWS, etc.)
    const forwarded = req.headers['x-forwarded-for'];
    return forwarded ? forwarded.split(',')[0].trim() : req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests from this IP',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: req.rateLimit.resetTime,
      timestamp: new Date().toISOString(),
    });
  },
});

/**
 * Strict limiter for sensitive operations
 * 30 requests per 15 minutes per IP
 * Used for order placement, account changes, etc.
 */
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per window
  message: {
    success: false,
    error: 'Too many sensitive requests. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED_STRICT',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    const forwarded = req.headers['x-forwarded-for'];
    return forwarded ? forwarded.split(',')[0].trim() : req.ip;
  },
});

/**
 * Authentication limiter
 * Prevent brute force attacks on auth endpoints
 * 5 failed attempts per IP per 15 minutes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 requests max
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again later.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
  skipSuccessfulRequests: true, // Only count failed attempts
  keyGenerator: (req, res) => {
    const forwarded = req.headers['x-forwarded-for'];
    return forwarded ? forwarded.split(',')[0].trim() : req.ip;
  },
});

/**
 * Create a custom rate limiter for specific endpoints
 * @param {number} maxRequests - Maximum requests in window
 * @param {number} windowMinutes - Time window in minutes
 * @returns {Function} Express middleware
 */
const createCustomLimiter = (maxRequests = 100, windowMinutes = 15) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req, res) => {
      const forwarded = req.headers['x-forwarded-for'];
      return forwarded ? forwarded.split(',')[0].trim() : req.ip;
    },
  });
};

module.exports = {
  apiLimiter,
  strictLimiter,
  authLimiter,
  createCustomLimiter,
};
