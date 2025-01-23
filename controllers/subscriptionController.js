const Razorpay = require('razorpay');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const Subscription = require('../models/Subscription.js');
const User = require('../models/User.js');

const SUBSCRIPTION_AMOUNT = parseInt(process.env.SUBSCRIPTION_AMOUNT || 14900, 10); // Default to 149 INR (in paise)
const CURRENCY = 'INR';

// Initialize Razorpay instance
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'your_razorpay_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'your_razorpay_key_secret',
});

// Check Razorpay credentials
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('Razorpay credentials are not configured. Check environment variables.');
}

/**
 * Create a Razorpay order for subscription.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const createOrder = async (req, res) => {
  try {
    const options = {
      amount: SUBSCRIPTION_AMOUNT,
      currency: CURRENCY,
      receipt: `receipt_order_${uuidv4()}`,
    };

    const order = await razorpayInstance.orders.create(options);

    res.status(201).json({
      orderId: order.id,
      currency: order.currency,
      amount: order.amount,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error.message);
    res.status(500).json({ error: 'Failed to create order. Please try again later.' });
  }
};

/**
 * Verify Razorpay payment and activate subscription.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const verifyPayment = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return res.status(400).json({ error: 'Missing required payment details.' });
  }

  try {
    // Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ error: 'Invalid payment signature. Verification failed.' });
    }

    // Save subscription record
    const subscription = new Subscription({
      userId: req.user.userId,
      paymentId: razorpayPaymentId,
      amount: SUBSCRIPTION_AMOUNT / 100, // Convert to INR
      status: 'paid',
    });
    await subscription.save();

    // Update user subscription status
    await User.findByIdAndUpdate(req.user.userId, { subscriptionStatus: true });

    res.json({ message: 'Payment verified and subscription activated.' });
  } catch (error) {
    console.error('Error verifying payment:', error.message);
    res.status(500).json({ error: 'Payment verification failed. Please try again.' });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
};
