const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db.js');
const authRoutes = require('./routes/authRoutes.js');
const astrologyRoutes = require('./routes/astrologyRoutes.js');
const numerologyRoutes = require('./routes/numerologyRoutes.js');
const errorHandler = require('./middlewares/errorHandler.js');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect Database
(async () => {
  try {
    await connectDB();
    console.log('Database connected successfully.');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1); // Exit process with failure
  }
})();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/astrology', astrologyRoutes);
app.use('/api/numerology', numerologyRoutes);


// Handle undefined routes
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found.' });
});

// Global Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Process-level error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1); // Exit process with failure
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1); // Exit process with failure
});
