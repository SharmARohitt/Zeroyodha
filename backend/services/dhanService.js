/**
 * Dhan API Service Layer
 * 
 * This service handles all interactions with the Dhan Trading API.
 * It provides a clean interface for market data and trading operations.
 * 
 * Security:
 * - API credentials stored in environment variables
 * - Never expose credentials to frontend
 * - All requests go through backend authentication
 * 
 * API Documentation: https://dhanhq.co/docs/
 */

const axios = require('axios');

class DhanService {
  constructor() {
    this.clientId = process.env.DHAN_CLIENT_ID;
    this.accessToken = process.env.DHAN_ACCESS_TOKEN;
    this.baseUrl = process.env.DHAN_API_BASE_URL || 'https://api.dhan.co/v2';

    // Validate required credentials
    if (!this.clientId || !this.accessToken) {
      console.warn('⚠️  Dhan API credentials not configured. Set DHAN_CLIENT_ID and DHAN_ACCESS_TOKEN in .env');
    }

    // Create axios instance with default config
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000, // 10 seconds
      headers: {
        'Content-Type': 'application/json',
        'access-token': this.accessToken,
      },
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`📡 Dhan API Request: ${config.method.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Dhan API Request Error:', error.message);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ Dhan API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('❌ Dhan API Response Error:', error.response?.status, error.message);
        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Handle and format API errors
   * @param {Error} error - Axios error object
   * @returns {Error} Formatted error
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      const formattedError = new Error(
        data.message || data.error || 'Dhan API request failed'
      );
      formattedError.statusCode = status;
      formattedError.code = data.code || 'DHAN_API_ERROR';
      formattedError.details = data;
      
      return formattedError;
    } else if (error.request) {
      // Request made but no response received
      const formattedError = new Error('No response from Dhan API server');
      formattedError.statusCode = 503;
      formattedError.code = 'DHAN_API_NO_RESPONSE';
      return formattedError;
    } else {
      // Error in setting up request
      const formattedError = new Error('Failed to create Dhan API request');
      formattedError.statusCode = 500;
      formattedError.code = 'DHAN_API_REQUEST_SETUP_ERROR';
      return formattedError;
    }
  }

  /**
   * Get market quote for a symbol
   * @param {string} symbol - Stock symbol (e.g., 'RELIANCE', 'TCS')
   * @param {string} exchange - Exchange (NSE, BSE, MCX, etc.)
   * @returns {Promise<Object>} Market quote data
   */
  async getMarketQuote(symbol, exchange = 'NSE') {
    try {
      // Validate inputs
      if (!symbol) {
        throw new Error('Symbol is required');
      }

      // Dhan API endpoint for market quotes
      // Note: Adjust endpoint based on actual Dhan API documentation
      const response = await this.client.get('/marketfeed/quote', {
        params: {
          symbol: symbol.toUpperCase(),
          exchange: exchange.toUpperCase(),
        },
      });

      // Return clean, structured data
      return {
        success: true,
        data: {
          symbol: response.data.symbol,
          exchange: response.data.exchange,
          lastPrice: response.data.last_price || response.data.ltp,
          change: response.data.change,
          changePercent: response.data.change_percent || response.data.pChange,
          volume: response.data.volume,
          open: response.data.open,
          high: response.data.high,
          low: response.data.low,
          prevClose: response.data.prev_close || response.data.close,
          timestamp: response.data.timestamp || new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Get holdings for the authenticated user
   * @returns {Promise<Object>} User holdings
   */
  async getHoldings() {
    try {
      const response = await this.client.get('/holdings');
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching holdings:', error.message);
      throw error;
    }
  }

  /**
   * Get positions for the authenticated user
   * @returns {Promise<Object>} User positions
   */
  async getPositions() {
    try {
      const response = await this.client.get('/positions');
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching positions:', error.message);
      throw error;
    }
  }

  /**
   * Place an order
   * @param {Object} orderData - Order details
   * @returns {Promise<Object>} Order confirmation
   */
  async placeOrder(orderData) {
    try {
      const response = await this.client.post('/orders', {
        dhanClientId: this.clientId,
        transactionType: orderData.transactionType, // BUY or SELL
        exchangeSegment: orderData.exchange || 'NSE_EQ',
        productType: orderData.productType || 'INTRADAY',
        orderType: orderData.orderType || 'MARKET',
        validity: orderData.validity || 'DAY',
        securityId: orderData.securityId,
        quantity: orderData.quantity,
        price: orderData.price || 0,
        triggerPrice: orderData.triggerPrice || 0,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error placing order:', error.message);
      throw error;
    }
  }

  /**
   * Get order history
   * @returns {Promise<Object>} Order history
   */
  async getOrders() {
    try {
      const response = await this.client.get('/orders');
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching orders:', error.message);
      throw error;
    }
  }

  /**
   * Get funds/margin information
   * @returns {Promise<Object>} Funds data
   */
  async getFunds() {
    try {
      const response = await this.client.get('/funds');
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching funds:', error.message);
      throw error;
    }
  }

  /**
   * Health check - verify API credentials are working
   * @returns {Promise<boolean>} True if API is accessible
   */
  async healthCheck() {
    try {
      // Try a simple API call to verify credentials
      await this.client.get('/funds');
      return true;
    } catch (error) {
      console.error('Dhan API health check failed:', error.message);
      return false;
    }
  }
}

// Export singleton instance
const dhanService = new DhanService();

module.exports = dhanService;
