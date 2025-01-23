// server/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Validate Authorization header format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Authorization header is missing or invalid. Access denied.',
    });
  }

  // Extract token
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      message: 'Token not provided. Access denied.',
    });
  }

  // Validate JWT_SECRET
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      message: 'Internal server error. JWT secret is not configured.',
    });
  }

  try {
    // Verify token (will throw if expired or invalid)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user data to request object
    req.user = decoded;

    // Proceed to the next middleware or route handler
    return next();
  } catch (err) {
    // If the token is expired, re-generate a new token
    if (err.name === 'TokenExpiredError') {
      console.error('Token expired, generating a new token...');
      // Decode just to retrieve the payload. This won't verify signature!
      const expiredPayload = jwt.decode(token);

      if (!expiredPayload) {
        return res.status(403).json({
          message: 'Could not decode expired token. Access denied.',
        });
      }

      // Generate a new token with the same payload data
      const newToken = jwt.sign(
        {
          // Keep only essential data from the expired payload
          // e.g., if your payload had 'id', 'username', etc., spread them here
          ...expiredPayload,
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Attach user from expired token to request
      req.user = expiredPayload;

      // Option 1: Send new token in a response header.
      // The client should update it in subsequent requests.
      res.setHeader('x-new-token', newToken);

      // Proceed to the next middleware
      return next();
    }

    // Otherwise, it's some other error (invalid signature, etc.)
    console.error('JWT verification failed:', err.message);
    return res.status(403).json({
      message: 'Invalid token. Access denied.',
    });
  }
};

module.exports = authMiddleware;
