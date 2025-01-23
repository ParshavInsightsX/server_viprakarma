const express = require('express');
const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  deleteUser,
} = require('../controllers/authController.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

const router = express.Router();

/**
 * Middleware to validate registration inputs.
 * Ensures email, password, and fullName are provided.
 */
const validateRegistration = (req, res, next) => {
  const { email, password, fullName } = req.body;
  console.log(req.body);
  if (!email || !password || !fullName) {
    return res.status(400).json({
      error: 'Missing required fields: email, password, and fullName.',
    });
  }
  // Optional: Add additional validation for email and password strength here.
  next();
};

/**
 * Middleware to validate login inputs.
 * Ensures email and password are provided.
 */
const validateLogin = (req, res, next) => {
  console.log(req.body);
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      error: 'Missing required fields: email and password.',
    });
  }
  next();
};

// Public routes
router.post('/register', validateRegistration, registerUser);
router.post('/login', validateLogin, loginUser);

// Protected routes (requires authentication middleware)
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.delete('/profile', authMiddleware, deleteUser);

module.exports = router;
