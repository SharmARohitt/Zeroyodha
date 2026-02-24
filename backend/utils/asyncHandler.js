/**
 * Async Error Wrapper
 * 
 * Wraps async route handlers to catch unhandled promise rejections
 * Prevents "unhandled rejection" crashes
 */

/**
 * Wrap async route handler with error handling
 * @param {Function} fn - Async route handler function
 * @returns {Function} Wrapped function that calls next(error) on rejection
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    // Execute async function and catch any errors
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Alternative: Decorator-style wrapper
 * Usage: app.get('/route', asyncHandler(async (req, res) => { ... }))
 */
const catchAsync = asyncHandler;

module.exports = {
  asyncHandler,
  catchAsync,
};
