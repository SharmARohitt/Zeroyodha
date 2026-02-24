/**
 * Backend API Service
 * 
 * This service handles all communication with the backend API server.
 * It automatically includes Firebase authentication tokens in requests.
 * 
 * Usage:
 * import { getMarketQuote, getHoldings } from '@/services/backendApiService';
 * 
 * const quote = await getMarketQuote('RELIANCE');
 * const holdings = await getHoldings();
 */

import Constants from 'expo-constants';
import { getAuth } from 'firebase/auth';

// Get API base URL from environment variables
const getApiBaseUrl = (): string => {
  const envUrl = 
    process.env.EXPO_PUBLIC_BACKEND_URL ||
    Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL;

  // Default to localhost for development
  if (!envUrl) {
    console.warn('⚠️  EXPO_PUBLIC_BACKEND_URL not set, using localhost');
    return 'http://localhost:3000/api';
  }

  return envUrl;
};

const API_BASE_URL = getApiBaseUrl();

console.log('🔗 Backend API URL:', API_BASE_URL);

/**
 * Get Firebase ID token for the current user
 * @returns {Promise<string>} Firebase ID token
 * @throws {Error} If user is not authenticated
 */
const getAuthToken = async (): Promise<string> => {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('User not authenticated. Please sign in first.');
  }

  try {
    // Get fresh token (Firebase handles caching internally)
    const token = await currentUser.getIdToken();
    return token;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    throw new Error('Failed to get authentication token');
  }
};

/**
 * Generic API request handler with authentication
 * @param {string} endpoint - API endpoint (e.g., '/market/quote')
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<any>} Response data
 */
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  try {
    // Get auth token
    const token = await getAuthToken();

    // Build full URL
    const url = `${API_BASE_URL}${endpoint}`;

    // Make request with auth header
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    // Parse response
    const data = await response.json();

    // Check for errors
    if (!response.ok) {
      throw new Error(data.error || data.message || 'API request failed');
    }

    return data;
  } catch (error: any) {
    console.error('API Request Error:', {
      endpoint,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Get real-time market quote for a symbol
 * @param {string} symbol - Stock symbol (e.g., 'RELIANCE', 'TCS')
 * @param {string} exchange - Exchange (optional, default: NSE)
 * @returns {Promise<any>} Quote data
 */
export const getMarketQuote = async (
  symbol: string,
  exchange: string = 'NSE'
): Promise<any> => {
  const params = new URLSearchParams({ symbol, exchange });
  return apiRequest(`/market/quote?${params.toString()}`);
};

/**
 * Get user's holdings from Dhan account
 * @returns {Promise<any>} Holdings data
 */
export const getHoldings = async (): Promise<any> => {
  return apiRequest('/market/holdings');
};

/**
 * Get user's open positions
 * @returns {Promise<any>} Positions data
 */
export const getPositions = async (): Promise<any> => {
  return apiRequest('/market/positions');
};

/**
 * Get user's funds/margin information
 * @returns {Promise<any>} Funds data
 */
export const getFunds = async (): Promise<any> => {
  return apiRequest('/market/funds');
};

/**
 * Get order history
 * @returns {Promise<any>} Orders data
 */
export const getOrders = async (): Promise<any> => {
  return apiRequest('/market/orders');
};

/**
 * Place a new order
 * @param {Object} orderData - Order details
 * @returns {Promise<any>} Order confirmation
 */
export const placeOrder = async (orderData: {
  transactionType: 'BUY' | 'SELL';
  securityId: string;
  quantity: number;
  exchange?: string;
  productType?: string;
  orderType?: string;
  price?: number;
  triggerPrice?: number;
}): Promise<any> => {
  return apiRequest('/market/order', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
};

/**
 * Check backend and Dhan API health
 * @returns {Promise<any>} Health status
 */
export const checkApiHealth = async (): Promise<any> => {
  return apiRequest('/market/health');
};

/**
 * Test backend connectivity (public endpoint, no auth required)
 * @returns {Promise<boolean>} True if backend is reachable
 */
export const testBackendConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return false;
  }
};

export default {
  apiRequest,
  getMarketQuote,
  getHoldings,
  getPositions,
  getFunds,
  getOrders,
  placeOrder,
  checkApiHealth,
  testBackendConnection,
};
