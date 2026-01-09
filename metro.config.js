const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const config = getDefaultConfig(__dirname);

// Fix module resolution for nested dependencies
config.resolver = {
  ...config.resolver,
  // Force react-native-screens to resolve from root node_modules
  // This fixes expo-router's nested dependencies not finding it
  extraNodeModules: {
    'react-native-screens': path.resolve(__dirname, 'node_modules/react-native-screens'),
    ...config.resolver?.extraNodeModules,
  },
  resolveRequest: (context, moduleName, platform) => {
    // Fix web-streams-polyfill/ponyfill/es6 resolution
    if (moduleName === 'web-streams-polyfill/ponyfill/es6') {
      const ponyfillPath = path.resolve(
        __dirname,
        'node_modules/web-streams-polyfill/dist/ponyfill.es6.js'
      );
      if (fs.existsSync(ponyfillPath)) {
        return {
          filePath: ponyfillPath,
          type: 'sourceFile',
        };
      }
    }
    
    // Use default resolution for everything else
    // extraNodeModules above ensures react-native-screens resolves from root
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;

