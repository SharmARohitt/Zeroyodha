# 🚀 Production Hardening Checklist & Render Deployment

Complete guide for hardening production and deploying to Render with all optimizations.

## ✅ Phase 2 Improvements Implemented

### 1️⃣ Rate Limiting ✅
- **File:** `middleware/rateLimiter.js`
- **Features:**
  - 100 requests/15min per IP (general)
  - 30 requests/15min per IP (sensitive operations)
  - 10 requests/15min (auth endpoints)
  - Automatic IP detection from X-Forwarded-For headers
  - Applied to all `/api/*` routes

### 2️⃣ Request Logging ✅
- **Enhanced in:** `server.js`
- **Features:**
  - Morgan middleware with Dev/Combined format
  - Production-optimized (skips health checks)
  - Request timing
  - Error logging with context
  - Graceful shutdown logging

### 3️⃣ Response Caching ✅
- **File:** `middleware/cacheManager.js`
- **Features:**
  - In-memory caching with Node Cache
  - 10-second TTL for quotes (configurable)
  - Automatic cache invalidation on order placement
  - Cache statistics available
  - Cache key generation for symbol + exchange

### 4️⃣ Token Expiry Handling ✅
- **Enhanced in:** `middleware/authMiddleware.js`
- **Features:**
  - Specific 401 error handling
  - Clear distinction between Firebase token issues and external API failures
  - Structured error responses
  - Development vs production error details

### 5️⃣ Input Validation ✅
- **File:** `middleware/validator.js`
- **Features:**
  - express-validator integration
  - Symbol validation (uppercase, length, format)
  - Order validation (transactionType, quantity, price)
  - Exchange format validation
  - Consistent validation error format

### 6️⃣ Security Improvements ✅
- **Enhanced in:** `server.js`
- **Features:**
  - Helmet with strict CSP
  - X-Powered-By header disabled
  - Trust proxy enabled (for Render)
  - CORS with configurable origins
  - Frameguard (clickjacking protection)
  - HSTS headers (1 year)
  - MIME sniffing protection
  - XSS protection

### 7️⃣ Async Error Wrapper ✅
- **File:** `utils/asyncHandler.js`
- **Features:**
  - Prevents unhandled promise rejections
  - Routes wrapped for automatic error handling
  - Passes errors to global error handler

### 8️⃣ System Health Monitoring ✅
- **File:** `utils/healthMonitor.js`
- **New Endpoint:** `GET /api/system/status`
- **Features:**
  - Firebase Admin initialization check
  - Dhan API connectivity verification
  - Memory usage monitoring
  - Server uptime tracking
  - CPU count reporting
  - Node version reporting

---

## 📋 Pre-Deployment Checklist

### Backend Code & Dependencies
- [ ] All 8 improvements implemented
- [ ] `npm install` completed in `backend/` folder
- [ ] No console errors when starting server
- [ ] All routes test successfully locally
- [ ] Validation working (test invalid requests)
- [ ] Rate limiting working (test with >100 requests)
- [ ] Cache working (test same symbol twice, see "cached": true)
- [ ] Health endpoint accessible: `/api/system/status`

### Environment Configuration
- [ ] `.env` file configured with all variables
- [ ] Firebase credentials valid
- [ ] Dhan API credentials valid
- [ ] `ALLOWED_ORIGINS` set correctly
- [ ] `NODE_ENV=production` for production
- [ ] No hardcoded secrets in code

### Code Quality
- [ ] No console.log calls with sensitive data
- [ ] Error messages don't expose internals
- [ ] Logging skips health check spam
- [ ] Authentication middleware in all protected routes
- [ ] Async handlers wrap all route handlers
- [ ] Input validation on all data endpoints

### Security
- [ ] Helmet configured (CSP, HSTS, etc.)
- [ ] Rate limiting active
- [ ] CORS restricted to known origins
- [ ] No hardcoded API keys
- [ ] X-Powered-By disabled
- [ ] Trust proxy enabled for reverse proxies
- [ ] HTTPS enforced in production (Render handles)

---

## 🚀 Render Deployment Steps

### Step 1: Prepare Code

```bash
# Ensure all changes committed
git add backend/
git commit -m "Add production hardening: rate limiting, validation, caching, monitoring"
git push origin main
```

### Step 2: Create Render Web Service

1. **Login to Render:** https://render.com
2. **Dashboard** → **New +** → **Web Service**
3. **Connect Repository** and select your repo
4. **Configure Service:**

   | Field | Value |
   |-------|-------|
   | Name | `zeroyodha-backend` |
   | Root Directory | `backend` |
   | Environment | `Node` |
   | Build Command | `npm install` |
   | Start Command | `npm start` |
   | Region | Choose closest to you |
   | Instance Type | `Free` (test) or `Starter` ($7/mo) |

5. Click **Advanced** to add environment variables

### Step 3: Set Environment Variables

Add these in Render dashboard (Environment tab):

```env
# Node Configuration
NODE_ENV=production
PORT=3000

# Firebase Admin SDK
FIREBASE_PROJECT_ID=wealth-warrior
FIREBASE_ADMIN_SERVICE_ACCOUNT={"type":"service_account","project_id":"wealth-warrior","...entire JSON here..."}

# Dhan API
DHAN_CLIENT_ID=your_actual_dhan_client_id
DHAN_ACCESS_TOKEN=your_actual_dhan_access_token
DHAN_API_BASE_URL=https://api.dhan.co/v2

# CORS (restrict to your domains in production)
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

**For `FIREBASE_ADMIN_SERVICE_ACCOUNT`:**
- Copy entire JSON from `serviceAccountKey.json`
- Make it single-line (remove newlines)
- Use `\n` for actual newlines in key

Example:
```
{"type":"service_account","project_id":"wealth-warrior","private_key_id":"abc123","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhk...rest of key\n-----END PRIVATE KEY-----\n","client_email":"..."}
```

### Step 4: Deploy

1. Click **Create Web Service**
2. Wait 2-5 minutes for build and deployment
3. Check logs for:
   - ✅ `npm install` success
   - ✅ `🚀 Zeroyodha Backend Server Started`
   - ✅ `✅ Firebase Admin initialized`
4. Get your URL: `https://zeroyodha-backend.onrender.com`

### Step 5: Test Deployment

```bash
# Test health endpoint (public, no auth)
curl https://zeroyodha-backend.onrender.com/health

# Test system status (public, no auth)
curl https://zeroyodha-backend.onrender.com/api/system/status

# Test protected endpoint (requires Firebase token)
curl -X GET "https://zeroyodha-backend.onrender.com/api/market/quote?symbol=RELIANCE" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN_HERE"
```

### Step 6: Update Frontend

Edit root `.env`:
```env
EXPO_PUBLIC_BACKEND_URL=https://zeroyodha-backend.onrender.com/api
```

Rebuild mobile app:
```bash
npm start
```

---

## 📊 Monitoring in Production

### View Logs
1. Render Dashboard → Your Service
2. **Logs** tab shows real-time output
3. Filter by error/warning for issues

### Monitor Key Metrics
- Request count (rate limiter will show limits)
- Error rate (HTTP 4xx, 5xx)
- Response times
- Memory usage check: `/api/system/status`

### Set Up Alerts (Paid Render Plan)
1. Settings → Monitoring & Alerting
2. Add alerts for:
   - Build failures
   - Unhealthy instances
   - High memory usage

### Monitor Dhan API
- Check Dhan status: https://status.dhanhq.co/
- Monitor API rate limits
- Watch for auth token expiration

---

## 🔍 Testing Production Environment

### 1. Rate Limiting Test

```bash
# This should work (100 requests)
for i in {1..50}; do
  curl -s -H "Authorization: Bearer TOKEN" \
    "https://zeroyodha-backend.onrender.com/api/market/quote?symbol=RELIANCE" > /dev/null
done

# This should be rate limited (101st request)
curl -X GET "https://zeroyodha-backend.onrender.com/api/market/quote?symbol=RELIANCE" \
  -H "Authorization: Bearer TOKEN"
```

Expected: HTTP 429 after limit exceeded

### 2. Caching Test

```bash
# First request (no cache)
curl -X GET "https://zeroyodha-backend.onrender.com/api/market/quote?symbol=RELIANCE" \
  -H "Authorization: Bearer TOKEN"
# Check response: "cached": false

# Second request immediately (should be cached)
curl -X GET "https://zeroyodha-backend.onrender.com/api/market/quote?symbol=RELIANCE" \
  -H "Authorization: Bearer TOKEN"
# Check response: "cached": true
```

### 3. Validation Test

```bash
# Invalid symbol (should fail)
curl -X GET "https://zeroyodha-backend.onrender.com/api/market/quote?symbol=123" \
  -H "Authorization: Bearer TOKEN"
# Expected: HTTP 400 with validation errors

# Invalid order (should fail)
curl -X POST "https://zeroyodha-backend.onrender.com/api/market/order" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"transactionType":"INVALID"}'
# Expected: HTTP 400 with validation errors
```

### 4. Error Handling Test

```bash
# Expired token (should fail)
curl -X GET "https://zeroyodha-backend.onrender.com/api/market/quote?symbol=RELIANCE" \
  -H "Authorization: Bearer INVALID_TOKEN"
# Expected: HTTP 401 with code: TOKEN_VERIFICATION_FAILED

# Missing auth (should fail)
curl -X GET "https://zeroyodha-backend.onrender.com/api/market/quote?symbol=RELIANCE"
# Expected: HTTP 401 with code: AUTH_HEADER_MISSING
```

### 5. Health Check

```bash
# System health status
curl https://zeroyodha-backend.onrender.com/api/system/status

# Expected response:
# {
#   "status": "healthy",
#   "checks": {
#     "firebase": { "status": "healthy", ... },
#     "dhan": { "status": "healthy", ... }
#   },
#   "server": {
#     "uptime": 1234,
#     "memory": { ... },
#     "system": { ... }
#   }
# }
```

---

## 🐛 Troubleshooting Production Issues

### Issue: 429 Too Many Requests

**Problem:** Users getting rate limited too quickly

**Solution:**
- Adjust rate limits in `middleware/rateLimiter.js`
- Check for cache not working (missing symbol parameter)
- Monitor mobile app — may have retry logic causing extra requests

### Issue: High Memory Usage

**Problem:** `/api/system/status` shows high memory usage

**Solution:**
- Cache might be too large
- Check for memory leaks in route handlers
- Monitor Dhan API for slow responses (causes callback pile-up)

### Issue: Dhan API Errors (401)

**Problem:** Users getting unauthorized from Dhan API

**Solution:**
- Check `DHAN_CLIENT_ID` and `DHAN_ACCESS_TOKEN` in Render env
- Verify credentials with Dhan support
- Check Dhan API status page

### Issue: Firebase Auth Errors

**Problem:** `TOKEN_VERIFICATION_FAILED` for all users

**Solution:**
- Verify `FIREBASE_ADMIN_SERVICE_ACCOUNT` is valid JSON
- Check `FIREBASE_PROJECT_ID` matches Firebase console
- Ensure mobile app uses same Firebase project

### Issue: CORS Errors

**Problem:** `Not allowed by CORS`

**Solution:**
- Add frontend domain to `ALLOWED_ORIGINS`
- Format: `https://yourdomain.com,https://www.yourdomain.com`
- For Expo: `exp://YOUR_DEVICE_IP:8081`

---

## 📈 Scaling Considerations

### Current Configuration
- ✅ Rate limiting per IP
- ✅ Response caching (10s)
- ✅ Health monitoring
- ✅ Async error handling
- ✅ Input validation

### For Higher Traffic
1. **Upgrade Render Plan**
   - Free → Starter ($7/mo) → Professional ($12/mo)
   - More concurrent connections

2. **Increase Cache TTL** (if data freshness allows)
   - Quote cache: 10s → 30s
   - Edit in `dhanService.js`: `MarketQuoteCache.cacheQuote(..., 30)`

3. **Implement Redis Cache**
   - For distributed caching across multiple instances
   - Use `redis` npm package

4. **Optimize Dhan API Calls**
   - Implement pagination
   - Use Dhan API webhooks instead of polling

5. **Database** (for future features)
   - Store order history instead of querying each time
   - Cache user data locally

---

## 🔐 Security Hardening Checklist (Production)

- [ ] HTTPS enabled (Render provides automatically)
- [ ] Rate limiting active and tested
- [ ] Input validation working
- [ ] CORS restricted to known origins (not `*`)
- [ ] Rate limit headers returned (RateLimit-Limit, RateLimit-Remaining)
- [ ] Error responses don't expose internals
- [ ] Helmet security headers verified (view in browser dev tools)
- [ ] Logs don't contain sensitive data
- [ ] Firebase Admin credentials secure (env var only)
- [ ] Dhan API credentials secure (env var only)
- [ ] X-Powered-By header removed
- [ ] Trust proxy enabled (for Render's reverse proxy)
- [ ] Health check endpoint works (for monitoring)
- [ ] System status shows all components healthy
- [ ] Cache invalidation working after orders

---

## 📞 Support & Monitoring

### Health Check URLs
- Production: `https://zeroyodha-backend.onrender.com/api/system/status`
- Development: `http://localhost:3000/api/system/status`
- Quick check: `https://zeroyodha-backend.onrender.com/health`

### Uptime Monitoring (Recommended)
- Use Render's built-in health checks
- Or external service: UptimeRobot (free tier)
- Point to: `https://your-backend.onrender.com/health`

### Error Tracking (Optional)
- Sentry (free tier): Real-time error tracking
- DataDog: Advanced monitoring
- Setup in `server.js` if needed

### Performance Monitoring
- Check response times in Render logs
- Monitor cache hit rate (look for `cached: true` in responses)
- Check memory usage in `/api/system/status`

---

## ✨ Next Steps

1. **Deploy to Render** using this checklist
2. **Test all endpoints** with actual Firebase tokens
3. **Monitor for 24 hours** for any issues
4. **Optimize based on usage** patterns
5. **Plan for scaling** if traffic grows

---

## 🎊 Production Ready!

Your backend now has:
- ✅ Rate limiting (abuse protection)
- ✅ Request logging (debugging)
- ✅ Response caching (performance)
- ✅ Token expiry handling (reliability)
- ✅ Input validation (security)
- ✅ Security hardening (protection)
- ✅ Async error handling (stability)
- ✅ Health monitoring (observability)

**Estimated deployment time:** 5-10 minutes
**Difficulty:** Medium
**Expected uptime:** 99.5%+ (Render infrastructure)

Deploy with confidence! 🚀
