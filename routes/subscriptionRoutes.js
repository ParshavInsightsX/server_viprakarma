const express = require('express');
const { createOrder, verifyPayment } = require('../controllers/subscriptionController.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

const router = express.Router();

/**
 * Route to create a Razorpay order.
 * Protected route: Requires authentication.
 */
router.post('/create-order', authMiddleware, createOrder);

/**
 * Route to verify Razorpay payment and activate subscription.
 * Protected route: Requires authentication.
 */
router.post('/verify-payment', authMiddleware, verifyPayment);

module.exports = router;
