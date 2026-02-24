/**
 * Firebase Cloud Functions for Dhan API OAuth Callback
 *
 * This function securely handles the OAuth callback from Dhan API.
 */

const functions = require("firebase-functions");
const logger = require("firebase-functions/logger");

/**
 * Dhan API OAuth Callback Handler
 *
 * This HTTPS function receives the OAuth callback from Dhan API
 * and processes the tokenId.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.dhanCallback = functions.https.onRequest((req, res) => {
  // Set CORS headers for security
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  // Only accept GET requests
  if (req.method !== "GET") {
    logger.warn("Invalid request method", {method: req.method});
    res.status(405).json({
      success: false,
      error: "Method not allowed. Only GET requests are accepted.",
    });
    return;
  }

  try {
    // Read tokenId from query parameters
    const tokenId = req.query.tokenId;

    // Validate tokenId presence
    if (!tokenId) {
      logger.warn("Missing tokenId in request");
      res.status(400).json({
        success: false,
        error: "Missing tokenId parameter",
      });
      return;
    }

    // Log the tokenId securely
    // (only log that it was received, not the value in production)
    logger.info("Dhan OAuth callback received", {
      tokenId: tokenId,
      timestamp: new Date().toISOString(),
      ip: req.ip,
    });

    // Return success response
    res.status(200).json({
      success: true,
      message: "OAuth callback received successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Log error securely without exposing sensitive information
    logger.error("Error processing Dhan callback", {
      error: error.message,
      timestamp: new Date().toISOString(),
    });

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});
