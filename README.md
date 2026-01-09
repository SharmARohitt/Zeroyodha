# ZeroYodha - Zerodha Kite Clone

A comprehensive Zerodha Kite clone built with Expo SDK 54, React Native, and TypeScript. This app replicates Zerodha Kite's trading functionality with an added Paper Trading mode for risk-free learning.

## 🇮🇳 India-Only Trading Platform

This app is designed exclusively for Indian markets:
- **Exchanges**: NSE, BSE
- **Instruments**: Equity (Cash), Intraday (MIS), Delivery (CNC), Futures & Options (paper mode)
- **Indices**: NIFTY50, BANKNIFTY, FINNIFTY, SENSEX
- **Currency**: ₹ (INR)
- **Market Hours**: 9:15 AM - 3:30 PM IST

## ✨ Features

### Core Trading Features
- **Watchlist**: Multiple watchlists with real-time price updates
- **Order Management**: Full OMS with Market, Limit, Stop-Loss, and Stop-Loss Market orders
- **Portfolio**: Holdings and Positions tracking with live P&L
- **Market Data**: Real-time price updates for NSE/BSE stocks
- **Order Lifecycle**: Complete order status tracking (Open, Executed, Cancelled, Rejected)

### Paper Trading Mode
- **Virtual Balance**: Start with ₹1,00,000 virtual funds
- **Risk-Free Learning**: Practice trading without real money
- **Separate Portfolio**: Independent portfolio for paper trading
- **Reset Functionality**: Clear paper trading data anytime

### Additional Features
- **IPOs**: View and bid on upcoming IPOs (paper mode)
- **Government Securities**: G-Sec information (coming soon)
- **Market News**: India-focused market news
- **Authentication**: Firebase Auth with email verification
- **Onboarding**: User-friendly onboarding flow

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Firebase project (for authentication)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Zeroyodha
```

2. Install dependencies (with Expo SDK 54 compatibility):
```bash
# Clean install to ensure compatibility
rm -rf node_modules package-lock.json
npm install

# Install Expo SDK 54 compatible packages
npx expo install react-native-reanimated@~4.1.1 react-native-worklets@0.5.1
```

**Or use the fix script:**
- **Windows (PowerShell):** `.\fix-dependencies.ps1`
- **Mac/Linux:** `chmod +x fix-dependencies.sh && ./fix-dependencies.sh`

3. Configure Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Email/Password authentication
   - Copy your Firebase config to `src/services/authService.ts`

4. Start the development server (with cleared cache):
```bash
npx expo start --clear
```

**Important:** If you encounter `react-native-reanimated` errors, make sure you've installed the correct versions:
- `react-native-reanimated`: `~4.1.1` (not `^4.2.1`)
- `react-native-worklets`: `0.5.1` (required dependency)

See `FIX_INSTRUCTIONS.md` for detailed troubleshooting.

5. Run on your device:
   - iOS: Press `i` in the terminal or scan QR code with Expo Go app
   - Android: Press `a` in the terminal or scan QR code with Expo Go app

## 📱 App Structure

```
app/
├── (auth)/          # Authentication screens
│   ├── onboarding.tsx
│   ├── login.tsx
│   └── register.tsx
├── (tabs)/          # Main app tabs
│   ├── watchlist.tsx
│   ├── orders.tsx
│   ├── portfolio.tsx
│   ├── bids.tsx
│   └── profile.tsx
├── order.tsx         # Order placement screen
└── _layout.tsx       # Root layout

src/
├── components/       # Reusable components
├── services/         # Business logic services
├── store/           # State management (Zustand)
└── types/           # TypeScript type definitions
```

## 🏗️ Architecture

### State Management
- **Zustand**: Lightweight state management
- **AsyncStorage**: Persistent storage for app state
- **Context API**: For global app state

### Services
- **authService**: Firebase authentication
- **marketDataService**: Real-time market data simulation
- **tradingService**: Order execution and portfolio management

### Key Features Implementation

#### Market Data Engine
- Simulates WebSocket-like real-time updates
- Updates prices every 2 seconds
- Supports 1000+ NSE/BSE stocks

#### Order Management System
- Full order lifecycle simulation
- Supports all Zerodha order types
- Realistic execution with slippage simulation
- Automatic position/holding updates

#### Paper Trading
- Separate virtual balance per mode
- Independent portfolio tracking
- Reset functionality
- Same UI/UX as real trading

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project
2. Enable Email/Password authentication
3. Update `src/services/authService.ts` with your config:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  // ... other config
};
```

### Paper Trading Initial Funds
Default virtual balance is ₹1,00,000. To change:
- Edit `PAPER_INITIAL_FUNDS` in `src/store/useTradingStore.ts`

## 📦 Dependencies

- **expo**: ~54.0.0
- **react-native**: 0.76.5
- **expo-router**: ~4.0.0
- **firebase**: ^11.0.0
- **zustand**: ^5.0.1
- **@react-native-async-storage/async-storage**: 2.1.0
- **react-native-reanimated**: ~3.16.1
- **expo-linear-gradient**: ~14.0.1

## 🎨 UI/UX

- **Dark Theme**: Professional trading-grade dark theme
- **Zerodha-Style**: Replicates Zerodha Kite's navigation and flow
- **Responsive**: Works on all screen sizes
- **Smooth Animations**: React Native Reanimated for smooth transitions

## 🔐 Security

- Email verification required for trading
- Secure authentication with Firebase
- Local data encryption with AsyncStorage
- Paper trading mode isolation

## 📝 Trading Modes

### Paper Trading (Default)
- Virtual funds: ₹1,00,000
- No real money risk
- Perfect for learning
- Can be reset anytime

### Live Trading (Simulated)
- Same UI as paper trading
- Simulated broker logic
- Educational display only

## 🛠️ Development

### Adding New Stocks
Edit `src/services/marketDataService.ts` and add stocks to `INDIAN_STOCKS` array.

### Customizing Market Data
Modify `marketDataService.ts` to change:
- Update frequency
- Price volatility
- Stock list

### Adding Order Types
1. Update `OrderType` in `src/types/index.ts`
2. Add handling in `src/services/tradingService.ts`
3. Update order UI in `app/order.tsx`

## 📄 License

This project is for educational purposes only. Zerodha and Kite are trademarks of Zerodha Technology Pvt. Ltd.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ⚠️ Disclaimer

This is an educational project and does not provide real trading services. Always use official platforms for actual trading. The app simulates trading for learning purposes only.

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ for the Indian trading community**

