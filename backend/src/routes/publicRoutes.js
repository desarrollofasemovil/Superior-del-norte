const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');
const { rateLimit } = require('../middleware/rateLimiter');

// Public verify endpoint — rate limited to prevent brute-force enumeration
router.get(
  '/certificate/verify/:codigo',
  rateLimit({ windowMs: 60000, max: 30 }),
  publicController.verifyCertificate
);

module.exports = router;
