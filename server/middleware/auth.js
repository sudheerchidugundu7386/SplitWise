const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Middleware to require authentication.
 * Blocks the request if token is missing or invalid.
 */
exports.requireAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ error: "Not authorized to access this route" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ error: "User not found" });
    }
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token is invalid or expired" });
  }
};

/**
 * Middleware for optional authentication.
 * Attaches the user to req.user if a valid token is present,
 * but allows the request to proceed even if unauthenticated.
 */
exports.optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
      req.user = await User.findById(decoded.id).select("-password");
    } catch (error) {
      // Ignore token errors for optional auth
    }
  }
  next();
};
