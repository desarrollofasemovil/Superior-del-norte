'use strict';

/**
 * rateLimiter.js — Instituto Superior del Norte LMS
 *
 * Lightweight in-memory IP-based rate limiter for public endpoints.
 * No external dependencies. Designed for single-process deployments.
 *
 * Usage:
 *   const { rateLimit } = require('../middleware/rateLimiter');
 *   router.get('/public-endpoint', rateLimit({ windowMs: 60000, max: 30 }), handler);
 */

/**
 * Creates an Express middleware that limits requests per IP within a time window.
 *
 * @param {Object} options
 * @param {number} options.windowMs - Sliding window in milliseconds (default: 60000 = 1 min)
 * @param {number} options.max      - Max requests per window per IP (default: 30)
 * @returns {Function} Express middleware
 */
function rateLimit(options = {}) {
  const windowMs = options.windowMs || 60000;
  const max = options.max || 30;
  const requests = new Map();

  // Periodic cleanup of stale entries to prevent memory leaks
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, timestamps] of requests.entries()) {
      const valid = timestamps.filter(t => t > now - windowMs);
      if (valid.length === 0) {
        requests.delete(ip);
      } else {
        requests.set(ip, valid);
      }
    }
  }, windowMs * 2);
  cleanupInterval.unref();

  return (req, res, next) => {
    const ip = (req.ip || req.connection?.remoteAddress || 'unknown').replace('::ffff:', '');
    const now = Date.now();
    const windowStart = now - windowMs;

    let timestamps = requests.get(ip) || [];
    timestamps = timestamps.filter(t => t > windowStart);

    if (timestamps.length >= max) {
      const retryAfter = Math.ceil(windowMs / 1000);
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: `Demasiadas solicitudes. Intente nuevamente en ${retryAfter} segundos.`
        }
      });
    }

    timestamps.push(now);
    requests.set(ip, timestamps);
    next();
  };
}

module.exports = {
  rateLimit
};
