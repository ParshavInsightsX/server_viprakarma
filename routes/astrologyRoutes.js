//
const express = require('express');
const { generateKundli } = require('../controllers/astrologyController.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

const router = express.Router();

/**
 * Middleware to validate the request body for generating Kundli.
 * Ensures that fullName, dateOfBirth, timeOfBirth, and placeOfBirth are provided.
 */
const validateRequest = (req, res, next) => {
  const { fullName, dateOfBirth, timeOfBirth, placeOfBirth, gender } = req.body;

  if (!fullName || !dateOfBirth || !timeOfBirth || !placeOfBirth || !gender) {
    return res.status(400).json({
      error: 'Missing required fields: fullName, dateOfBirth, timeOfBirth, or placeOfBirth.',
    });
  }

  // Additional validation can be added here, such as regex checks for date/time format.
  next();
};

/**
 * Route for generating Kundli.
 * Uses authentication middleware and request validation middleware.
 */
router.post('/generatekundli', authMiddleware, validateRequest, generateKundli);

// Uncomment the below line if role-based access control is required in the future
// router.use(roleMiddleware(['user', 'astrologer']));

module.exports = router;
