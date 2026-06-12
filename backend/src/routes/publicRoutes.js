const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/certificate/verify/:codigo', publicController.verifyCertificate);

module.exports = router;
