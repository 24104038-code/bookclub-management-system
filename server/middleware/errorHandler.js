/**
 * Centralized Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Server Error:', err);

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return res.status(400).json({
      success: false,
      message: `Duplicate value entered for ${field}. Please use another value.`
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: messages.join(', ')
    });
  }

  // Mongoose CastError (invalid ObjectId / Number)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid format for field '${err.path}': ${err.value}`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token.'
    });
  }

  // Default server error
  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error occurred.'
  });
};

module.exports = errorHandler;
