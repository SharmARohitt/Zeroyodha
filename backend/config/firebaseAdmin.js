/**
 * Firebase Admin SDK Configuration
 * 
 * This module initializes the Firebase Admin SDK for server-side operations.
 * It verifies Firebase ID tokens sent from the mobile app.
 * 
 * Security Notes:
 * - Service account credentials must NEVER be exposed to frontend
 * - Use environment variables or secure secret management
 * - In production, use Render's secret files or environment variables
 */

const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

let firebaseApp = null;

/**
 * Initialize Firebase Admin SDK
 * Supports two methods:
 * 1. Service account JSON file path (local development)
 * 2. Service account JSON string (production deployment)
 */
const initializeFirebaseAdmin = () => {
  try {
    // Check if already initialized
    if (firebaseApp) {
      console.log('Firebase Admin already initialized');
      return firebaseApp;
    }

    let serviceAccount;

    // Method 1: Load from JSON file (local development)
    if (process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH) {
      const serviceAccountPath = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH;
      serviceAccount = require(serviceAccountPath);
      console.log('Loading Firebase Admin from file:', serviceAccountPath);
    }
    // Method 2: Load from environment variable string (production)
    else if (process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
      serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT);
      console.log('Loading Firebase Admin from environment variable');
    }
    // Method 3: Individual environment variables (alternative)
    else if (process.env.FIREBASE_PROJECT_ID && 
             process.env.FIREBASE_CLIENT_EMAIL && 
             process.env.FIREBASE_PRIVATE_KEY) {
      serviceAccount = {
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      };
      console.log('Loading Firebase Admin from individual env vars');
    }
    else {
      throw new Error(
        'Firebase Admin credentials not found. Please set either:\n' +
        '1. FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH (path to JSON file)\n' +
        '2. FIREBASE_ADMIN_SERVICE_ACCOUNT (JSON string)\n' +
        '3. FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY'
      );
    }

    // Initialize Firebase Admin
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID,
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    console.log('   Project ID:', serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID);
    
    return firebaseApp;

  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error.message);
    throw error;
  }
};

/**
 * Get Firebase Admin Auth instance
 * @returns {admin.auth.Auth} Firebase Admin Auth instance
 */
const getAuth = () => {
  if (!firebaseApp) {
    throw new Error('Firebase Admin not initialized. Call initializeFirebaseAdmin() first.');
  }
  return admin.auth();
};

/**
 * Verify Firebase ID Token
 * @param {string} idToken - Firebase ID token from client
 * @returns {Promise<admin.auth.DecodedIdToken>} Decoded token with user info
 */
const verifyIdToken = async (idToken) => {
  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Token verification error:', error.message);
    throw new Error('Invalid or expired token');
  }
};

module.exports = {
  initializeFirebaseAdmin,
  getAuth,
  verifyIdToken,
  admin,
};
