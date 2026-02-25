# Quick Render Deploy Script (No API Key Required)
# Uses render.yaml blueprint for clean deployment

Write-Host "`n🚀 Zeroyodha Quick Deploy with Render CLI`n" -ForegroundColor Cyan

# Add Render CLI to PATH
$env:PATH = "$env:USERPROFILE\render-cli;$env:PATH"

# Validate render.yaml
Write-Host "1️⃣  Validating render.yaml..." -ForegroundColor Yellow
render blueprints validate render.yaml

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ render.yaml validation failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ render.yaml is valid`n" -ForegroundColor Green

# Instructions for dashboard
Write-Host "2️⃣  Next Steps (Choose One):`n" -ForegroundColor Yellow

Write-Host "═══ Option A: Fix Existing Service (CLI + Dashboard) ═══" -ForegroundColor Cyan
Write-Host "Run these commands:" -ForegroundColor White
Write-Host "  render workspace set              # Select your workspace" -ForegroundColor Gray
Write-Host "  render services list              # Find your service ID" -ForegroundColor Gray
Write-Host ""
Write-Host "Then in Dashboard (https://dashboard.render.com):" -ForegroundColor White
Write-Host "  → Service Settings → Root Directory: backend" -ForegroundColor Gray
Write-Host "  → Service Settings → Start Command: npm start" -ForegroundColor Gray
Write-Host "  → Manual Deploy → Clear build cache & deploy`n" -ForegroundColor Gray

Write-Host "═══ Option B: New Service from Blueprint (Recommended) ═══" -ForegroundColor Cyan
Write-Host "1. Go to: https://dashboard.render.com/blueprints" -ForegroundColor White
Write-Host "2. Click 'New Blueprint Instance'" -ForegroundColor Gray
Write-Host "3. Connect repo: SharmARohitt/Zeroyodha" -ForegroundColor Gray
Write-Host "4. Render auto-detects render.yaml ✅" -ForegroundColor Gray
Write-Host "5. Set required environment variables:" -ForegroundColor Gray
Write-Host "   - FIREBASE_ADMIN_SERVICE_ACCOUNT" -ForegroundColor DarkGray
Write-Host "   - FIREBASE_PROJECT_ID" -ForegroundColor DarkGray
Write-Host "   - DHAN_CLIENT_ID" -ForegroundColor DarkGray
Write-Host "   - DHAN_ACCESS_TOKEN (or OAuth vars)" -ForegroundColor DarkGray
Write-Host "6. Click 'Apply' → Service deploys automatically 🚀`n" -ForegroundColor Gray

Write-Host "═══ Option C: Automated with API Key ═══" -ForegroundColor Cyan
Write-Host "Run: .\render-deploy.ps1" -ForegroundColor White
Write-Host "Need API key from: https://dashboard.render.com/u/settings#api-keys`n" -ForegroundColor Gray

# Prompt user to choose
Write-Host "─────────────────────────────────────────────" -ForegroundColor DarkGray
$choice = Read-Host "`nWhich option? (A/B/C or Enter to exit)"

switch ($choice.ToUpper()) {
    "A" {
        Write-Host "`n📋 Starting Option A workflow...`n" -ForegroundColor Cyan
        render workspace set
        Write-Host ""
        render services list
        Write-Host "`n✅ Now update service settings in dashboard (see instructions above)" -ForegroundColor Green
    }
    "B" {
        Write-Host "`n🌐 Opening Render Blueprints page..." -ForegroundColor Cyan
        Start-Process "https://dashboard.render.com/blueprints"
        Write-Host "✅ Follow the steps shown above ⬆️" -ForegroundColor Green
    }
    "C" {
        Write-Host "`n🤖 Running automated deployment script...`n" -ForegroundColor Cyan
        & "$PSScriptRoot\render-deploy.ps1"
    }
    default {
        Write-Host "`n👋 Exiting. Run this script again when ready!" -ForegroundColor Yellow
    }
}

Write-Host ""
