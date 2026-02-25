/**
 * Market Data Routes
 * 
 * These routes handle market data requests from the mobile app.
 * All routes are protected by Firebase authentication middleware.
 * 
 * Features:
 * - Firebase authentication
 * - Input validation
 * - Response caching
 * - Error handling with async wrapper
 * 
 * Flow:
 * Mobile App -> Firebase Auth Token -> Backend Auth Middleware -> Dhan API -> Response
 */

const express = require('express');
const router = express.Router();
const dhanService = require('../services/dhanService');
const { authMiddleware } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../utils/asyncHandler');
const { 
  validateQuoteQuery, 
  validatePlaceOrder,
  handleValidationErrors 
} = require('../middleware/validator');
const { CacheManager, MarketQuoteCache } = require('../middleware/cacheManager');

/**
 * @route   GET /api/market/quote
 * @desc    Get real-time quote for a stock symbol
 * @access  Private (requires Firebase authentication)
 * @query   symbol - Stock symbol (e.g., RELIANCE, TCS)
 * @query   exchange - Exchange name (optional, default: NSE)
 * 
 * Example: GET /api/market/quote?symbol=RELIANCE&exchange=NSE
 */
router.get('/quote', 
  authMiddleware,
  validateQuoteQuery,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { symbol, exchange } = req.query;

    // Try to get from cache first
    const cachedQuote = MarketQuoteCache.getQuote(symbol, exchange || 'NSE');
    if (cachedQuote) {
      return res.status(200).json({
        success: true,
        data: cachedQuote.data,
        timestamp: new Date().toISOString(),
        cached: true,
      });
    }

    // Fetch quote from Dhan API
    const quoteData = await dhanService.getMarketQuote(symbol, exchange || 'NSE');

    // Cache the response
    MarketQuoteCache.cacheQuote(symbol, exchange || 'NSE', quoteData, 10); // 10 seconds TTL

    // Return successful response
    res.status(200).json({
      success: true,
      data: quoteData.data,
      timestamp: new Date().toISOString(),
      cached: false,
    });
  })
);

/**
 * @route   GET /api/market/quotes
 * @desc    Get real-time quotes for multiple symbols
 * @access  Private (requires Firebase authentication)
 * @query   symbols - Comma-separated symbols (e.g. RELIANCE,TCS,INFY)
 * @query   exchange - Exchange name (optional, default: NSE)
 */
router.get('/quotes',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const rawSymbols = String(req.query.symbols || '');
    const exchange = String(req.query.exchange || 'NSE').toUpperCase();

    const symbols = [...new Set(
      rawSymbols
        .split(',')
        .map((value) => value.trim().toUpperCase())
        .filter(Boolean)
    )];

    if (symbols.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'symbols query parameter is required',
        code: 'SYMBOLS_REQUIRED',
      });
    }

    const limitedSymbols = symbols.slice(0, 50);

    const quoteData = await dhanService.getMarketQuotes(limitedSymbols, exchange);

    res.status(200).json({
      success: true,
      data: quoteData.data,
      requested: quoteData.requested,
      received: quoteData.received,
      timestamp: new Date().toISOString(),
      cached: false,
    });
  })
);

/**
 * @route   GET /api/market/holdings
 * @desc    Get user's holdings from Dhan account
 * @access  Private (requires Firebase authentication)
 */
router.get('/holdings', authMiddleware, asyncHandler(async (req, res) => {
  const holdings = await dhanService.getHoldings();

  res.status(200).json({
    success: true,
    data: holdings.data,
    timestamp: new Date().toISOString(),
  });
}));

/**
 * @route   GET /api/market/positions
 * @desc    Get user's open positions from Dhan account
 * @access  Private (requires Firebase authentication)
 */
router.get('/positions', authMiddleware, asyncHandler(async (req, res) => {
  const positions = await dhanService.getPositions();

  res.status(200).json({
    success: true,
    data: positions.data,
    timestamp: new Date().toISOString(),
  });
}));

/**
 * @route   GET /api/market/funds
 * @desc    Get user's fund/margin information
 * @access  Private (requires Firebase authentication)
 */
router.get('/funds', authMiddleware, asyncHandler(async (req, res) => {
  const funds = await dhanService.getFunds();

  res.status(200).json({
    success: true,
    data: funds.data,
    timestamp: new Date().toISOString(),
  });
}));

/**
 * @route   POST /api/market/order
 * @desc    Place a new order
 * @access  Private (requires Firebase authentication)
 * @body    Order details (transactionType, securityId, quantity, etc.)
 */
router.post('/order',
  authMiddleware,
  validatePlaceOrder,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const orderData = req.body;

    // Place order via Dhan API
    const orderResult = await dhanService.placeOrder(orderData);

    // Invalidate related caches after order placed
    MarketQuoteCache.clearAll(); // Clear quote caches as positions may have changed

    res.status(201).json({
      success: true,
      data: orderResult.data,
      message: 'Order placed successfully',
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @route   GET /api/market/orders
 * @desc    Get order history
 * @access  Private (requires Firebase authentication)
 */
router.get('/orders', authMiddleware, asyncHandler(async (req, res) => {
  const orders = await dhanService.getOrders();

  res.status(200).json({
    success: true,
    data: orders.data,
    timestamp: new Date().toISOString(),
  });
}));

/**
 * @route   GET /api/market/health
 * @desc    Check Dhan API connectivity (requires auth)
 * @access  Private
 */
router.get('/health', authMiddleware, asyncHandler(async (req, res) => {
  const isHealthy = await dhanService.healthCheck();

  res.status(200).json({
    success: true,
    dhanApiStatus: isHealthy ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
}));

module.exports = router;
