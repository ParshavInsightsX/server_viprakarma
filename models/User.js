const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true, // Full name is mandatory
      trim: true, // Remove leading/trailing whitespace
    },
    email: {
      type: String,
      required: true, // Email is mandatory
      unique: true, // Ensure no duplicate emails
      trim: true, // Remove leading/trailing whitespace
      validate: {
        validator: function (value) {
          // Basic email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        message: 'Invalid email format.',
      },
    },
    password: {
      type: String,
      required: true, // Password is mandatory
    },
    role: {
      type: String,
      enum: ['user', 'astrologer', 'admin'], // Allowed roles
      default: 'user', // Default role is 'user'
    },
    subscriptionStatus: {
      type: Boolean,
      default: false, // Default to false if no subscription
      // Alternatively, store a subscription expiry date if needed:
      // expiryDate: { type: Date, default: null },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

module.exports = mongoose.model('User', userSchema);
