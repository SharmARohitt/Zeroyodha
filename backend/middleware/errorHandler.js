/**
 * Centralized Error Handler Middleware
 * 
 * This middleware catches all errors from routes and provides consistent error responses.
 * It should be the last middleware in the chain.
 * 
 * Usage in server.js:
 * app.use(errorHandler);
 */

/**
 * Global error handler
 * @param {Error} err - Error object
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('❌ Error Handler:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    user: req.user?.uid,
  });

  // Default error status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || 'INTERNAL_ERROR';

  // Handle specific error types
  
  // Mongoose/MongoDB errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = 'Invalid ID format';
  }

  // JWT errors (if using JWT instead of Firebase)
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Token expired';
  }

  // Axios/HTTP errors
  if (err.isAxiosError) {
    statusCode = err.response?.status || 503;
    code = 'EXTERNAL_API_ERROR';
    message = err.response?.data?.message || 'External API request failed';
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    code: code,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    // Include stack trace only in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    // Include additional details if available
    ...(err.details && { details: err.details }),
  });
};

/**
 * 404 Not Found handler
 * Place this before the error handler in server.js
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  error.code = 'ROUTE_NOT_FOUND';
  next(error);
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
