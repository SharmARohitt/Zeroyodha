# ZeroYodha Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
# Clean install to ensure Expo SDK 54 compatibility
rm -rf node_modules package-lock.json
npm install

# Install Expo SDK 54 compatible packages
npx expo install react-native-reanimated@~4.1.1 react-native-worklets@0.5.1
```

**Quick Fix (Windows PowerShell):**
```powershell
.\fix-dependencies.ps1
```

**Quick Fix (Mac/Linux):**
```bash
chmod +x fix-dependencies.sh && ./fix-dependencies.sh
```

### 2. Firebase Configuration

✅ **Already Configured!** The Firebase config is already set up in `src/services/authService.ts`:
- Project: wealth-warrior
- Auth Domain: wealth-warrior.firebaseapp.com

**Important**: Make sure to enable **Email/Password** authentication in your Firebase Console:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **wealth-warrior**
3. Navigate to Authentication → Sign-in method
4. Enable **Email/Password** provider
5. Save the changes

### 3. Run the App

```bash
# Start Expo development server (with cleared cache)
npx expo start --clear

# Or run directly on device
npm run android  # For Android
npm run ios      # For iOS
```

**Important:** Always use `--clear` flag on first run after dependency changes to clear Metro bundler cache.

### 4. First Time Setup

1. **Onboarding**: New users will see onboarding slides
2. **Register**: Create an account with email and password
3. **Email Verification**: Check your email for verification (required for trading)
4. **Start Trading**: Begin with Paper Trading mode (₹1,00,000 virtual funds)

## Features Overview

### Paper Trading Mode (Default)
- Virtual balance: ₹1,00,000
- Risk-free learning environment
- All features available
- Can be reset anytime from Profile → Reset Paper Trading

### Trading Features
- **Watchlist**: Add stocks to watchlist, real-time price updates
- **Orders**: Place Market, Limit, Stop-Loss orders
- **Portfolio**: Track Holdings (CNC) and Positions (MIS)
- **Discover**: View IPOs, G-Secs, and market news

## Project Structure

```
Zeroyodha/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main app tabs
│   ├── order.tsx          # Order placement
│   ├── stock-detail.tsx   # Stock details
│   └── search.tsx         # Stock search
├── src/
│   ├── components/        # Reusable components
│   ├── services/          # Business logic
│   ├── store/            # Zustand state management
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
├── assets/               # Images, icons, etc.
└── package.json         # Dependencies
```

## Key Files

- **State Management**: `src/store/` (Zustand stores)
- **Market Data**: `src/services/marketDataService.ts`
- **Trading Logic**: `src/services/tradingService.ts`
- **Auth**: `src/services/authService.ts`

## Customization

### Change Initial Paper Trading Funds
Edit `src/store/useTradingStore.ts`:
```typescript
const PAPER_INITIAL_FUNDS = 100000; // Change this value
```

### Add More Stocks
Edit `src/services/marketDataService.ts`:
```typescript
const INDIAN_STOCKS: Stock[] = [
  // Add your stocks here
];
```

### Market Data Update Frequency
Edit `src/services/marketDataService.ts`:
```typescript
this.updateInterval = setInterval(() => {
  this.updatePrices();
}, 2000); // Change interval (milliseconds)
```

## API Integrations

### Finnhub API (News)
✅ **Already Configured!** The Finnhub API key is set up in `src/services/newsService.ts` for real-time market news.

The app uses Finnhub API to fetch:
- India-specific market news
- General market updates
- Company-specific news

### Firebase Auth
✅ **Already Configured!** Firebase authentication is set up with your project credentials.

## Troubleshooting

### Firebase Auth Not Working
- Ensure Email/Password auth is enabled in Firebase Console (Authentication → Sign-in method)
- Verify your Firebase project is active
- Check internet connection
- Verify the config in `src/services/authService.ts` matches your Firebase project

### Market Data Not Updating
- Check console for errors
- Ensure `initializeMarketData()` is called
- Verify market data service is running

### Paper Trading Reset Not Working
- Check AsyncStorage permissions
- Verify trading mode is set to 'PAPER'
- Check console for errors

## Development Tips

1. **Hot Reload**: Changes auto-reload in Expo
2. **Debugging**: Use React Native Debugger or Chrome DevTools
3. **State Inspection**: Check Zustand stores in React DevTools
4. **AsyncStorage**: Use Expo DevTools to inspect stored data

## Next Steps

- Add real WebSocket connection for market data
- Integrate real broker API (for live trading)
- Add charting library (TradingView, Lightweight Charts)
- Implement advanced order types (Bracket, Cover, etc.)
- Add notifications for order execution
- Implement market depth view

## Support

For issues, check:
1. Console logs for errors
2. Firebase Console for auth issues
3. Expo documentation: https://docs.expo.dev
4. React Native docs: https://reactnative.dev

---

**Happy Trading! 📈**

