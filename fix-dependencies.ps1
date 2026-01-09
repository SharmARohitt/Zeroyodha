# Fix Dependencies for Expo SDK 54 (PowerShell)
# This script cleans and reinstalls all dependencies with correct versions

Write-Host "🧹 Cleaning old dependencies..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
Remove-Item -Force yarn.lock -ErrorAction SilentlyContinue

Write-Host "🧹 Clearing Expo cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue

Write-Host "📦 Installing dependencies..." -ForegroundColor Green
npm install

Write-Host "✅ Installing Expo SDK 54 compatible packages..." -ForegroundColor Green
npx expo install react-native-reanimated@~4.1.1 react-native-worklets@0.5.1

Write-Host "✨ Done! Now run: npx expo start --clear" -ForegroundColor Cyan

