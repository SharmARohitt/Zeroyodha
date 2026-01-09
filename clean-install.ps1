# Complete clean install - removes all traces of worklets/reanimated (PowerShell)
Write-Host "🧹 Removing all node_modules and lock files..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
Remove-Item -Force yarn.lock -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .metro -ErrorAction SilentlyContinue

Write-Host "📦 Installing fresh dependencies..." -ForegroundColor Green
npm install

Write-Host "✅ Done! Run: npx expo start --clear" -ForegroundColor Cyan

