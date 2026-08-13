const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // Get Authorization header
    const authHeader = req.headers.authorization;

    // Check if token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Access denied. No token provided",
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Store user ID in request
    req.user = decoded;

    // Continue to route
    next();
  } catch (error) {
    console.error("Authentication Error:", error);

    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;