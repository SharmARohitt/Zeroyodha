# 🔐 DHAN OAUTH SETUP - QUICK REFERENCE

**Purpose:** Step-by-step Dhan Dashboard configuration for OAuth integration  
**Time Required:** 5-10 minutes  
**Difficulty:** Medium  

---

## 📋 Prerequisites

Before starting, you need:
- [ ] Dhan trading account (https://dhanhq.co)
- [ ] Dhan Dashboard access
- [ ] Render backend URL (e.g., `https://zeroyodha-backend.onrender.com`)
- [ ] Backend already deployed to Render

---

## 🔧 STEP 1: Get Your Credentials

### 1.1 Access Dhan Dashboard
1. Go to https://dashboard.dhan.co
2. Login with your Dhan account
3. Navigate to **Settings** → **API Keys**

### 1.2 Copy API Credentials

Note these values (you'll need them for environment variables):

```
DHAN_CLIENT_ID: [Copy from API Keys section]
DHAN_ACCESS_TOKEN: [Copy from API Keys section]
DHAN_API_BASE_URL: https://api.dhan.co/v2 (default)
```

---

## 🔐 STEP 2: Configure OAuth Application

### 2.1 Create OAuth App
1. In Dhan Dashboard, go to **Settings** → **OAuth Applications**
2. Click **Create New OAuth Application** or **Add Application**
3. Fill in the form:

| Field | Value |
|-------|-------|
| Application Name | `Zeroyodha` |
| Application Type | `Web` |
| Description | `Zeroyodha Trading Mobile App` |

### 2.2 Set Redirect URI
1. In the same form, find **Redirect URIs** section
2. Add your callback URL:
   ```
   https://zeroyodha-backend.onrender.com/api/auth/dhan/callback
   ```
   (Replace `zeroyodha-backend` with your actual Render service name)
3. Click **Add** or **Save**

### 2.3 Copy OAuth Credentials
After creating the app, you'll see:
```
DHAN_CLIENT_ID: [copy this]
DHAN_CLIENT_SECRET: [copy this - keep secure!]
```

Save these in Render environment variables:
```
DHAN_CLIENT_ID=your_client_id
DHAN_CLIENT_SECRET=your_client_secret
```

### 2.4 OAuth URLs (usually default)
```
DHAN_OAUTH_URL=https://api.dhan.co/v2/oauth/authorize
DHAN_TOKEN_URL=https://api.dhan.co/v2/oauth/token
DHAN_OAUTH_CALLBACK_URL=https://zeroyodha-backend.onrender.com/api/auth/dhan/callback
```

---

## 🪝 STEP 3: Configure Webhooks

### 3.1 Access Webhooks Section
1. In Dhan Dashboard, navigate to **Settings** → **Webhooks**
2. Click **Add Webhook** or **Create New Webhook**

### 3.2 Configure Webhook URL
Fill in the webhook details:

| Field | Value |
|-------|-------|
| Webhook URL | `https://zeroyodha-backend.onrender.com/api/webhook/dhan/order-update` |
| Event Type | `Order Updates` (select all: placed, executed, rejected, cancelled) |
| Active | ✅ Enable |

### 3.3 Generate & Copy Webhook Secret
1. Dhan will generate a **Webhook Secret**
2. Copy this value:
   ```
   DHAN_WEBHOOK_SECRET=your_webhook_secret_here
   ```
3. Add to Render environment variables

### 3.4 (Optional) IP Whitelisting
If available in your Dhan plan:
1. Request Dhan webhook IPs
2. Add to environment variable:
   ```
   DHAN_WEBHOOK_IPS=203.0.113.1,203.0.113.2
   ```

---

## 🔄 STEP 4: Update Render Environment Variables

Go to Render Dashboard and update your backend service:

1. **Dashboard** → Your Service → **Environment**
2. Add/Update these variables:

```env
# OAuth
DHAN_CLIENT_ID=your_actual_client_id
DHAN_CLIENT_SECRET=your_actual_client_secret
DHAN_OAUTH_URL=https://api.dhan.co/v2/oauth/authorize
DHAN_TOKEN_URL=https://api.dhan.co/v2/oauth/token
DHAN_OAUTH_CALLBACK_URL=https://zeroyodha-backend.onrender.com/api/auth/dhan/callback

# Webhooks
DHAN_WEBHOOK_SECRET=your_webhook_secret_from_step_3
DHAN_WEBHOOK_IPS=203.0.113.1,203.0.113.2 (optional)

# Frontend Configuration
BACKEND_URL=https://zeroyodha-backend.onrender.com
FRONTEND_URL=exp://192.168.1.100:8081
FRONTEND_OAUTH_REDIRECT=exp://192.168.1.100:8081
```

3. Click **Save** - Render will redeploy with new variables

---

## ✅ STEP 5: Verify Configuration

### 5.1 Test OAuth Flow

```bash
# 1. Get a Firebase token from your mobile app
# 2. Initiate OAuth login
curl -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  "https://zeroyodha-backend.onrender.com/api/auth/dhan/login"

# 3. Should redirect to Dhan authorization URL
# 4. Complete authorization on Dhan
# 5. Should redirect back to your frontend

# 6. Check token status
curl -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  "https://zeroyodha-backend.onrender.com/api/auth/dhan/token-status"

# Expected response (after OAuth completion):
# {"success":true,"connected":true,"expiresIn":3600,...}
```

### 5.2 Test Webhook Endpoint

```bash
# Generate test webhook (requires your webhook secret)
WEBHOOK_SECRET="your_webhook_secret"
BODY='{"event_type":"ORDER_PLACED","order_id":"123456"}'

# Calculate signature
SIGNATURE=$(openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" <(echo -n "$BODY") | base64)
# or use online HMAC tool

# Send test webhook
curl -X POST https://zeroyodha-backend.onrender.com/api/webhook/dhan/order-update \
  -H "Content-Type: application/json" \
  -H "X-Signature: $SIGNATURE" \
  -H "X-Timestamp: $(date +%s)" \
  -d "$BODY"

# Expected: HTTP 200 Success
```

### 5.3 Verify Health Status

```bash
# Check system health (includes Dhan status)
curl https://zeroyodha-backend.onrender.com/api/system/status

# Should show:
# "dhan": {
#   "status": "healthy",
#   "connected": true,
#   ...
# }
```

---

## 🚨 TROUBLESHOOTING

### OAuth Redirect URL Mismatch
**Error:** `invalid_redirect_uri` or similar from Dhan

**Solution:**
1. Verify URL matches EXACTLY in Dhan Dashboard
2. Check for trailing slashes (no trailing slash)
3. Verify DHAN_OAUTH_CALLBACK_URL in backend .env matches
4. Redeploy backend after updating URL

### OAuth Token Exchange Fails
**Error:** 401, invalid client, or similar

**Solution:**
1. Verify `DHAN_CLIENT_ID` and `DHAN_CLIENT_SECRET` are correct
2. Check you're using CLIENT_SECRET (not ACCESS_TOKEN)
3. Ensure credentials are regenerated after OAuth app creation
4. Check Dhan API status: https://status.dhanhq.co

### Webhook Signature Invalid
**Error:** `WEBHOOK_SIGNATURE_INVALID`

**Solution:**
1. Verify `DHAN_WEBHOOK_SECRET` matches exactly
2. Check signature calculation method (HMAC-SHA256)
3. Ensure body is not modified before validation
4. Check timestamp is within 5 minutes of current time

### Webhook Not Triggering
**Error:** No webhook received or 404 errors

**Solution:**
1. Verify webhook URL in Dhan Dashboard is exactly:
   `https://zeroyodha-backend.onrender.com/api/webhook/dhan/order-update`
2. Check firewall/CORS (webhook is server-to-server, no CORS needed)
3. Verify webhook is **enabled** in Dhan Dashboard
4. Check email for webhook delivery status from Dhan
5. Test sample webhook at `/api/webhook/health`

### CORS Errors on OAuth Redirect
**Error:** `Not allowed by CORS`

**Solution:**
1. OAuth redirect is server-side, should not have CORS issues
2. If frontend handling redirect, ensure frontend URL in:
   - `FRONTEND_OAUTH_REDIRECT` env var
   - `ALLOWED_ORIGINS` env var
3. Verify format: `https://domain.com` or `exp://IP:PORT`

---

## 🔒 SECURITY BEST PRACTICES

### Do's ✅
- ✅ Store `DHAN_CLIENT_SECRET` in environment variables only
- ✅ Keep `DHAN_WEBHOOK_SECRET` secure
- ✅ Use HTTPS for all OAuth redirects (Render provides automatically)
- ✅ Verify webhook signatures before processing
- ✅ Rotate credentials periodically
- ✅ Enable 2FA on Dhan account
- ✅ Monitor webhook delivery logs

### Don'ts ❌
- ❌ Don't expose `DHAN_CLIENT_SECRET` to frontend
- ❌ Don't commit credentials to git
- ❌ Don't log webhook secrets
- ❌ Don't use credentials in frontend code
- ❌ Don't disable signature validation
- ❌ Don't bypass timestamp verification

---

## 📱 FRONTEND INTEGRATION

After OAuth setup, update your mobile app:

### 1. Add OAuth Login Button
```javascript
const handleDhanLogin = async () => {
  try {
    const response = await fetch(
      `${EXPO_PUBLIC_BACKEND_URL}/auth/dhan/login`,
      {
        headers: {
          'Authorization': `Bearer ${firebaseToken}`,
        },
      }
    );
    
    if (response.status === 302) {
      // Browser/WebView will handle redirect
      Linking.openURL(response.url);
    }
  } catch (error) {
    console.error('OAuth error:', error);
  }
};
```

### 2. Handle OAuth Callback
```javascript
const handleDeepLink = (url) => {
  const params = new URLSearchParams(url.split('?')[1]);
  const status = params.get('oauth');
  
  if (status === 'dhan' && params.get('status') === 'success') {
    // OAuth successful, refresh token status
    checkDhanTokenStatus();
  } else if (params.get('status') === 'error') {
    // Show error message
    showError(params.get('error'));
  }
};
```

### 3. Check Connection Status
```javascript
const checkDhanTokenStatus = async () => {
  const response = await fetch(
    `${EXPO_PUBLIC_BACKEND_URL}/auth/dhan/token-status`,
    {
      headers: {
        'Authorization': `Bearer ${firebaseToken}`,
      },
    }
  );
  
  const data = await response.json();
  if (data.success) {
    setDhanConnected(true);
  }
};
```

---

## 📊 QUICK CHECKLIST

Before deploying:

- [ ] Dhan trading account created
- [ ] API credentials copied from Dhan Dashboard
- [ ] OAuth application created in Dhan Dashboard
- [ ] Redirect URI set: `https://your-backend.onrender.com/api/auth/dhan/callback`
- [ ] Webhook URL set: `https://your-backend.onrender.com/api/webhook/dhan/order-update`
- [ ] Webhook secret copied
- [ ] All credentials added to Render environment variables
- [ ] Backend redeployed (Render auto-deploys on env var change)
- [ ] Health check shows Dhan connected
- [ ] OAuth login tested from mobile app
- [ ] Webhook delivery tested (order placed on Dhan)

---

## 📞 SUPPORT

If you have issues:

1. Check troubleshooting section above
2. Review Dhan API docs: https://dhanhq.co/docs
3. Check Dhan status: https://status.dhanhq.co
4. Review logs in Render Dashboard
5. Check backend logs: `https://your-backend.onrender.com/api/system/status`

---

✅ **OAuth Setup Complete!**

Your backend is now ready to handle Dhan user authorization and receive webhook updates.
