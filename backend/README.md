# Zeroyodha Backend API

Secure backend server for the Zeroyodha mobile trading app. Handles Firebase authentication and Dhan API integration.

## Architecture

```
Mobile App (Firebase Auth) → Backend Server (Token Verification) → Dhan API → Response
```

## Features

- ✅ Firebase Admin SDK for authentication
- ✅ Secure token verification middleware
- ✅ Dhan API service layer with error handling
- ✅ RESTful API endpoints
- ✅ Centralized error handling
- ✅ CORS protection
- ✅ Security headers (Helmet)
- ✅ Request logging (Morgan)
- ✅ Environment-based configuration

## Project Structure

```
backend/
├── config/
│   └── firebaseAdmin.js      # Firebase Admin SDK configuration
├── middleware/
│   ├── authMiddleware.js     # JWT/Firebase token verification
│   └── errorHandler.js       # Centralized error handling
├── routes/
│   └── marketRoutes.js       # Market data API endpoints
├── services/
│   └── dhanService.js        # Dhan API integration service
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore file
├── package.json              # Dependencies and scripts
├── server.js                 # Main Express server
└── README.md                 # This file
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
# Server
PORT=3000
NODE_ENV=development

# Firebase Admin SDK
FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
FIREBASE_PROJECT_ID=wealth-warrior

# Dhan API
DHAN_CLIENT_ID=your_actual_client_id
DHAN_ACCESS_TOKEN=your_actual_access_token
DHAN_API_BASE_URL=https://api.dhan.co/v2

# CORS
ALLOWED_ORIGINS=http://localhost:8081,exp://192.168.1.100:8081
```

### 3. Get Firebase Admin Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (wealth-warrior)
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file and save it as `serviceAccountKey.json` in the `backend/` folder

**⚠️ IMPORTANT:** Never commit `serviceAccountKey.json` to version control! It's already in `.gitignore`.

### 4. Get Dhan API Credentials

1. Sign up at [Dhan HQ](https://dhanhq.co)
2. Navigate to API section
3. Generate API credentials
4. Copy `Client ID` and `Access Token` to `.env` file

### 5. Run the Server

Development mode (with auto-reload):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Server will start on `http://localhost:3000` by default.

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/`      | API information |
| GET    | `/health` | Health check |

### Protected Endpoints (Require Authentication)

All these endpoints require `Authorization: Bearer <firebase-id-token>` header.

#### Market Data

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET    | `/api/market/quote` | Get stock quote | `symbol`, `exchange` (optional) |
| GET    | `/api/market/holdings` | Get user holdings | - |
| GET    | `/api/market/positions` | Get open positions | - |
| GET    | `/api/market/funds` | Get funds/margin | - |
| GET    | `/api/market/orders` | Get order history | - |
| POST   | `/api/market/order` | Place new order | See body below |
| GET    | `/api/market/health` | Check Dhan API connectivity | - |

### Example Requests

#### Get Market Quote

```bash
curl -X GET "http://localhost:3000/api/market/quote?symbol=RELIANCE" \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": {
    "symbol": "RELIANCE",
    "exchange": "NSE",
    "lastPrice": 2450.50,
    "change": 12.5,
    "changePercent": 0.51,
    "volume": 1000000,
    "open": 2440.00,
    "high": 2460.00,
    "low": 2430.00,
    "prevClose": 2438.00,
    "timestamp": "2026-02-24T10:30:00.000Z"
  },
  "timestamp": "2026-02-24T10:30:15.123Z"
}
```

#### Place Order

```bash
curl -X POST "http://localhost:3000/api/market/order" \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionType": "BUY",
    "securityId": "1333",
    "quantity": 10,
    "exchange": "NSE_EQ",
    "productType": "INTRADAY",
    "orderType": "MARKET"
  }'
```

## Authentication Flow

### From Mobile App

1. User signs in with Firebase (frontend)
2. Get Firebase ID token:
```javascript
const token = await user.getIdToken();
```

3. Include token in API requests:
```javascript
fetch('https://your-backend.com/api/market/quote?symbol=RELIANCE', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Backend Verification

1. Extract token from `Authorization` header
2. Verify using Firebase Admin SDK
3. Attach user info to `req.user`
4. Proceed to route handler

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2026-02-24T10:30:15.123Z",
  "path": "/api/market/quote"
}
```

Common error codes:
- `AUTH_HEADER_MISSING` - No Authorization header
- `TOKEN_EXPIRED` - Firebase token expired
- `TOKEN_INVALID` - Invalid token format
- `DHAN_API_ERROR` - Dhan API request failed
- `VALIDATION_ERROR` - Invalid request parameters

## Deployment to Render

### Prerequisites

1. Create account on [Render](https://render.com)
2. Have your code pushed to GitHub/GitLab

### Steps

1. **Create New Web Service**
   - Dashboard → New → Web Service
   - Connect your repository
   - Select the `backend` folder

2. **Configure Build Settings**
   ```
   Build Command: npm install
   Start Command: npm start
   ```

3. **Set Environment Variables**
   
   Go to Environment tab and add:
   
   ```
   NODE_ENV=production
   PORT=3000
   FIREBASE_PROJECT_ID=wealth-warrior
   FIREBASE_ADMIN_SERVICE_ACCOUNT=<paste entire JSON here>
   DHAN_CLIENT_ID=your_client_id
   DHAN_ACCESS_TOKEN=your_access_token
   DHAN_API_BASE_URL=https://api.dhan.co/v2
   ALLOWED_ORIGINS=*
   ```

   **For Firebase Admin JSON:**
   - Copy entire content of `serviceAccountKey.json`
   - Paste as single-line string in `FIREBASE_ADMIN_SERVICE_ACCOUNT`
   - OR use individual env vars (see config/firebaseAdmin.js)

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy
   - Your backend will be live at: `https://your-app.onrender.com`

5. **Update Mobile App**
   
   In your frontend `.env`:
   ```
   EXPO_PUBLIC_BACKEND_URL=https://your-app.onrender.com
   ```

### Health Check

Test deployment:
```bash
curl https://your-app.onrender.com/health
```

## Security Best Practices

✅ **DO:**
- Store all secrets in environment variables
- Use HTTPS in production
- Validate all user inputs
- Log errors for monitoring
- Use rate limiting for production
- Keep dependencies updated

❌ **DON'T:**
- Commit `.env` or `serviceAccountKey.json`
- Expose Firebase Admin credentials to frontend
- Hardcode API keys in source code
- Disable CORS in production without proper configuration
- Log sensitive information (tokens, passwords)

## Troubleshooting

### Firebase Admin Initialization Failed

**Error:** `Firebase Admin credentials not found`

**Solution:**
- Ensure `serviceAccountKey.json` exists in `backend/` folder
- OR set `FIREBASE_ADMIN_SERVICE_ACCOUNT` environment variable
- Check `.env` file has correct `FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH`

### Dhan API Request Failed

**Error:** `DHAN_API_NO_RESPONSE`

**Solution:**
- Verify `DHAN_CLIENT_ID` and `DHAN_ACCESS_TOKEN` in `.env`
- Check Dhan API status: https://dhanhq.co/api/status
- Ensure correct API base URL

### CORS Errors

**Error:** `Not allowed by CORS`

**Solution:**
- Add your frontend URL to `ALLOWED_ORIGINS` in `.env`
- For Expo: Include both `http://localhost:8081` and your device IP
- Format: `ALLOWED_ORIGINS=http://localhost:8081,exp://192.168.1.100:8081`

### Authentication Failed

**Error:** `Token verification failed`

**Solution:**
- Ensure mobile app is using same Firebase project
- Check token is being sent in `Authorization: Bearer <token>` format
- Verify token hasn't expired (Firebase tokens expire after 1 hour)

## Development Tips

### Testing with Postman

1. Get Firebase ID token from mobile app (log it to console)
2. Copy the token
3. In Postman:
   - Add header: `Authorization: Bearer <paste-token-here>`
   - Make request to your endpoint

### Local Testing

```bash
# Terminal 1 - Start backend
cd backend
npm run dev

# Terminal 2 - Start mobile app
cd ..
npm start
```

Update mobile app to use local backend:
```javascript
const API_URL = __DEV__ 
  ? 'http://localhost:3000/api' 
  : 'https://your-production-backend.onrender.com/api';
```

## Support

For issues or questions:
1. Check this README
2. Review error logs in console
3. Check Dhan API documentation: https://dhanhq.co/docs/
4. Review Firebase Admin SDK docs: https://firebase.google.com/docs/admin/setup

## License

ISC
