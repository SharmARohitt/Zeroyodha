# Deploy Zeroyodha from GitHub to Render
# Uses Render API to create/update service automatically

param(
    [string]$ApiKey = "",
    [switch]$UpdateExisting = $false
)

Write-Host "`n🚀 Zeroyodha Render Deployment from GitHub`n" -ForegroundColor Cyan
Write-Host "   Repo: https://github.com/SharmARohitt/Zeroyodha" -ForegroundColor White
Write-Host "   Branch: main" -ForegroundColor White
Write-Host "   Backend Directory: backend/`n" -ForegroundColor White

# Get API Key
if ([string]::IsNullOrWhiteSpace($ApiKey)) {
    Write-Host "📋 Get your Render API Key from:" -ForegroundColor Yellow
    Write-Host "   https://dashboard.render.com/u/settings#api-keys`n" -ForegroundColor Cyan
    
    $ApiKey = Read-Host "Enter your Render API Key"
    
    if ([string]::IsNullOrWhiteSpace($ApiKey)) {
        Write-Host "`n❌ API Key required. Exiting." -ForegroundColor Red
        exit 1
    }
}

$headers = @{
    "Authorization" = "Bearer $ApiKey"
    "Accept" = "application/json"
    "Content-Type" = "application/json"
}

# Step 1: Get Owner (User/Team)
Write-Host "1️⃣  Fetching your Render account..." -ForegroundColor Yellow

try {
    $ownerResponse = Invoke-RestMethod -Uri "https://api.render.com/v1/owners" -Headers $headers -Method Get
    $owner = $ownerResponse[0]
    $ownerId = $owner.owner.id
    Write-Host "   ✅ Owner: $($owner.owner.name) (ID: $ownerId)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed to fetch owner: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Check existing services
Write-Host "`n2️⃣  Checking existing services..." -ForegroundColor Yellow

try {
    $servicesResponse = Invoke-RestMethod -Uri "https://api.render.com/v1/services?limit=100" -Headers $headers -Method Get
    $existingService = $servicesResponse | Where-Object { 
        $_.service.name -like "*zeroyodha*" -or 
        $_.service.name -like "*backend*" 
    } | Select-Object -First 1
    
    if ($existingService) {
        $serviceId = $existingService.service.id
        $serviceName = $existingService.service.name
        Write-Host "   ⚠️  Found existing service: $serviceName (ID: $serviceId)" -ForegroundColor Yellow
        
        if (-not $UpdateExisting) {
            $update = Read-Host "`n   Update this service? (y/N)"
            $UpdateExisting = $update -eq "y"
        }
        
        if (-not $UpdateExisting) {
            Write-Host "   ℹ️  Will create new service instead" -ForegroundColor Cyan
            $existingService = $null
        }
    } else {
        Write-Host "   ✅ No existing service found. Creating new one..." -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  Could not check services: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Step 3: Prepare service configuration
Write-Host "`n3️⃣  Preparing service configuration..." -ForegroundColor Yellow

$serviceConfig = @{
    type = "web_service"
    name = "zeroyodha-backend"
    ownerId = $ownerId
    repo = "https://github.com/SharmARohitt/Zeroyodha"
    autoDeploy = "yes"
    branch = "main"
    rootDir = "backend"
    buildCommand = "npm install"
    startCommand = "npm start"
    envVars = @(
        @{ key = "NODE_VERSION"; value = "20" }
        @{ key = "NODE_ENV"; value = "production" }
    )
    serviceDetails = @{
        env = "node"
        region = "oregon"
        plan = "free"
        healthCheckPath = "/health"
        rootDir = "backend"
    }
}

Write-Host "   ✅ Configuration ready" -ForegroundColor Green
Write-Host "      - Name: zeroyodha-backend" -ForegroundColor White
Write-Host "      - Root Directory: backend" -ForegroundColor White
Write-Host "      - Build: npm install" -ForegroundColor White
Write-Host "      - Start: npm start" -ForegroundColor White
Write-Host "      - Node Version: 20" -ForegroundColor White

# Step 4: Create or Update Service
if ($existingService -and $UpdateExisting) {
    Write-Host "`n4️⃣  Updating existing service..." -ForegroundColor Yellow
    
    $updatePayload = @{
        rootDir = "backend"
        buildCommand = "npm install"
        startCommand = "npm start"
    }
    
    try {
        $result = Invoke-RestMethod -Uri "https://api.render.com/v1/services/$serviceId" `
            -Headers $headers `
            -Method Patch `
            -Body ($updatePayload | ConvertTo-Json -Depth 10)
        
        Write-Host "   ✅ Service updated successfully!" -ForegroundColor Green
        Write-Host "      Service URL: https://dashboard.render.com/web/$serviceId" -ForegroundColor Cyan
    } catch {
        Write-Host "   ❌ Update failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "`n4️⃣  Creating new service..." -ForegroundColor Yellow
    
    try {
        $result = Invoke-RestMethod -Uri "https://api.render.com/v1/services" `
            -Headers $headers `
            -Method Post `
            -Body ($serviceConfig | ConvertTo-Json -Depth 10)
        
        $serviceId = $result.service.id
        $serviceName = $result.service.name
        
        Write-Host "   ✅ Service created successfully!" -ForegroundColor Green
        Write-Host "      Name: $serviceName" -ForegroundColor White
        Write-Host "      ID: $serviceId" -ForegroundColor White
        Write-Host "      URL: https://dashboard.render.com/web/$serviceId" -ForegroundColor Cyan
    } catch {
        Write-Host "   ❌ Creation failed: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.ErrorDetails.Message) {
            $errorObj = $_.ErrorDetails.Message | ConvertFrom-Json
            Write-Host "   Error Details: $($errorObj.message)" -ForegroundColor Red
        }
        
        Write-Host "`n   ℹ️  Note: Render API for service creation requires repo connection." -ForegroundColor Yellow
        Write-Host "   Please use the Dashboard Blueprint method instead:" -ForegroundColor Yellow
        Write-Host "   1. Visit: https://dashboard.render.com/blueprints" -ForegroundColor White
        Write-Host "   2. Click 'New Blueprint Instance'" -ForegroundColor White
        Write-Host "   3. Connect repo: SharmARohitt/Zeroyodha" -ForegroundColor White
        Write-Host "   4. Render auto-detects render.yaml ✅" -ForegroundColor White
        exit 1
    }
}

# Step 5: Add Environment Variables
Write-Host "`n5️⃣  Environment Variables Setup" -ForegroundColor Yellow
Write-Host "   ⚠️  Required environment variables (set in dashboard):" -ForegroundColor Yellow
Write-Host "      - FIREBASE_ADMIN_SERVICE_ACCOUNT" -ForegroundColor White
Write-Host "      - FIREBASE_PROJECT_ID" -ForegroundColor White
Write-Host "      - DHAN_CLIENT_ID" -ForegroundColor White
Write-Host "      - DHAN_ACCESS_TOKEN" -ForegroundColor White
Write-Host "      - ALLOWED_ORIGINS" -ForegroundColor White
Write-Host "`n   Set them at: https://dashboard.render.com/web/$serviceId/env-vars" -ForegroundColor Cyan

# Step 6: Trigger Deploy
Write-Host "`n6️⃣  Triggering initial deploy..." -ForegroundColor Yellow

try {
    $deployPayload = @{
        clearCache = "clear"
    }
    
    $deployResult = Invoke-RestMethod -Uri "https://api.render.com/v1/services/$serviceId/deploys" `
        -Headers $headers `
        -Method Post `
        -Body ($deployPayload | ConvertTo-Json)
    
    $deployId = $deployResult.deploy.id
    Write-Host "   ✅ Deploy triggered! Deploy ID: $deployId" -ForegroundColor Green
    
    # Monitor deploy
    Write-Host "`n   ⏳ Monitoring deploy status..." -ForegroundColor Cyan
    
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
            $elapsed = $attempt * 5
            Write-Host "   [$elapsed`s] Status: $status" -ForegroundColor Gray
            
            if ($status -eq "live") {
                Write-Host "`n   ✅ Deploy completed successfully! 🎉" -ForegroundColor Green
                $serviceUrl = $result.service.serviceDetails.url
                if ($serviceUrl) {
                    Write-Host "   🌐 Service URL: $serviceUrl" -ForegroundColor Cyan
                }
                break
            } elseif ($status -eq "build_failed" -or $status -eq "deploy_failed") {
                Write-Host "`n   ❌ Deploy failed!" -ForegroundColor Red
                Write-Host "   View logs at: https://dashboard.render.com/web/$serviceId" -ForegroundColor White
                break
            }
        } catch {
            Write-Host "   ⚠️  Status check error: $($_.Exception.Message)" -ForegroundColor Yellow
            break
        }
    }
} catch {
    Write-Host "   ⚠️  Could not trigger deploy: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "   Deploy manually at: https://dashboard.render.com/web/$serviceId" -ForegroundColor White
}

Write-Host "`n═════════════════════════════════════" -ForegroundColor Green
Write-Host "✅ Deployment Process Complete!" -ForegroundColor Green
Write-Host "═════════════════════════════════════" -ForegroundColor Green
Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Set environment variables in dashboard" -ForegroundColor White
Write-Host "2. Monitor deploy at: https://dashboard.render.com/web/$serviceId" -ForegroundColor White
Write-Host "3. Check health endpoint: <service-url>/health`n" -ForegroundColor White
