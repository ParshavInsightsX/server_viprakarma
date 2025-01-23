/**
 * Global Error Handling Middleware.
 * 
 * This middleware should be placed after all other middleware and routes.
 */
const errorHandler = (err, req, res, next) => {
  // Log the error details for debugging
  console.error('Global Error Handler:', {
    message: err.message,
    stack: err.stack,
    status: err.status || 500,
  });

  // Set the HTTP status code
  const statusCode = err.status || 500;

  // Send a JSON response to the client
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;
