/**
 * Authentication Middleware
 * 
 * This middleware validates Firebase ID tokens from incoming requests.
 * It ensures that only authenticated users can access protected routes.
 * 
 * Flow:
 * 1. Extract token from Authorization header
 * 2. Verify token using Firebase Admin SDK
 * 3. Attach decoded user info to req.user
 * 4. Allow request to proceed or reject with 401
 * 
 * Token Manager Integration:
 * - For Dhan API tokens, see utils/tokenManager.js
 * - Dhan tokens are stored per-user after OAuth authorization
 * - Use tokenManager.getToken(userId) to access Dhan API token
 * 
 * Usage:
 * app.get('/protected-route', authMiddleware, (req, res) => {
 *   console.log(req.user.uid); // Firebase user ID
 *   // Use req.user.uid with tokenManager to get Dhan API token
 *   const dhanToken = tokenManager.getToken(req.user.uid);
 * });
 */

const { verifyIdToken } = require('../config/firebaseAdmin');
const { tokenManager } = require('../utils/tokenManager');

/**
 * Middleware to authenticate requests using Firebase ID tokens
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Extract Authorization header
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'No authorization header provided',
        code: 'AUTH_HEADER_MISSING',
      });
    }

    // Check if it follows Bearer token format
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid authorization header format. Expected: Bearer <token>',
        code: 'AUTH_HEADER_INVALID_FORMAT',
      });
    }

    // Extract token (remove "Bearer " prefix)
    const idToken = authHeader.substring(7);

    // Check if token is not empty
    if (!idToken || idToken.trim() === '') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Token is empty',
        code: 'TOKEN_EMPTY',
      });
    }

    // Verify token using Firebase Admin SDK
    const decodedToken = await verifyIdToken(idToken);

    // Attach user info to request object for use in route handlers
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      name: decodedToken.name,
      picture: decodedToken.picture,
      // Full decoded token available if needed
      decodedToken: decodedToken,
      // Dhan API token (if available)
      dhanToken: tokenManager.getToken(decodedToken.uid),
      dhanTokenStatus: tokenManager.getTokenStatus(decodedToken.uid),
    };

    // Log successful authentication (optional, remove in production for performance)
    console.log(`✅ Authenticated user: ${req.user.email} (${req.user.uid})`);
    if (req.user.dhanToken) {
      console.log(`   Dhan API: Connected`);
    }

    // Proceed to next middleware or route handler
    next();

  } catch (error) {
    // Handle specific Firebase errors
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Token has expired. Please sign in again.',
        code: 'TOKEN_EXPIRED',
      });
    }

    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Token has been revoked. Please sign in again.',
        code: 'TOKEN_REVOKED',
      });
    }

    if (error.code === 'auth/argument-error') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid token format',
        code: 'TOKEN_INVALID_FORMAT',
      });
    }

    // Check if error is a Dhan API 401 (invalid Dhan token/credentials)
    if (error.message?.includes('401') || error.statusCode === 401) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication failed. Please contact support.',
        code: 'AUTH_FAILED_DHAN_TOKEN',
      });
    }

    // Generic token validation error
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Token verification failed',
      code: 'TOKEN_VERIFICATION_FAILED',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Optional middleware to check if user's email is verified
 * Use this for routes that require email verification
 * 
 * Usage:
 * app.get('/protected', authMiddleware, requireEmailVerified, (req, res) => {
 *   // Only verified users can access
 * });
 */
const requireEmailVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Authentication required',
      code: 'AUTH_REQUIRED',
    });
  }

  if (!req.user.emailVerified) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'Email verification required. Please verify your email to access this resource.',
      code: 'EMAIL_NOT_VERIFIED',
    });
  }

  next();
};

module.exports = {
  authMiddleware,
  requireEmailVerified,
};
