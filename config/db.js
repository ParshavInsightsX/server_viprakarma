// server/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true); // Set strictQuery explicitly
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(
      `MongoDB connected: ${conn.connection.host} in ${process.env.NODE_ENV || 'development'} mode`
    );
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
