# Deploy Backend to Render - Step-by-Step Guide

This guide walks you through deploying the Zeroyodha backend API to Render.

## Prerequisites

- ✅ GitHub/GitLab account with backend code pushed
- ✅ Render account (free tier available)
- ✅ Firebase service account JSON file
- ✅ Dhan API credentials

## Step 1: Prepare Your Repository

### 1.1 Push Backend Code to GitHub

```bash
# Initialize git if not already done
git init

# Add all backend files
git add backend/

# Commit
git commit -m "Add backend API server"

# Push to GitHub
git push origin main
```

### 1.2 Verify .gitignore

Ensure `backend/.gitignore` excludes sensitive files:
```
.env
serviceAccountKey.json
node_modules/
```

## Step 2: Create Render Web Service

### 2.1 Login to Render

1. Go to [https://render.com](https://render.com)
2. Sign up or log in
3. Go to Dashboard

### 2.2 Create New Web Service

1. Click **"New +"** button → **"Web Service"**
2. Connect your GitHub/GitLab repository
3. Select the repository containing your backend code

### 2.3 Configure Service

Fill in the following details:

| Field | Value |
|-------|-------|
| **Name** | `zeroyodha-backend` (or any name you prefer) |
| **Region** | Choose closest to your users |
| **Branch** | `main` (or your default branch) |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` (for testing) or `Starter` (for production) |

Click **"Advanced"** to add environment variables next.

## Step 3: Set Environment Variables

### 3.1 Required Environment Variables

Click **"Add Environment Variable"** and add each of these:

#### Basic Configuration

```
PORT=3000
NODE_ENV=production
```

#### Firebase Configuration

Get your Firebase service account JSON:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select **wealth-warrior** project
3. Go to **Project Settings** → **Service Accounts**
4. Click **"Generate New Private Key"**
5. Download the JSON file

**Option A: Single JSON String (Recommended for Render)**

Copy the entire JSON content and format as single line:

```
FIREBASE_ADMIN_SERVICE_ACCOUNT={"type":"service_account","project_id":"wealth-warrior","private_key_id":"abc123...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...","client_email":"firebase-adminsdk-xyz@wealth-warrior.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xyz%40wealth-warrior.iam.gserviceaccount.com"}
```

Also add:
```
FIREBASE_PROJECT_ID=wealth-warrior
```

**Option B: Individual Variables**

Alternatively, extract and add individually:

```
FIREBASE_PROJECT_ID=wealth-warrior
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkq...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xyz@wealth-warrior.iam.gserviceaccount.com
```

⚠️ **Important:** For `FIREBASE_PRIVATE_KEY`, keep the `\n` characters - they represent newlines.

#### Dhan API Configuration

Get these from [Dhan HQ](https://dhanhq.co):

```
DHAN_CLIENT_ID=your_actual_dhan_client_id
DHAN_ACCESS_TOKEN=your_actual_dhan_access_token
DHAN_API_BASE_URL=https://api.dhan.co/v2
```

#### CORS Configuration

```
ALLOWED_ORIGINS=*
```

**Note:** For production, replace `*` with your actual frontend domains:
```
ALLOWED_ORIGINS=https://your-app.com,https://www.your-app.com
```

### 3.2 Review All Environment Variables

Your final list should look like:

```
PORT=3000
NODE_ENV=production
FIREBASE_PROJECT_ID=wealth-warrior
FIREBASE_ADMIN_SERVICE_ACCOUNT={"type":"service_account",...}
DHAN_CLIENT_ID=your_client_id
DHAN_ACCESS_TOKEN=your_token
DHAN_API_BASE_URL=https://api.dhan.co/v2
ALLOWED_ORIGINS=*
```

## Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will:
   - Clone your repository
   - Install dependencies (`npm install`)
   - Start the server (`npm start`)

### Monitor Deployment

Watch the logs in Render dashboard:
- ✅ Look for: `🚀 Zeroyodha Backend Server Started`
- ✅ Check: `✅ Firebase Admin initialized`
- ❌ If errors, check environment variables

Deployment takes 2-5 minutes.

## Step 5: Test Your Deployment

### 5.1 Get Your Backend URL

After deployment, Render provides a URL:
```
https://zeroyodha-backend.onrender.com
```

### 5.2 Test Health Endpoint

```bash
curl https://zeroyodha-backend.onrender.com/health
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2026-02-24T10:30:15.123Z",
  "uptime": 123.456,
  "environment": "production",
  "nodeVersion": "v20.x.x"
}
```

### 5.3 Test Protected Endpoint (Requires Auth)

You'll need a Firebase ID token from your mobile app.

**Get Token from Mobile App:**

In your React Native app, add this temporarily:
```javascript
const user = auth().currentUser;
const token = await user.getIdToken();
console.log('Firebase Token:', token);
```

**Test API Call:**

```bash
curl -X GET "https://zeroyodha-backend.onrender.com/api/market/quote?symbol=RELIANCE" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN_HERE"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "symbol": "RELIANCE",
    "lastPrice": 2450.50,
    ...
  }
}
```

## Step 6: Configure Mobile App

### 6.1 Update Frontend Environment Variables

In your main project (React Native), update `.env`:

```env
# Add this line
EXPO_PUBLIC_BACKEND_URL=https://zeroyodha-backend.onrender.com/api
```

### 6.2 Update API Service

Create or update `src/services/apiService.ts`:

```typescript
import Constants from 'expo-constants';
import { auth } from './authService';

const API_BASE_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL 
  || process.env.EXPO_PUBLIC_BACKEND_URL 
  || 'http://localhost:3000/api';

/**
 * Get Firebase ID token for authenticated requests
 */
const getAuthToken = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated');
  }
  return await currentUser.getIdToken();
};

/**
 * Make authenticated API request
 */
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

/**
 * Get market quote
 */
export const getMarketQuote = async (symbol: string, exchange = 'NSE') => {
  return apiRequest(`/market/quote?symbol=${symbol}&exchange=${exchange}`);
};

/**
 * Get user holdings
 */
export const getHoldings = async () => {
  return apiRequest('/market/holdings');
};

/**
 * Place order
 */
export const placeOrder = async (orderData: any) => {
  return apiRequest('/market/order', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
};
```

### 6.3 Update app.json

Add environment variable configuration:

```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_BACKEND_URL": "https://zeroyodha-backend.onrender.com/api"
    }
  }
}
```

## Step 7: Verify End-to-End Flow

### Test Complete Flow:

1. **Start Mobile App**
   ```bash
   npm start
   ```

2. **Sign In** with Firebase

3. **Make API Call** (e.g., fetch market quote)

4. **Check Backend Logs** in Render dashboard:
   - Look for: `✅ Authenticated user: user@example.com`
   - Look for: `📡 Dhan API Request: GET /marketfeed/quote`

## Step 8: Production Optimizations (Optional)

### 8.1 Enable Auto-Deploy

In Render dashboard → Settings:
- Enable **"Auto-Deploy"**
- Every push to `main` branch will auto-deploy

### 8.2 Add Custom Domain (Paid Plans)

Settings → Custom Domains:
- Add: `api.yourdomain.com`
- Update DNS records as instructed

### 8.3 Upgrade Instance Type

For production with real users:
- Free tier: Spins down after inactivity (cold starts)
- Starter ($7/month): Always on, no cold starts

### 8.4 Add Health Check Endpoint

Render can ping your `/health` endpoint to keep it alive:

Settings → Health Check Path: `/health`

## Troubleshooting

### Issue: Build Failed

**Check:**
- `package.json` exists in `backend/` folder
- `Build Command` is set to `npm install`
- Review build logs for errors

### Issue: Firebase Admin Error

**Check:**
- `FIREBASE_ADMIN_SERVICE_ACCOUNT` is valid JSON
- `FIREBASE_PROJECT_ID` matches your Firebase project
- Private key includes `\n` for newlines

**Test locally first:**
```bash
cd backend
# Set env vars
export FIREBASE_ADMIN_SERVICE_ACCOUNT='{"type":"service_account",...}'
npm start
```

### Issue: Dhan API Not Working

**Check:**
- `DHAN_CLIENT_ID` and `DHAN_ACCESS_TOKEN` are correct
- Dhan API is accessible from Render's servers
- Check Dhan API rate limits

**Test:**
```bash
curl https://api.dhan.co/v2/marketfeed/quote \
  -H "access-token: YOUR_TOKEN"
```

### Issue: CORS Errors from Mobile App

**Check:**
- `ALLOWED_ORIGINS=*` is set (for testing)
- Or add specific origins: `ALLOWED_ORIGINS=https://yourdomain.com`

### Issue: 401 Unauthorized

**Check:**
- Firebase token is being sent in `Authorization: Bearer <token>` format
- Token hasn't expired (tokens expire after 1 hour)
- Firebase project ID matches

## Security Checklist

Before going live:

- [ ] Firebase service account JSON not committed to GitHub
- [ ] All secrets in environment variables, not code
- [ ] CORS restricted to your domains (not `*`)
- [ ] HTTPS enabled (automatic on Render)
- [ ] Rate limiting enabled (see server.js comments)
- [ ] Error logs don't expose sensitive data
- [ ] Firebase Admin SDK initialized successfully

## Cost Estimate

### Render Pricing:

- **Free Tier:** $0/month
  - 750 hours/month free
  - Spins down after 15 min inactivity
  - Good for testing

- **Starter:** $7/month
  - Always on (no cold starts)
  - Recommended for production

- **Standard:** $25/month
  - More resources
  - Better performance

### Additional Costs:

- **Dhan API:** Check their pricing
- **Firebase:** 
  - Free tier: 50K verifications/month
  - Blaze plan: Pay as you go (very cheap)

## Next Steps

1. ✅ Test all API endpoints
2. ✅ Monitor error logs in Render dashboard
3. ✅ Set up Dhan API OAuth callback (separate task)
4. ✅ Implement rate limiting for production
5. ✅ Add monitoring/alerting (optional)
6. ✅ Document API for your team

## Support

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- Firebase Admin SDK: https://firebase.google.com/docs/admin/setup
- Dhan API: https://dhanhq.co/docs/

---

**Deployment Complete! 🎉**

Your backend is now live and ready to handle requests from your mobile app.
