# Simple Render Deployment Guide
Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "  Zeroyodha Render Deployment (Simplest Method)" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

Write-Host "Your GitHub Repo:" -ForegroundColor Yellow
Write-Host "   https://github.com/SharmARohitt/Zeroyodha`n" -ForegroundColor White

Write-Host "Your render.yaml is already configured and ready!`n" -ForegroundColor Green

Write-Host "============================================================" -ForegroundColor Gray
Write-Host "  Step-by-Step Deployment (2 minutes):" -ForegroundColor Yellow
Write-Host "============================================================`n" -ForegroundColor Gray

Write-Host "STEP 1: Open Render Dashboard" -ForegroundColor Cyan
Write-Host "   -> https://dashboard.render.com/blueprints`n" -ForegroundColor White

Write-Host "STEP 2: Click 'New Blueprint Instance' button`n" -ForegroundColor Cyan

Write-Host "STEP 3: Connect Your GitHub Repository" -ForegroundColor Cyan
Write-Host "   -> Repository: SharmARohitt/Zeroyodha" -ForegroundColor White
   Write-Host "   -> Branch: main" -ForegroundColor White
   Write-Host "   [OK] Render auto-detects render.yaml`n" -ForegroundColor Green

Write-Host "STEP 4: Configure Environment Variables" -ForegroundColor Cyan
Write-Host "   Required:" -ForegroundColor Yellow
Write-Host "   • FIREBASE_ADMIN_SERVICE_ACCOUNT = <your-firebase-json>" -ForegroundColor White
Write-Host "   • FIREBASE_PROJECT_ID = <your-project-id>" -ForegroundColor White
Write-Host "   • DHAN_CLIENT_ID = <your-client-id>" -ForegroundColor White
Write-Host "   • DHAN_ACCESS_TOKEN = <your-access-token>" -ForegroundColor White
Write-Host "   • ALLOWED_ORIGINS = https://your-app-url.com`n" -ForegroundColor White

Write-Host "STEP 5: Click 'Apply' -> Deployment starts automatically!`n" -ForegroundColor Cyan

Write-Host "============================================================`n" -ForegroundColor Gray

Write-Host "What render.yaml configures:" -ForegroundColor Yellow
Write-Host "   [OK] Root Directory: backend/" -ForegroundColor Green
   Write-Host "   [OK] Build Command: npm install" -ForegroundColor Green
   Write-Host "   [OK] Start Command: npm start" -ForegroundColor Green
   Write-Host "   [OK] Node Version: 20" -ForegroundColor Green
   Write-Host "   [OK] Health Check: /health" -ForegroundColor Green
   Write-Host "   [OK] Auto-deploy on git push" -ForegroundColor Green

Write-Host "`n============================================================`n" -ForegroundColor Gray

$choice = Read-Host "Press [Enter] to open Render Blueprints in browser, or 'A' for API deploy"

if ($choice.ToUpper() -eq "A") {
    Write-Host "`nStarting API-based deployment...`n" -ForegroundColor Cyan
    & "$PSScriptRoot\deploy-github-to-render.ps1"
} else {
    Write-Host "`nOpening Render Blueprints..." -ForegroundColor Cyan
    Start-Process "https://dashboard.render.com/blueprints"
    Write-Host "[OK] Follow the 5 steps above`n" -ForegroundColor Green
}
