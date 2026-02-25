# Render CLI Deployment Script
# Automatically configures and deploys backend service

Write-Host "🚀 Zeroyodha Render Deployment Script" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

# Add Render CLI to PATH
$env:PATH = "$env:USERPROFILE\render-cli;$env:PATH"

# Check if Render CLI is available
try {
    $version = & render --version 2>&1
    Write-Host "✅ Render CLI: $version" -ForegroundColor Green
} catch {
    Write-Host "❌ Render CLI not found. Please install it first." -ForegroundColor Red
    exit 1
}

# Get Render API Key from CLI config
$cliConfigPath = "$env:USERPROFILE\.render\cli.yaml"
if (Test-Path $cliConfigPath) {
    Write-Host "✅ CLI config found" -ForegroundColor Green
} else {
    Write-Host "❌ Not logged in. Run: render login" -ForegroundColor Red
    exit 1
}

# Prompt for API Key (needed for API calls)
Write-Host "`n📋 To automate service updates, we need your Render API Key" -ForegroundColor Yellow
Write-Host "   Get it from: https://dashboard.render.com/u/settings#api-keys`n" -ForegroundColor Yellow
$apiKey = Read-Host "Enter your Render API Key (or press Enter to skip automation)"

if ([string]::IsNullOrWhiteSpace($apiKey)) {
    Write-Host "`n⚠️  Skipping automation. You'll need to update service settings manually:" -ForegroundColor Yellow
    Write-Host "   1. Go to: https://dashboard.render.com" -ForegroundColor White
    Write-Host "   2. Select your service" -ForegroundColor White
    Write-Host "   3. Settings → Root Directory: backend" -ForegroundColor White
    Write-Host "   4. Settings → Start Command: npm start" -ForegroundColor White
    Write-Host "   5. Manual Deploy → Clear build cache & deploy`n" -ForegroundColor White
    
    # Still try to list services
    Write-Host "📋 Listing your services..." -ForegroundColor Cyan
    render services list
    exit 0
}

# Set API Key as environment variable
$env:RENDER_API_KEY = $apiKey

Write-Host "`n📋 Fetching your services..." -ForegroundColor Cyan

# API call to list services
$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Accept" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri "https://api.render.com/v1/services" -Headers $headers -Method Get
    
    $services = $response.services | Where-Object { $_.service.name -like "*backend*" -or $_.service.name -like "*zeroyodha*" }
    
    if ($services.Count -eq 0) {
        Write-Host "⚠️  No backend service found. Showing all services:" -ForegroundColor Yellow
        $services = $response.services
    }
    
    Write-Host "`n✅ Found $($services.Count) service(s):" -ForegroundColor Green
    $services | ForEach-Object {
        $svc = $_.service
        Write-Host "   - $($svc.name) ($($svc.type)) - ID: $($svc.id)" -ForegroundColor White
    }
    
    # Select first matching service or prompt
    if ($services.Count -eq 1) {
        $selectedService = $services[0].service
        Write-Host "`n✅ Selected service: $($selectedService.name)" -ForegroundColor Green
    } else {
        Write-Host "`n📋 Enter service ID to update (or press Enter to skip):" -ForegroundColor Yellow
        $serviceId = Read-Host "Service ID"
        
        if ([string]::IsNullOrWhiteSpace($serviceId)) {
            Write-Host "❌ No service selected. Exiting." -ForegroundColor Red
            exit 0
        }
        
        $selectedService = ($services | Where-Object { $_.service.id -eq $serviceId }).service
        
        if (-not $selectedService) {
            Write-Host "❌ Service not found. Exiting." -ForegroundColor Red
            exit 1
        }
    }
    
    $serviceId = $selectedService.id
    Write-Host "`n🔧 Updating service configuration for: $serviceId" -ForegroundColor Cyan
    
    # Update service settings via API
    $updatePayload = @{
        serviceDetails = @{
            rootDir = "backend"
        }
        env = @{
            NODE_VERSION = "20"
        }
    }
    
    # Note: Render API doesn't support updating startCommand via PATCH
    # So we'll just update rootDir and env vars
    
    Write-Host "   - Setting Root Directory: backend" -ForegroundColor White
    Write-Host "   - Setting Node Version: 20" -ForegroundColor White
    
    try {
        $updateResponse = Invoke-RestMethod -Uri "https://api.render.com/v1/services/$serviceId" `
            -Headers $headers `
            -Method Patch `
            -Body ($updatePayload | ConvertTo-Json -Depth 10) `
            -ContentType "application/json"
        
        Write-Host "✅ Service configuration updated!" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  API update failed. You may need to update Start Command manually in dashboard." -ForegroundColor Yellow
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Trigger deploy
    Write-Host "`n🚀 Triggering deploy..." -ForegroundColor Cyan
    
    try {
        $deployResponse = Invoke-RestMethod -Uri "https://api.render.com/v1/services/$serviceId/deploys" `
            -Headers $headers `
            -Method Post `
            -Body (@{ clearCache = "clear" } | ConvertTo-Json) `
            -ContentType "application/json"
        
        $deployId = $deployResponse.deploy.id
        Write-Host "✅ Deploy triggered! Deploy ID: $deployId" -ForegroundColor Green
        Write-Host "   View logs: render logs $serviceId --tail 100" -ForegroundColor White
        Write-Host "   Or visit: https://dashboard.render.com/web/$serviceId`n" -ForegroundColor White
        
        # Wait for deploy (optional)
        Write-Host "⏳ Waiting for deploy to complete (press Ctrl+C to skip)..." -ForegroundColor Yellow
        
        $maxAttempts = 60
        $attempt = 0
        
        while ($attempt -lt $maxAttempts) {
            Start-Sleep -Seconds 5
            $attempt++
            
            try {
                $deployStatus = Invoke-RestMethod -Uri "https://api.render.com/v1/services/$serviceId/deploys/$deployId" `
                    -Headers $headers `
                    -Method Get
                
                $status = $deployStatus.deploy.status
                Write-Host "   Status: $status" -ForegroundColor Cyan
                
                if ($status -eq "live") {
                    Write-Host "`n✅ Deploy completed successfully! 🎉" -ForegroundColor Green
                    Write-Host "   Your service is now running at: $($selectedService.serviceDetails.url)" -ForegroundColor White
                    break
                } elseif ($status -eq "build_failed" -or $status -eq "deploy_failed") {
                    Write-Host "`n❌ Deploy failed. Check logs for details." -ForegroundColor Red
                    break
                }
            } catch {
                Write-Host "   Error checking status: $($_.Exception.Message)" -ForegroundColor Red
                break
            }
        }
        
        if ($attempt -eq $maxAttempts) {
            Write-Host "`n⏱️  Deploy still in progress. Check dashboard for updates." -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "❌ Deploy trigger failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   You can manually deploy from: https://dashboard.render.com/web/$serviceId" -ForegroundColor White
    }
    
} catch {
    Write-Host "❌ API Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n⚠️  Falling back to CLI commands..." -ForegroundColor Yellow
    Write-Host "`nRun these commands manually:" -ForegroundColor White
    Write-Host "   render workspace set" -ForegroundColor Cyan
    Write-Host "   render services list" -ForegroundColor Cyan
    Write-Host "   render deploys create <SERVICE_ID> --wait" -ForegroundColor Cyan
}

Write-Host "`n✅ Script complete!" -ForegroundColor Green
