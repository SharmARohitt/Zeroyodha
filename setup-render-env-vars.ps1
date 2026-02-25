# ============================================================
# Render Environment Variables Setup Guide
# ============================================================
# 
# Your backend is LIVE but needs these environment variables
# to be fully functional.
# 
# Service URL: https://zeroyodha-backend.onrender.com/
# Blueprint ID: exs-d6faun1drdic739rlfrg
# 

Write-Host "`n=== RENDER ENVIRONMENT VARIABLES SETUP ===" -ForegroundColor Cyan
Write-Host "Service: https://zeroyodha-backend.onrender.com/`n" -ForegroundColor White

Write-Host "Step 1: Open Render Dashboard" -ForegroundColor Yellow
Write-Host "  -> https://dashboard.render.com/web/exs-d6faun1drdic739rlfrg`n" -ForegroundColor White

Write-Host "Step 2: Click 'Environment' tab`n" -ForegroundColor Yellow

Write-Host "Step 3: Add these environment variables:`n" -ForegroundColor Yellow

Write-Host "REQUIRED (Critical for functionality):" -ForegroundColor Red
Write-Host ""
Write-Host "  FIREBASE_PROJECT_ID" -ForegroundColor White
Write-Host "    Value: wealth-warrior" -ForegroundColor Gray
Write-Host "    (Your Firebase project ID from .env)" -ForegroundColor DarkGray
Write-Host ""

Write-Host "  FIREBASE_ADMIN_SERVICE_ACCOUNT" -ForegroundColor White
Write-Host "    Value: <Paste your Firebase Admin SDK JSON>" -ForegroundColor Gray
Write-Host "    Get from: https://console.firebase.google.com/project/wealth-warrior/settings/serviceaccounts/adminsdk" -ForegroundColor DarkGray
Write-Host "    Click 'Generate new private key' and copy the entire JSON" -ForegroundColor DarkGray
Write-Host ""

Write-Host "  DHAN_CLIENT_ID" -ForegroundColor White
Write-Host "    Value: <Your Dhan API Client ID>" -ForegroundColor Gray
Write-Host "    Get from: https://dhanhq.co/api-access" -ForegroundColor DarkGray
Write-Host ""

Write-Host "  DHAN_ACCESS_TOKEN" -ForegroundColor White
Write-Host "    Value: <Your Dhan Access Token>" -ForegroundColor Gray
Write-Host "    Get from: https://dhanhq.co/api-access" -ForegroundColor DarkGray
Write-Host ""

Write-Host "  ALLOWED_ORIGINS" -ForegroundColor White
Write-Host "    Value: https://your-frontend-url.com" -ForegroundColor Gray
Write-Host "    (Your Expo app URL or use '*' for development)" -ForegroundColor DarkGray
Write-Host ""

Write-Host "`nOPTIONAL (For OAuth flow):" -ForegroundColor Yellow
Write-Host ""
Write-Host "  DHAN_CLIENT_SECRET" -ForegroundColor White
Write-Host "    Value: <Your Dhan OAuth Client Secret>" -ForegroundColor Gray
Write-Host ""

Write-Host "  DHAN_OAUTH_CALLBACK_URL" -ForegroundColor White
Write-Host "    Value: https://zeroyodha-backend.onrender.com/api/auth/dhan/callback" -ForegroundColor Gray
Write-Host ""

Write-Host "`nAuto-configured (Already set by render.yaml):" -ForegroundColor Green
Write-Host "  NODE_ENV = production" -ForegroundColor Gray
Write-Host "  PORT = 3000`n" -ForegroundColor Gray

Write-Host "Step 4: Click 'Save Changes'" -ForegroundColor Yellow
Write-Host "  -> Service will automatically redeploy with new variables`n" -ForegroundColor Gray

Write-Host "Step 5: Monitor deployment" -ForegroundColor Yellow
Write-Host "  -> Wait 2-3 minutes for redeploy" -ForegroundColor Gray
Write-Host "  -> Check: https://zeroyodha-backend.onrender.com/api/system/status" -ForegroundColor Gray
Write-Host "  -> Should show status: 'healthy' when ready`n" -ForegroundColor Gray

Write-Host "============================================================`n" -ForegroundColor Cyan

$openDashboard = Read-Host "Open Render Dashboard now? (Y/n)"

if ($openDashboard -ne "n") {
    Write-Host "`nOpening Render Dashboard..." -ForegroundColor Green
    Start-Process "https://dashboard.render.com/web/exs-d6faun1drdic739rlfrg/env-vars"
    Write-Host "[OK] Follow the steps above to configure environment variables`n" -ForegroundColor Green
} else {
    Write-Host "`nDashboard URL: https://dashboard.render.com/web/exs-d6faun1drdic739rlfrg/env-vars`n" -ForegroundColor Cyan
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "CURRENT STATUS:" -ForegroundColor Yellow
Write-Host "  [OK] Backend deployed and running" -ForegroundColor Green
Write-Host "  [OK] Node v20.20.0 active" -ForegroundColor Green
Write-Host "  [OK] Root directory: backend/" -ForegroundColor Green
Write-Host "  [PENDING] Environment variables configuration" -ForegroundColor Yellow
Write-Host "============================================================`n" -ForegroundColor Cyan
