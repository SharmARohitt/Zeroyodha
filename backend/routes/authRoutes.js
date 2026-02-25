/**
 * Authentication Routes - Dhan OAuth Integration
 * 
 * Implements OAuth 2.0 flow for Dhan API token acquisition.
 * 
 * Flow:
 * 1. User clicks "Connect to Dhan"
 * 2. Frontend redirects to /auth/dhan/login
 * 3. Backend redirects to Dhan authorization URL
 * 4. User authorizes on Dhan
 * 5. Dhan redirects to /auth/dhan/callback with authorization code
 * 6. Backend exchanges code for access token
 * 7. Token stored securely
 * 8. Frontend redirected to success page with token status
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const { tokenManager } = require('../utils/tokenManager');
const { authMiddleware } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../utils/asyncHandler');
const { validateWebhook } = require('../middleware/webhookValidator');

const OAUTH_STATE_SECRET = process.env.OAUTH_STATE_SECRET || process.env.DHAN_CLIENT_SECRET || 'dhan-oauth-state-secret';

const createOAuthState = (payload) => {
  const jsonPayload = JSON.stringify(payload);
  const encodedPayload = Buffer.from(jsonPayload).toString('base64url');
  const signature = crypto
    .createHmac('sha256', OAUTH_STATE_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  return `${encodedPayload}.${signature}`;
};

const parseOAuthState = (stateToken) => {
  const [encodedPayload, providedSignature] = String(stateToken || '').split('.');

  if (!encodedPayload || !providedSignature) {
    throw new Error('Invalid OAuth state format');
  }

  const expectedSignature = crypto
    .createHmac('sha256', OAUTH_STATE_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  if (providedSignature !== expectedSignature) {
    throw new Error('OAuth state signature mismatch');
  }

  const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));

  if (!payload.userId || !payload.issuedAt) {
    throw new Error('OAuth state payload missing required fields');
  }

  const ageMs = Date.now() - payload.issuedAt;
  if (ageMs > 10 * 60 * 1000) {
    throw new Error('OAuth state expired');
  }

  return payload;
};

/**
 * @route   GET /auth/dhan/login
 * @desc    Initiate Dhan OAuth login
 * @access  Private (requires Firebase authentication)
 * @param   {string} redirectUrl - (optional) URL to redirect after successful auth
 * 
 * Flow:
 * 1. Generate state token (CSRF protection)
 * 2. Redirect to Dhan authorization URL
 * 3. User authorizes on Dhan's platform
 */
router.get('/dhan/login', authMiddleware, asyncHandler(async (req, res) => {
  try {
    // Get required OAuth parameters from environment
    const DHAN_CLIENT_ID = process.env.DHAN_CLIENT_ID;
    const DHAN_OAUTH_URL = process.env.DHAN_OAUTH_URL || 'https://api.dhan.co/v2/oauth/authorize';
    const REDIRECT_URI = process.env.DHAN_OAUTH_CALLBACK_URL || 
                         `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/auth/dhan/callback`;

    // Validate configuration
    if (!DHAN_CLIENT_ID || !DHAN_OAUTH_URL) {
      console.error('❌ Dhan OAuth not configured');
      return res.status(500).json({
        success: false,
        error: 'Configuration Error',
        message: 'Dhan OAuth is not properly configured',
        code: 'DHAN_OAUTH_CONFIG_MISSING',
      });
    }

    // Get optional redirect URL for post-auth
    const redirectUrl = req.query.redirectUrl || '/'; // Default to home

    // Signed state token (CSRF + user binding + expiry)
    const state = createOAuthState({
      nonce: crypto.randomBytes(16).toString('hex'),
      userId: req.user.uid,
      redirectUrl,
      issuedAt: Date.now(),
    });

    console.log(`🔐 OAuth session created for user: ${req.user.uid.substring(0, 8)}...`);

    // Construct Dhan authorization URL
    const authUrl = new URL(DHAN_OAUTH_URL);
    authUrl.searchParams.append('client_id', DHAN_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', 'trading'); // Request trading scope

    console.log(`📍 Redirecting to Dhan OAuth: ${authUrl.origin}`);

    // Redirect to Dhan authorization
    res.status(302).redirect(authUrl.toString());
  } catch (error) {
    console.error('❌ OAuth login error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to initiate OAuth login',
      code: 'OAUTH_LOGIN_FAILED',
    });
  }
}));

/**
 * @route   GET /auth/dhan/callback
 * @desc    Dhan OAuth callback - exchange code for token
 * @access  Public (called by Dhan, not frontend)
 * @param   {string} code - Authorization code from Dhan
 * @param   {string} state - State token for CSRF validation
 * 
 * Flow:
 * 1. Validate state token
 * 2. Exchange code for access token
 * 3. Store token securely
 * 4. Redirect to frontend with success/error
 */
router.get('/dhan/callback', asyncHandler(async (req, res) => {
  try {
    const { code, state } = req.query;

    // Validate required parameters
    if (!code || !state) {
      console.error('❌ Missing OAuth parameters: code or state');
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Missing authorization code or state parameter',
        code: 'OAUTH_PARAMS_MISSING',
      });
    }

    const stateData = parseOAuthState(state);
    console.log(`🔄 OAuth callback received for state: ${String(state).substring(0, 8)}...`);

    // Get OAuth configuration
    const DHAN_CLIENT_ID = process.env.DHAN_CLIENT_ID;
    const DHAN_CLIENT_SECRET = process.env.DHAN_CLIENT_SECRET;
    const DHAN_TOKEN_URL = process.env.DHAN_TOKEN_URL || 'https://api.dhan.co/v2/oauth/token';
    const REDIRECT_URI = process.env.DHAN_OAUTH_CALLBACK_URL || 
                         `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/auth/dhan/callback`;

    // Validate configuration
    if (!DHAN_CLIENT_ID || !DHAN_CLIENT_SECRET || !DHAN_TOKEN_URL) {
      console.error('❌ Dhan OAuth token exchange not configured');
      return res.status(500).json({
        success: false,
        error: 'Configuration Error',
        message: 'OAuth token exchange is not configured',
        code: 'DHAN_TOKEN_EXCHANGE_CONFIG_MISSING',
      });
    }

    // Exchange authorization code for access token
    console.log('🔄 Exchanging authorization code for access token...');
    
    const tokenResponse = await axios.post(DHAN_TOKEN_URL, {
      grant_type: 'authorization_code',
      code,
      client_id: DHAN_CLIENT_ID,
      client_secret: DHAN_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    const tokenData = tokenResponse.data;

    // Validate token response
    if (!tokenData.access_token) {
      console.error('❌ No access token in Dhan response');
      return res.status(500).json({
        success: false,
        error: 'Token Exchange Failed',
        message: 'Dhan API did not return an access token',
        code: 'DHAN_TOKEN_EXCHANGE_FAILED',
      });
    }

    console.log('✅ Access token received from Dhan');

    const userId = stateData.userId;

    // Store token for authenticated user
    tokenManager.storeToken(userId, {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || null,
      expiresIn: tokenData.expires_in || 3600,
    });

    console.log(`✅ Token stored for user: ${userId.substring(0, 8)}...`);

    // Redirect to frontend success page
    const redirectUrl = stateData.redirectUrl || '/trading';
    const frontendUrl = process.env.FRONTEND_URL || 'exp://192.168.1.100:8081';
    
    res.status(302).redirect(
      `${frontendUrl}/${redirectUrl}?oauth=dhan&status=success`
    );
  } catch (error) {
    console.error('❌ OAuth callback error:', error.message);
    
    // Redirect to frontend error page
    const frontendUrl = process.env.FRONTEND_URL || 'exp://192.168.1.100:8081';
    const errorMessage = encodeURIComponent(error.message || 'Authentication failed');
    
    res.status(302).redirect(
      `${frontendUrl}/?oauth=dhan&status=error&error=${errorMessage}`
    );
  }
}));

/**
 * @route   GET /auth/dhan/token-status
 * @desc    Check Dhan token status
 * @access  Private (requires Firebase auth)
 */
router.get('/dhan/token-status', authMiddleware, asyncHandler(async (req, res) => {
  try {
    const userId = req.user.uid;
    const status = tokenManager.getTokenStatus(userId);

    if (!status) {
      return res.status(401).json({
        success: false,
        error: 'Not Connected',
        message: 'Dhan account not connected. Please authorize first.',
        code: 'DHAN_NOT_CONNECTED',
      });
    }

    res.status(200).json({
      success: true,
      connected: status.isValid,
      expiresIn: status.expiresIn,
      expiresAt: status.expiresAt,
      issuedAt: status.issuedAt,
      needsRefresh: status.expiresIn < 300, // 5 minutes
    });
  } catch (error) {
    console.error('❌ Token status check error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to check token status',
      code: 'TOKEN_STATUS_CHECK_FAILED',
    });
  }
}));

/**
 * @route   POST /auth/dhan/logout
 * @desc    Disconnect Dhan account (invalidate token)
 * @access  Private (requires Firebase auth)
 */
router.post('/dhan/logout', authMiddleware, asyncHandler(async (req, res) => {
  try {
    const userId = req.user.uid;
    
    tokenManager.invalidateToken(userId);

    console.log(`✅ Dhan token invalidated for user: ${userId.substring(0, 8)}...`);

    res.status(200).json({
      success: true,
      message: 'Successfully disconnected from Dhan',
    });
  } catch (error) {
    console.error('❌ Logout error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to logout',
      code: 'LOGOUT_FAILED',
    });
  }
}));

/**
 * @route   POST /webhook/dhan/order-update
 * @desc    Receive order status updates from Dhan
 * @access  Public (authenticated via webhook signature)
 * 
 * Webhook headers from Dhan:
 * - X-Signature: HMAC-SHA256 hash of body
 * - X-Timestamp: Request timestamp
 * 
 * Used for:
 * - Real-time order status updates
 * - Trade confirmations
 * - Execution reports
 */
router.post('/webhook/dhan/order-update', validateWebhook, asyncHandler(async (req, res) => {
  try {
    const webhookData = req.body;

    // Log webhook event (without exposing sensitive data)
    console.log('📨 Webhook received from Dhan');
    console.log(`   Event: ${webhookData.event_type || 'UNKNOWN'}`);
    console.log(`   Status: ${webhookData.status || 'UNKNOWN'}`);

    // Process webhook based on event type
    switch (webhookData.event_type) {
      case 'ORDER_PLACED':
        console.log(`✅ Order placed: ${webhookData.order_id}`);
        // Update order status in database
        // Notify user via push notification
        break;

      case 'ORDER_EXECUTED':
        console.log(`✅ Order executed: ${webhookData.order_id}`);
        // Update order status
        // Notify user of execution
        break;

      case 'ORDER_REJECTED':
        console.log(`❌ Order rejected: ${webhookData.order_id} - ${webhookData.reason}`);
        // Update order status
        // Notify user of rejection
        break;

      case 'ORDER_CANCELLED':
        console.log(`❌ Order cancelled: ${webhookData.order_id}`);
        // Update order status
        // Notify user
        break;

      default:
        console.log(`⚠️  Unknown webhook event: ${webhookData.event_type}`);
    }

    // Always respond with 200 immediately
    // Process asynchronously if needed
    res.status(200).json({
      success: true,
      message: 'Webhook received',
      webhook_id: webhookData.webhook_id || 'unknown',
    });

    // Example: Emit socket event to connected clients
    // io.emit('order-update', webhookData);
    
    // Example: Update database
    // db.collection('webhooks').insertOne({
    //   eventType: webhookData.event_type,
    //   data: webhookData,
    //   receivedAt: new Date(),
    // });

  } catch (error) {
    console.error('❌ Webhook processing error:', error.message);
    
    // Still return 200 to acknowledge receipt
    res.status(200).json({
      success: false,
      message: 'Webhook received but processing failed',
      error: error.message,
    });
  }
}));

/**
 * @route   GET /webhook/health
 * @desc    Check webhook endpoint health
 * @access  Public
 */
router.get('/webhook/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Webhook endpoint is healthy',
    webhookSignatureName: 'X-Signature',
    webhookTimestampName: 'X-Timestamp',
    supportedEvents: [
      'ORDER_PLACED',
      'ORDER_EXECUTED',
      'ORDER_REJECTED',
      'ORDER_CANCELLED',
      'POSITION_UPDATED',
      'FUNDS_UPDATED',
    ],
  });
});

module.exports = router;
