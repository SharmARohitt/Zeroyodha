/**
 * Input Validation Layer
 * 
 * Uses express-validator to validate request parameters
 * Provides consistent validation error responses
 */

const { query, body, validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors
 * Call this after running validators
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      code: 'VALIDATION_ERROR',
      timestamp: new Date().toISOString(),
      details: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value,
      })),
    });
  }
  
  next();
};

/**
 * Validators for market quote endpoint
 */
const validateQuoteQuery = [
  query('symbol')
    .trim()
    .notEmpty().withMessage('Symbol is required')
    .isLength({ min: 1, max: 20 }).withMessage('Symbol must be 1-20 characters')
    .matches(/^[A-Z0-9&]+$/).withMessage('Symbol must contain only uppercase letters and numbers'),
  
  query('exchange')
    .optional()
    .trim()
    .isIn(['NSE', 'BSE', 'MCX', 'NCDEX']).withMessage('Invalid exchange'),
];

/**
 * Validators for place order endpoint
 */
const validatePlaceOrder = [
  body('transactionType')
    .trim()
    .notEmpty().withMessage('Transaction type is required')
    .isIn(['BUY', 'SELL']).withMessage('Transaction type must be BUY or SELL'),
  
  body('securityId')
    .notEmpty().withMessage('Security ID is required')
    .isNumeric().withMessage('Security ID must be numeric'),
  
  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  
  body('exchange')
    .optional()
    .trim()
    .isIn(['NSE_EQ', 'BSE_EQ', 'MCX', 'NCDEX']).withMessage('Invalid exchange format'),
  
  body('orderType')
    .optional()
    .trim()
    .isIn(['MARKET', 'LIMIT', 'SL', 'SL-M']).withMessage('Invalid order type'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  
  body('triggerPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Trigger price must be a positive number'),
];

/**
 * Validators for holdings/positions/funds queries (pagination)
 */
const validatePaginationQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

module.exports = {
  handleValidationErrors,
  validateQuoteQuery,
  validatePlaceOrder,
  validatePaginationQuery,
};
