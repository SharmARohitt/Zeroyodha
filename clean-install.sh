#!/bin/bash
# Complete clean install - removes all traces of worklets/reanimated
echo "🧹 Removing all node_modules and lock files..."
rm -rf node_modules
rm -rf package-lock.json
rm -rf yarn.lock
rm -rf .expo
rm -rf node_modules/.cache
rm -rf .metro

echo "📦 Installing fresh dependencies..."
npm install

echo "✅ Done! Run: npx expo start --clear"

