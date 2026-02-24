/**
 * Webhook Validator Middleware
 * 
 * Validates incoming webhook requests from Dhan API.
 * Ensures requests are authentic and haven't been tampered with.
 * 
 * Security Features:
 * - Webhook secret validation (HMAC-SHA256)
 * - IP whitelist (optional)
 * - Request signature verification
 * - Replay attack prevention (timestamp check)
 */

const crypto = require('crypto');

/**
 * Validates webhook secret signature
 * Dhan will include X-Signature header with HMAC-SHA256 hash
 * 
 * Implementation:
 * const signature = HMAC-SHA256(request_body, webhook_secret)
 * Include as header: X-Signature: signature
 */
const validateWebhookSignature = (req, res, next) => {
  const webhookSecret = process.env.DHAN_WEBHOOK_SECRET;

  // Skip validation if secret not configured
  if (!webhookSecret) {
    console.warn('⚠️  DHAN_WEBHOOK_SECRET not configured. Webhook signature validation skipped.');
    return next();
  }

  try {
    const signature = req.headers['x-signature'];
    
    if (!signature) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Webhook signature missing (X-Signature header)',
        code: 'WEBHOOK_SIGNATURE_MISSING',
      });
    }

    // Calculate expected signature from request body
    const bodyString = typeof req.body === 'string' 
      ? req.body 
      : JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(bodyString, 'utf8')
      .digest('hex');

    // Constant-time comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );

    if (!isValid) {
      console.warn('⚠️  Invalid webhook signature');
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid webhook signature',
        code: 'WEBHOOK_SIGNATURE_INVALID',
      });
    }

    console.log('✅ Webhook signature validated');
    next();
  } catch (error) {
    console.error('❌ Webhook signature validation error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to validate webhook signature',
      code: 'WEBHOOK_VALIDATION_ERROR',
    });
  }
};

/**
 * Validates webhook timestamp to prevent replay attacks
 * Dhan includes X-Timestamp header with request timestamp
 * Reject requests older than 5 minutes
 */
const validateWebhookTimestamp = (req, res, next) => {
  try {
    const timestamp = req.headers['x-timestamp'];

    if (!timestamp) {
      console.warn('⚠️  Webhook timestamp missing');
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Webhook timestamp missing (X-Timestamp header)',
        code: 'WEBHOOK_TIMESTAMP_MISSING',
      });
    }

    const requestTime = parseInt(timestamp, 10);
    const currentTime = Math.floor(Date.now() / 1000);
    const maxAge = 5 * 60; // 5 minutes in seconds

    // Check if request is within acceptable time window
    if (Math.abs(currentTime - requestTime) > maxAge) {
      console.warn('⚠️  Webhook request too old or from future');
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Webhook request timestamp is invalid or expired',
        code: 'WEBHOOK_TIMESTAMP_INVALID',
      });
    }

    console.log(`✅ Webhook timestamp validated (age: ${currentTime - requestTime}s)`);
    next();
  } catch (error) {
    console.error('❌ Webhook timestamp validation error:', error.message);
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Invalid webhook timestamp format',
      code: 'WEBHOOK_TIMESTAMP_FORMAT_ERROR',
    });
  }
};

/**
 * Validates webhook IP address (optional security)
 * Add Dhan's IP addresses to whitelist for production
 * 
 * Dhan IPs (example, verify with Dhan):
 * - 203.0.113.0/24 (replace with actual Dhan IPs)
 */
const validateWebhookIP = (req, res, next) => {
  const allowedIPs = process.env.DHAN_WEBHOOK_IPS?.split(',') || [];

  // Skip if no IPs configured
  if (allowedIPs.length === 0) {
    return next();
  }

  try {
    const clientIP = req.ip || 
                     req.headers['x-forwarded-for']?.split(',')[0] ||
                     req.connection.remoteAddress;

    if (!allowedIPs.includes(clientIP)) {
      console.warn(`⚠️  Webhook from unauthorized IP: ${clientIP}`);
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Webhook request from unauthorized IP',
        code: 'WEBHOOK_IP_UNAUTHORIZED',
      });
    }

    console.log(`✅ Webhook IP authorized: ${clientIP}`);
    next();
  } catch (error) {
    console.error('❌ Webhook IP validation error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to validate webhook IP',
      code: 'WEBHOOK_IP_VALIDATION_ERROR',
    });
  }
};

/**
 * Complete webhook validation chain
 * Use: router.post('/webhook/dhan/order-update', validateWebhook, handler)
 */
const validateWebhook = [
  validateWebhookSignature,
  validateWebhookTimestamp,
  validateWebhookIP,
];

module.exports = {
  validateWebhookSignature,
  validateWebhookTimestamp,
  validateWebhookIP,
  validateWebhook, // Complete chain
};
