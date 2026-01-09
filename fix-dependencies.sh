#!/bin/bash

# Fix Dependencies for Expo SDK 54
# This script cleans and reinstalls all dependencies with correct versions

echo "🧹 Cleaning old dependencies..."
rm -rf node_modules
rm -rf package-lock.json
rm -rf yarn.lock

echo "🧹 Clearing Expo cache..."
rm -rf .expo
rm -rf node_modules/.cache

echo "📦 Installing dependencies..."
npm install

echo "✅ Installing Expo SDK 54 compatible packages..."
npx expo install react-native-reanimated@~4.1.1 react-native-worklets@0.5.1

echo "✨ Done! Now run: npx expo start --clear"

