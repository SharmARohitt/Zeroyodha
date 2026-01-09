# Clear all caches for Reanimated fix (PowerShell)
Write-Host "Clearing Expo and Metro caches..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .metro -ErrorAction SilentlyContinue
Write-Host "Cache cleared. Run: npx expo start --clear" -ForegroundColor Green

