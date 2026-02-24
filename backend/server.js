/**
 * Zeroyodha Backend Server
 * 
 * This Express server provides secure API endpoints for the Zeroyodha mobile app.
 * It handles Firebase authentication and proxies requests to the Dhan Trading API.
 * 
 * Architecture:
 * Mobile App (Firebase Auth) -> Backend Server (Token Verification) -> Dhan API
 * 
 * Security Features:
 * - Firebase Admin SDK for token verification
 * - CORS protection
 * - Helmet for security headers
 * - Rate limiting to prevent abuse
 * - Input validation
 * - Response caching
 * - Environment variable based configuration
 * - No credentials exposed to frontend
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const os = require('os');

// Load environment variables
dotenv.config();

// Import configuration and middleware
const { initializeFirebaseAdmin } = require('./config/firebaseAdmin');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const marketRoutes = require('./routes/marketRoutes');
const authRoutes = require('./routes/authRoutes');

// Import utils
const { getHealthStatus } = require('./utils/healthMonitor');

// Initialize Express app
const app = express();

// ============================================================================
// SECURITY & MIDDLEWARE SETUP
// ============================================================================

// Security headers with stricter settings for production
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
    },
  },
  frameguard: {
    action: 'deny', // Prevent clickjacking
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
  },
  noSniff: true, // Disable MIME type sniffing
  xssFilter: true, // Enable XSS protection
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// Disable x-powered-by header
app.disable('x-powered-by');

// Trust proxy (important for Render and other services)
app.set('trust proxy', 1);

// Request logging with enhanced format
const morganFormat = process.env.NODE_ENV === 'development'
  ? 'dev'
  : 'combined'; // Combined format includes more details for production

app.use(morgan(morganFormat, {
  // Skip logging for health checks to reduce noise
  skip: (req, res) => req.path === '/health' || req.path === '/api/system/status',
  // Custom error logging
  stream: {
    write: (message) => {
      // Log errors with context (optional: send to external logging service)
      console.log(message.trim());
    },
  },
}));

// Parse JSON bodies with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:8081', 'http://localhost:19000', 'http://localhost:19006'];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
}));

// ============================================================================
// INITIALIZE FIREBASE ADMIN
// ============================================================================

let firebaseHealthy = false;

try {
  initializeFirebaseAdmin();
  firebaseHealthy = true;
  console.log('✅ Firebase Admin initialized');
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
  console.error('   Backend will start but authentication will not work.');
  console.error('   Please configure Firebase Admin credentials in .env file.');
}

// ============================================================================
// HEALTH CHECK ROUTES (No authentication required)
// ============================================================================

/**
 * @route   GET /
 * @desc    Root endpoint - API information
 * @access  Public
 */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Zeroyodha Backend API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      systemStatus: '/api/system/status',
      api: '/api',
      market: '/api/market',
    },
    documentation: 'See README.md for API documentation',
  });
});

/**
 * @route   GET /health
 * @desc    Quick health check endpoint
 * @access  Public
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
  });
});

/**
 * @route   GET /api/system/status
 * @desc    Comprehensive system health status
 * @access  Public (available without auth for monitoring)
 */
app.get('/api/system/status', async (req, res) => {
  try {
    const healthStatus = await getHealthStatus();
    
    // Return 200 even if degraded, 503 only if completely down
    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json(healthStatus);
  } catch (error) {
    console.error('Error getting health status:', error);
    res.status(503).json({
      success: false,
      status: 'error',
      message: 'Unable to determine system health',
      timestamp: new Date().toISOString(),
    });
  }
});

// ============================================================================
// API ROUTES (Rate Limited & Authentication required)
// ============================================================================

// Apply rate limiting to all /api routes
app.use('/api/market', apiLimiter, marketRoutes);
app.use('/api/auth', authRoutes); // Auth routes (rate limiting optional per route)

// Add more route groups here as needed:
// app.use('/api/trading', apiLimiter, tradingRoutes);
// app.use('/api/user', apiLimiter, userRoutes);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// ============================================================================
// START SERVER
// ============================================================================

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Listen on all network interfaces

const server = app.listen(PORT, HOST, () => {
  console.log('');
  console.log('=================================================');
  console.log('🚀 Zeroyodha Backend Server Started');
  console.log('=================================================');
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🌍 Host: ${HOST}:${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Firebase: ${firebaseHealthy ? 'Initialized' : 'Not configured (auth will fail)'}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log('=================================================');
  console.log('');
  console.log('Available endpoints:');
  console.log('  GET  /              - API information');
  console.log('  GET  /health        - Health check (no auth)');
  console.log('  GET  /api/system/status - System health monitoring');
  console.log('');
  console.log('  GET  /api/market/quote?symbol=RELIANCE');
  console.log('  GET  /api/market/holdings');
  console.log('  GET  /api/market/positions');
  console.log('  GET  /api/market/funds');
  console.log('  POST /api/market/order');
  console.log('  GET  /api/market/orders');
  console.log('');
  console.log('  GET  /api/auth/dhan/login - Initiate Dhan OAuth');
  console.log('  GET  /api/auth/dhan/callback - OAuth callback (from Dhan)');
  console.log('  GET  /api/auth/dhan/token-status - Check token status');
  console.log('  POST /api/auth/dhan/logout - Disconnect Dhan');
  console.log('  POST /api/webhook/dhan/order-update - Dhan webhooks');
  console.log('');
  console.log('Rate Limiting: 100 requests/15 min per IP');
  console.log('Security: Helmet + CORS protection enabled');
  console.log('Caching: Quote caching enabled (10s TTL)');
  console.log('=================================================');
});

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Don't exit in production, just log the error
  if (process.env.NODE_ENV === 'development') {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown on SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Graceful shutdown on SIGINT
process.on('SIGINT', () => {
  console.log('👋 SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log('=================================================');
  console.log('');
  console.log('Available endpoints:');
  console.log('  GET  /              - API information');
  console.log('  GET  /health        - Health check');
  console.log('  GET  /api/market/quote?symbol=RELIANCE');
  console.log('  GET  /api/market/holdings');
  console.log('  GET  /api/market/positions');
  console.log('  GET  /api/market/funds');
  console.log('  POST /api/market/order');
  console.log('  GET  /api/market/orders');
  console.log('');
  console.log('Note: All /api/* routes require Firebase authentication');
  console.log('      Include: Authorization: Bearer <firebase-id-token>');
  console.log('=================================================');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Don't exit in production, just log the error
  if (process.env.NODE_ENV === 'development') {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT signal received: closing HTTP server');
  process.exit(0);
});

module.exports = app;
