const mongoose = require('mongoose');

const { Schema, model } = mongoose;

// Define the Astrologer schema
const astrologerSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Optimized for lookups
    },
    specialty: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100, // Ensures specialty doesn't exceed 100 characters
    },
    experienceYears: {
      type: Number,
      required: true,
      min: 0, // Ensures experience is non-negative
      default: 0, // Default value if not provided
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Export the model
module.exports = model('Astrologer', astrologerSchema);
