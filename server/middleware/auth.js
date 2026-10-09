const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bookclub_super_secure_jwt_secret_key_2026_production');

    // Find user by decoded userId or _id
    const user = await User.findOne({
      $or: [
        { userId: decoded.userId || decoded.id },
        { _id: (decoded.id && decoded.id.length === 24) ? decoded.id : null }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session or user no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token.'
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bookclub_super_secure_jwt_secret_key_2026_production');
      const user = await User.findOne({
        $or: [
          { userId: decoded.userId || decoded.id },
          { _id: (decoded.id && decoded.id.length === 24) ? decoded.id : null }
        ]
      });
      if (user) {
        req.user = user;
      }
    }
  } catch {
    // Ignore invalid tokens on optional routes
  }
  next();
};

module.exports = { auth, optionalAuth };
