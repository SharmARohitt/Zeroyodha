/**
 * Response Caching Layer
 * 
 * In-memory caching to reduce repeated Dhan API calls
 * Useful for stock quotes which change slowly
 */

const NodeCache = require('node-cache');

// Initialize cache with standard TTL (Time To Live)
const cache = new NodeCache({
  stdTTL: 10, // 10 seconds standard TTL
  checkperiod: 120, // Check for expired keys every 2 minutes
});

/**
 * Cache manager class
 */
class CacheManager {
  /**
   * Generate cache key from multiple parts
   * @param {...string} parts - Parts to create key from
   * @returns {string} Cache key
   */
  static generateKey(...parts) {
    return parts
      .map(part => String(part).toUpperCase().replace(/\s+/g, '_'))
      .join(':');
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {any} Cached value or undefined
   */
  static get(key) {
    const value = cache.get(key);
    if (value) {
      console.log(`✅ Cache HIT: ${key}`);
    }
    return value;
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (optional)
   */
  static set(key, value, ttl = 10) {
    cache.set(key, value, ttl);
    console.log(`💾 Cache SET: ${key} (TTL: ${ttl}s)`);
  }

  /**
   * Delete value from cache
   * @param {string} key - Cache key
   */
  static delete(key) {
    cache.del(key);
    console.log(`🗑️  Cache DELETE: ${key}`);
  }

  /**
   * Clear all cache
   */
  static clear() {
    cache.flushAll();
    console.log('🗑️  Cache CLEARED');
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  static getStats() {
    return cache.getStats();
  }

  /**
   * Get all cached keys
   * @returns {string[]} Array of keys
   */
  static getKeys() {
    return cache.keys();
  }

  /**
   * Middleware for caching GET requests
   * @param {number} ttl - Cache TTL in seconds
   * @returns {Function} Express middleware
   */
  static cacheMiddleware(ttl = 10) {
    return (req, res, next) => {
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next();
      }

      // Generate cache key from route and query params
      const cacheKey = CacheManager.generateKey(
        req.path,
        JSON.stringify(req.query)
      );

      // Try to get from cache
      const cachedData = CacheManager.get(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      // Store original res.json to intercept response
      const originalJson = res.json.bind(res);

      // Override res.json to cache successful responses
      res.json = function(data) {
        if (res.statusCode === 200 && data && data.success === true) {
          CacheManager.set(cacheKey, data, ttl);
        }
        return originalJson(data);
      };

      next();
    };
  }
}

/**
 * Specific cache helpers for common queries
 */
class MarketQuoteCache {
  /**
   * Get cached quote
   * @param {string} symbol - Stock symbol
   * @param {string} exchange - Exchange name
   * @returns {Object|null} Cached quote or null
   */
  static getQuote(symbol, exchange = 'NSE') {
    const key = CacheManager.generateKey('QUOTE', symbol, exchange);
    return CacheManager.get(key);
  }

  /**
   * Cache quote
   * @param {string} symbol - Stock symbol
   * @param {string} exchange - Exchange name
   * @param {Object} quoteData - Quote data to cache
   * @param {number} ttl - Cache TTL in seconds (default: 10)
   */
  static cacheQuote(symbol, exchange = 'NSE', quoteData, ttl = 10) {
    const key = CacheManager.generateKey('QUOTE', symbol, exchange);
    CacheManager.set(key, quoteData, ttl);
  }

  /**
   * Invalidate quote cache (after trade, etc.)
   * @param {string} symbol - Stock symbol
   * @param {string} exchange - Exchange name
   */
  static invalidateQuote(symbol, exchange = 'NSE') {
    const key = CacheManager.generateKey('QUOTE', symbol, exchange);
    CacheManager.delete(key);
  }

  /**
   * Clear all quote cache
   */
  static clearAll() {
    const keys = cache.keys();
    keys.forEach(key => {
      if (key.startsWith('QUOTE')) {
        CacheManager.delete(key);
      }
    });
  }
}

module.exports = {
  cache,
  CacheManager,
  MarketQuoteCache,
};
