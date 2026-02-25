# Render CLI Deployment Guide

## ✅ Prerequisites Completed
- Render CLI v2.10 installed at: `%USERPROFILE%\render-cli\render.exe`
- CLI authenticated with your Render account
- Repository contains [render.yaml](render.yaml) blueprint

---

## 🚀 Quick Deploy Commands

### 1. Set Active Workspace (One-Time)
```powershell
# Add Render CLI to PATH for session
$env:PATH = "$env:USERPROFILE\render-cli;$env:PATH"

# Set workspace (interactive menu will appear)
render workspace set
```

### 2. List Your Services
```powershell
render services list --output json
```
Find your backend service ID (looks like: `srv-xxxxxxxxxxxxxxxxxxxxx`)

### 3. Trigger Deploy with Correct Config
```powershell
# Replace SERVICE_ID with your actual service ID
$SERVICE_ID = "srv-xxxxxxxxxxxxxxxxxxxxx"

# Trigger deploy
render deploys create $SERVICE_ID --wait --output text
```

---

## 🔧 Fix Service Settings via Dashboard (Mandatory First Time)

The CLI can trigger deploys, but **service configuration must be fixed in dashboard first**.

### Go to: https://dashboard.render.com
1. Select your backend service
2. Click **Settings** tab
3. Update these fields:

| Setting | Current (Wrong) | Correct Value |
|---------|----------------|---------------|
| **Root Directory** | *(empty or repo root)* | `backend` |
| **Build Command** | `npm install` | `npm install` |
| **Start Command** | `node expo-router/entry` | `npm start` |
| **Node Version** | 22.22.0 | 20.x *(set env: NODE_VERSION=20)* |

4. Add Environment Variables (if not set):
   - `NODE_ENV` = `production`
   - `PORT` = `3000`
   - `FIREBASE_ADMIN_SERVICE_ACCOUNT` = *(your Firebase JSON)*
   - `FIREBASE_PROJECT_ID` = `wealth-warrior`
   - `DHAN_CLIENT_ID` = *(from Dhan dashboard)*
   - `DHAN_ACCESS_TOKEN` = *(or OAuth vars)*
   - `ALLOWED_ORIGINS` = `*` *(or your frontend URL)*

5. Click **Save Changes**
6. Click **Manual Deploy** → **Clear build cache & deploy**

---

## 📋 Alternative: Blueprint-Based Service (Recommended for Clean Start)

If your existing service has complex settings, create a new one from [render.yaml](render.yaml):

### Dashboard Method:
1. Go to: https://dashboard.render.com/blueprints
2. Click **New Blueprint Instance**
3. Connect repository: `SharmARohitt/Zeroyodha`
4. Render auto-detects `render.yaml`
5. Fill in secret env vars when prompted
6. Click **Apply**

### CLI Method (after workspace set):
```powershell
# Validate blueprint first
render blueprints validate render.yaml

# If valid, create service from blueprint via dashboard
# (CLI doesn't support blueprint creation yet - use dashboard)
```

---

## 🔍 Debugging Deploy Failures

### View Live Logs
```powershell
render logs $SERVICE_ID --tail 100
```

### Check Last Deploy Status
```powershell
render deploys list $SERVICE_ID --output json | Select-Object -First 1
```

### SSH Into Running Instance (if deploy succeeded but runtime fails)
```powershell
render ssh $SERVICE_ID
```

---

## 📦 Permanent PATH Setup (Optional)

To make `render` available in all terminals:

### Option 1: User Environment Variable (GUI)
1. Search "Environment Variables" in Windows
2. Edit **User variables** → `Path`
3. Add: `C:\Users\YourUsername\render-cli`
4. Restart terminal

### Option 2: PowerShell Profile
```powershell
# Add to profile (creates if not exists)
Add-Content $PROFILE '$env:PATH = "$env:USERPROFILE\render-cli;$env:PATH"'

# Reload profile
. $PROFILE
```

---

## ✅ Success Indicators

After correct config + deploy, you should see:
```
==> Using Node.js version 20.x.x
==> Running build command 'npm install'...
==> Build successful 🎉
==> Deploying...
==> Running 'npm start'
⚠️  Dhan API credentials not configured...
✅ Token Manager initialized...
🚀 Zeroyodha Backend Server Started
```

Health check: `curl https://your-service.onrender.com/health`

---

## 🆘 Still Failing?

1. Verify Root Directory is `backend` (not blank)
2. Check Start Command is `npm start` (not node expo-router/entry)
3. Ensure all required env vars are set
4. Clear build cache in Manual Deploy options
5. Check logs: `render logs $SERVICE_ID --tail 200`

**If all else fails:** Delete service and create fresh Blueprint instance from [render.yaml](render.yaml)
