#!/bin/bash
# Clear all caches for Reanimated fix
echo "Clearing Expo and Metro caches..."
rm -rf .expo
rm -rf node_modules/.cache
rm -rf .metro
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*
echo "Cache cleared. Run: npx expo start --clear"

