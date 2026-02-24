# 🚀 Zeroyodha Backend - Quick Reference

## 📁 Project Structure

```
backend/
├── config/
│   └── firebaseAdmin.js          ← Firebase Admin SDK setup
├── middleware/
│   ├── authMiddleware.js         ← Token verification
│   └── errorHandler.js           ← Error handling
├── routes/
│   └── marketRoutes.js           ← API endpoints
├── services/
│   └── dhanService.js            ← Dhan API client
├── .env.example                  ← Config template
├── .gitignore                    ← Security
├── package.json                  ← Dependencies
├── server.js                     ← Main server
├── README.md                     ← Full docs
└── RENDER_DEPLOYMENT.md          ← Deploy guide
```

## ⚡ Quick Start (3 Steps)

### 1️⃣ Install & Configure

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
```

### 2️⃣ Get Firebase Service Account

1. Firebase Console → Project Settings → Service Accounts
2. Generate New Private Key → Save as `serviceAccountKey.json`
3. Place in `backend/` folder

### 3️⃣ Run Server

```bash
npm run dev
# Server runs at http://localhost:3000
```

## 🔑 Required Environment Variables

```env
# Minimal required config
PORT=3000
NODE_ENV=development
FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
FIREBASE_PROJECT_ID=wealth-warrior
DHAN_CLIENT_ID=your_client_id
DHAN_ACCESS_TOKEN=your_access_token
ALLOWED_ORIGINS=http://localhost:8081
```

## 🌐 API Endpoints

### Public (No Auth)
```
GET  /              → API info
GET  /health        → Health check
```

### Protected (Requires Auth Header)
```
GET  /api/market/quote?symbol=RELIANCE     → Stock quote
GET  /api/market/holdings                  → User holdings
GET  /api/market/positions                 → Open positions
GET  /api/market/funds                     → Funds/margin
GET  /api/market/orders                    → Order history
POST /api/market/order                     → Place order
GET  /api/market/health                    → Dhan API status
```

## 🔐 Authentication Flow

```
Mobile App                Backend                 Dhan API
    |                        |                        |
    | 1. User Signs In       |                        |
    |    (Firebase)          |                        |
    |----------------------->|                        |
    |                        |                        |
    | 2. Get ID Token        |                        |
    |<-----------------------|                        |
    |                        |                        |
    | 3. API Request         |                        |
    |    + Bearer Token      |                        |
    |----------------------->|                        |
    |                        | 4. Verify Token        |
    |                        |    (Firebase Admin)    |
    |                        |                        |
    |                        | 5. Call Dhan API       |
    |                        |    (with credentials)  |
    |                        |----------------------->|
    |                        |                        |
    |                        | 6. Response            |
    |                        |<-----------------------|
    |                        |                        |
    | 7. Clean Response      |                        |
    |<-----------------------|                        |
```

## 💻 Frontend Usage

### Setup (in mobile app)

```typescript
// .env
EXPO_PUBLIC_BACKEND_URL=http://localhost:3000/api

// Import service
import { getMarketQuote } from '@/services/backendApiService';

// Use it
const quote = await getMarketQuote('RELIANCE');
```

### Example API Call

```typescript
import { getMarketQuote, placeOrder } from '@/services/backendApiService';

// Get quote
const fetchQuote = async () => {
  try {
    const result = await getMarketQuote('RELIANCE', 'NSE');
    console.log(result.data);
  } catch (error) {
    console.error(error.message);
  }
};

// Place order
const buyStock = async () => {
  try {
    const result = await placeOrder({
      transactionType: 'BUY',
      securityId: '1333',
      quantity: 1,
      orderType: 'MARKET',
    });
    alert('Order placed!');
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
};
```

## 🧪 Testing

### Test Backend Health

```bash
curl http://localhost:3000/health
```

### Test Protected Endpoint

```bash
# 1. Get Firebase token from mobile app
const token = await auth().currentUser.getIdToken();
console.log(token);

# 2. Test API
curl -X GET "http://localhost:3000/api/market/quote?symbol=RELIANCE" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🚀 Deploy to Render

### 1. Push to GitHub

```bash
git add backend/
git commit -m "Add backend server"
git push origin main
```

### 2. Create Web Service on Render

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`

### 3. Set Environment Variables

```
NODE_ENV=production
FIREBASE_ADMIN_SERVICE_ACCOUNT={"type":"service_account",...}
FIREBASE_PROJECT_ID=wealth-warrior
DHAN_CLIENT_ID=your_id
DHAN_ACCESS_TOKEN=your_token
ALLOWED_ORIGINS=*
```

### 4. Update Frontend

```env
EXPO_PUBLIC_BACKEND_URL=https://your-app.onrender.com/api
```

**Full guide:** `backend/RENDER_DEPLOYMENT.md`

## 🛠️ Common Issues

### ❌ Firebase Admin Error

**Problem:** `Firebase Admin credentials not found`

**Solution:**
- Ensure `serviceAccountKey.json` exists in `backend/`
- OR set `FIREBASE_ADMIN_SERVICE_ACCOUNT` env var
- Check `.env` file path is correct

### ❌ 401 Unauthorized

**Problem:** `Token verification failed`

**Solution:**
- Ensure token is sent as: `Authorization: Bearer <token>`
- Token might be expired (refresh it)
- Check Firebase project ID matches

### ❌ CORS Error

**Problem:** `Not allowed by CORS`

**Solution:**
- Add your frontend URL to `ALLOWED_ORIGINS` in `.env`
- Example: `ALLOWED_ORIGINS=http://localhost:8081,exp://192.168.1.100:8081`

### ❌ Dhan API Error

**Problem:** `DHAN_API_NO_RESPONSE`

**Solution:**
- Check `DHAN_CLIENT_ID` and `DHAN_ACCESS_TOKEN` in `.env`
- Verify credentials at https://dhanhq.co
- Check API rate limits

## 📚 Documentation

- **Backend Full Docs:** `backend/README.md`
- **Deployment Guide:** `backend/RENDER_DEPLOYMENT.md`
- **Implementation Summary:** `BACKEND_IMPLEMENTATION_SUMMARY.md`
- **Usage Examples:** `src/examples/BackendApiExamples.tsx`

## 🔒 Security Checklist

- ✅ Never commit `.env` or `serviceAccountKey.json`
- ✅ Use HTTPS in production (Render provides)
- ✅ Restrict CORS to your domains
- ✅ Keep dependencies updated
- ✅ Monitor logs for errors
- ✅ Rotate API keys regularly

## 📞 Support

**Need Help?**
1. Check `backend/README.md`
2. Review error logs in terminal
3. Check Render deployment logs
4. Review API documentation:
   - Firebase: https://firebase.google.com/docs/admin/setup
   - Dhan: https://dhanhq.co/docs/

---

**Status:** ✅ Production Ready

**Stack:** Node.js + Express + Firebase Admin + Dhan API

**Deployment:** Render (https://render.com)

---

Made with ❤️ for Zeroyodha
