// Safe wrapper for expo-constants to handle cases where it might not be available
let Constants: any = null;

try {
  Constants = require('expo-constants').default;
} catch (error) {
  console.warn('expo-constants not available:', error);
  // Fallback for when Constants is not available
  Constants = {
    executionEnvironment: 'standalone',
    appOwnership: 'standalone',
    manifest: {},
  };
}

export default Constants;

