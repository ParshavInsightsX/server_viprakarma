/**
 * Middleware for Role-Based Access Control (RBAC).
 *
 * This middleware checks if the user's role is included in the allowed roles for a specific route.
 * @param {string[]} roles - An array of strings representing the allowed roles.
 * @returns {Function} Middleware function.
 */
module.exports = (roles) => {
  return (req, res, next) => {
    // Check if user information is available
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Unauthorized. User information is missing.' });
    }

    // Check if the user's role is allowed
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden. You do not have the required permissions.' });
    }

    // User is authorized, proceed to the next middleware or route handler
    next();
  };
};
