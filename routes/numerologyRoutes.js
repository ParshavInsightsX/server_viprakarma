const express = require('express');
const { generateNumerology } = require('../controllers/numerologyController.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

const router = express.Router();

/**
 * Middleware to validate numerology input.
 * Ensures `fullName` and `dateOfBirth` are provided and valid.
 */
const validateNumerologyInput = (req, res, next) => {
  const { fullName, dateOfBirth } = req.body;

  if (!fullName || !dateOfBirth) {
    return res.status(400).json({
      error: 'Missing required fields: fullName and dateOfBirth.',
    });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
    return res.status(400).json({
      error: 'Invalid date format. Use YYYY-MM-DD.',
    });
  }

  if (/^[^A-Za-z]+$/.test(fullName)) {
    return res.status(400).json({
      error: 'Full name must contain at least one alphabetic character.',
    });
  }

  next();
};

// Routes
router.post('/generate-numerology', authMiddleware, validateNumerologyInput, generateNumerology);

module.exports = router;
