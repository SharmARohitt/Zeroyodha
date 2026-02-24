/**
 * Token Manager
 * 
 * Handles secure storage and management of Dhan API tokens.
 * Supports both in-memory storage (development) and future database storage (production).
 * 
 * Security:
 * - Tokens never logged
 * - Expiry tracking to prevent stale tokens
 * - Clean token refresh flow
 */

const crypto = require('crypto');

class TokenManager {
  constructor() {
    // In-memory token storage
    // In production, replace with database storage
    this.tokens = new Map();
    
    // Token refresh queue for automatic refresh
    this.refreshQueue = new Map();
    
    console.log('✅ Token Manager initialized (in-memory mode)');
  }

  /**
   * Generate a secure storage key for user tokens
   * @param {string} userId - Firebase user ID
   * @returns {string} Storage key
   */
  #generateStorageKey(userId) {
    return `token:${userId}`;
  }

  /**
   * Store Dhan API token for a user
   * @param {string} userId - Firebase user ID
   * @param {object} tokenData - Token data from Dhan API
   * @param {string} tokenData.accessToken - Dhan access token
   * @param {number} tokenData.expiresIn - Token expiry time in seconds
   * @param {string} tokenData.refreshToken - (Optional) Refresh token
   */
  storeToken(userId, tokenData) {
    if (!userId || !tokenData.accessToken) {
      throw new Error('Invalid token data: userId and accessToken required');
    }

    const key = this.#generateStorageKey(userId);
    const expiresAt = Date.now() + (tokenData.expiresIn || 3600) * 1000;

    this.tokens.set(key, {
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken || null,
      expiresAt,
      issuedAt: Date.now(),
      isValid: true,
    });

    // Schedule expiry warning (5 minutes before actual expiry)
    this.#scheduleExpiryCheck(userId, expiresAt);

    console.log(`✅ Token stored for user: ${userId.substring(0, 8)}...`);
    console.log(`   Expires in: ${tokenData.expiresIn || 3600}s`);
  }

  /**
   * Retrieve valid token for user
   * @param {string} userId - Firebase user ID
   * @returns {string|null} Valid access token or null if expired/missing
   */
  getToken(userId) {
    const key = this.#generateStorageKey(userId);
    const token = this.tokens.get(key);

    if (!token) {
      return null;
    }

    // Check if token is expired
    if (token.expiresAt < Date.now()) {
      console.warn(`⚠️  Token for user ${userId.substring(0, 8)}... has expired`);
      this.tokens.delete(key);
      return null;
    }

    // Return token if still valid
    return token.accessToken;
  }

  /**
   * Get token status info (for debugging/monitoring)
   * @param {string} userId - Firebase user ID
   * @returns {object|null} Token metadata
   */
  getTokenStatus(userId) {
    const key = this.#generateStorageKey(userId);
    const token = this.tokens.get(key);

    if (!token) {
      return null;
    }

    const expiresIn = Math.max(0, token.expiresAt - Date.now());
    const isExpired = expiresIn === 0;

    return {
      isValid: !isExpired,
      expiresIn: Math.ceil(expiresIn / 1000), // seconds
      expiresAt: new Date(token.expiresAt).toISOString(),
      issuedAt: new Date(token.issuedAt).toISOString(),
      hasRefreshToken: !!token.refreshToken,
    };
  }

  /**
   * Refresh token for user
   * @param {string} userId - Firebase user ID
   * @param {function} refreshCallback - Callback to get new token
   * @returns {Promise<string>} New access token
   */
  async refreshToken(userId, refreshCallback) {
    const key = this.#generateStorageKey(userId);
    const token = this.tokens.get(key);

    if (!token || !token.refreshToken) {
      throw new Error('Cannot refresh token: no refresh token available');
    }

    try {
      console.log(`🔄 Refreshing token for user: ${userId.substring(0, 8)}...`);
      
      // Call the refresh callback (ideally from Dhan API)
      const newTokenData = await refreshCallback(token.refreshToken);

      // Store new token
      this.storeToken(userId, newTokenData);

      console.log(`✅ Token refreshed for user: ${userId.substring(0, 8)}...`);
      return newTokenData.accessToken;
    } catch (error) {
      console.error('❌ Token refresh failed:', error.message);
      // Mark token as invalid
      this.invalidateToken(userId);
      throw error;
    }
  }

  /**
   * Invalidate token (logout)
   * @param {string} userId - Firebase user ID
   */
  invalidateToken(userId) {
    const key = this.#generateStorageKey(userId);
    this.tokens.delete(key);
    
    // Cancel expiry check if scheduled
    if (this.refreshQueue.has(userId)) {
      clearTimeout(this.refreshQueue.get(userId));
      this.refreshQueue.delete(userId);
    }

    console.log(`🔐 Token invalidated for user: ${userId.substring(0, 8)}...`);
  }

  /**
   * Check if token is expired
   * @param {string} userId - Firebase user ID
   * @returns {boolean} True if token is expired
   */
  isTokenExpired(userId) {
    const status = this.getTokenStatus(userId);
    return status === null || !status.isValid;
  }

  /**
   * Schedule expiry check (private method)
   * @private
   * @param {string} userId - Firebase user ID
   * @param {number} expiresAt - Token expiry timestamp
   */
  #scheduleExpiryCheck(userId, expiresAt) {
    // Clear existing timeout if any
    if (this.refreshQueue.has(userId)) {
      clearTimeout(this.refreshQueue.get(userId));
    }

    // Schedule warning 5 minutes before expiry
    const warningTime = Math.max(0, expiresAt - Date.now() - 5 * 60 * 1000);
    
    if (warningTime > 0) {
      const timeoutId = setTimeout(() => {
        console.warn(`⚠️  Token for user ${userId.substring(0, 8)}... expires in 5 minutes`);
        this.refreshQueue.delete(userId);
      }, warningTime);

      this.refreshQueue.set(userId, timeoutId);
    }
  }

  /**
   * Get token statistics (for monitoring)
   * @returns {object} Statistics
   */
  getStats() {
    let validTokens = 0;
    let expiredTokens = 0;

    for (const token of this.tokens.values()) {
      if (token.expiresAt >= Date.now()) {
        validTokens++;
      } else {
        expiredTokens++;
      }
    }

    return {
      totalTokens: this.tokens.size,
      validTokens,
      expiredTokens,
      scheduledRefreshes: this.refreshQueue.size,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Cleanup expired tokens periodically (run in background)
   * Should be called every 1 hour or on demand
   */
  cleanupExpiredTokens() {
    let cleaned = 0;
    const now = Date.now();

    for (const [key, token] of this.tokens.entries()) {
      if (token.expiresAt < now) {
        this.tokens.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleanup: Removed ${cleaned} expired tokens`);
    }

    return cleaned;
  }

  /**
   * IMPORTANT: For production use, replace in-memory storage with database
   * Example implementation:
   * 
   * async storeToken(userId, tokenData) {
   *   await db.collection('user_tokens').updateOne(
   *     { userId },
   *     {
   *       $set: {
   *         accessToken: tokenData.accessToken, // Consider encryption
   *         refreshToken: tokenData.refreshToken,
   *         expiresAt: new Date(Date.now() + tokenData.expiresIn * 1000),
   *         issuedAt: new Date(),
   *       }
   *     },
   *     { upsert: true }
   *   );
   * }
   * 
   * async getToken(userId) {
   *   const tokenDoc = await db.collection('user_tokens').findOne({ userId });
   *   if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
   *     return null;
   *   }
   *   return tokenDoc.accessToken;
   * }
   */
}

// Create singleton instance
const tokenManager = new TokenManager();

module.exports = {
  TokenManager,
  tokenManager, // Singleton instance
};
