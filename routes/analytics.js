const express = require('express');
const router = express.Router();
const orderController = require('../controllers/analytics');

router.get('/analytics', orderController.getAnalytics);

module.exports = router;
