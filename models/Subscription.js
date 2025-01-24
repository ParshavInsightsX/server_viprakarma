const mongoose = require('mongoose');

const { Schema, model } = mongoose;

// Define the Subscription schema
const subscriptionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true, // Ensure userId is always provided
    },
    paymentId: {
      type: String,
      required: true, // Ensure paymentId is always provided
    },
    amount: {
      type: Number,
      required: true, // Ensure amount is always provided
    },
    currency: {
      type: String,
      default: 'INR', // Default currency is INR
      required: true,
    },
    status: {
      type: String,
      enum: ['created', 'pending', 'completed', 'failed'], // Allowed status values
      default: 'created', // Default status
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Export the model
module.exports = model('Subscription', subscriptionSchema);
