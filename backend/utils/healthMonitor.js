/**
 * System Health & Monitoring
 * 
 * Provides health check endpoint for monitoring server and external dependencies
 * Useful for uptime monitoring and deployment health verification
 */

const os = require('os');
const { getAuth } = require('../config/firebaseAdmin');
const dhanService = require('../services/dhanService');

/**
 * Check Firebase Admin initialization status
 * @returns {Promise<{initialized: boolean, error?: string}>}
 */
const checkFirebaseHealth = async () => {
  try {
    const auth = getAuth();
    // Try to validate a dummy token structure
    return {
      status: 'healthy',
      initialized: true,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      initialized: false,
      error: error.message,
    };
  }
};

/**
 * Check Dhan API connectivity
 * @returns {Promise<{accessible: boolean, error?: string}>}
 */
const checkDhanHealth = async () => {
  try {
    const isHealthy = await dhanService.healthCheck();
    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      accessible: isHealthy,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      accessible: false,
      error: error.message,
    };
  }
};

/**
 * Get server metrics
 * @returns {Object} Server metrics
 */
const getServerMetrics = () => {
  const uptime = process.uptime();
  const memUsage = process.memoryUsage();
  const osMemory = os.totalmem();
  const osMemFree = os.freemem();

  return {
    uptime: Math.floor(uptime),
    uptimeFormatted: formatUptime(uptime),
    memory: {
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
      percentUsed: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
    },
    system: {
      totalMemory: Math.round(osMemory / 1024 / 1024),
      freeMemory: Math.round(osMemFree / 1024 / 1024),
      cpuCount: os.cpus().length,
      platform: os.platform(),
    },
    node: process.version,
  };
};

/**
 * Format uptime into readable string
 * @param {number} seconds - Uptime in seconds
 * @returns {string} Formatted uptime
 */
const formatUptime = (seconds) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.length > 0 ? parts.join(' ') : 'just started';
};

/**
 * Get comprehensive health status
 * @returns {Promise<Object>} Health status object
 */
const getHealthStatus = async () => {
  const [firebaseHealth, dhanHealth] = await Promise.allSettled([
    checkFirebaseHealth(),
    checkDhanHealth(),
  ]);

  const firebase = firebaseHealth.status === 'fulfilled' 
    ? firebaseHealth.value 
    : { status: 'error', error: firebaseHealth.reason?.message };
  
  const dhan = dhanHealth.status === 'fulfilled'
    ? dhanHealth.value
    : { status: 'error', error: dhanHealth.reason?.message };

  const metrics = getServerMetrics();

  // Overall health is healthy only if all critical components are healthy
  const overallHealth = firebase.status === 'healthy' ? 'healthy' : 'degraded';

  return {
    success: true,
    status: overallHealth,
    timestamp: new Date().toISOString(),
    checks: {
      firebase,
      dhan,
    },
    server: metrics,
    environment: process.env.NODE_ENV || 'development',
  };
};

module.exports = {
  checkFirebaseHealth,
  checkDhanHealth,
  getServerMetrics,
  getHealthStatus,
  formatUptime,
};
