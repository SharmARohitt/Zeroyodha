# Benzinga API Integration

## Overview
This app now integrates with Benzinga API to fetch real stock logos for better visual experience.

## API Key
The Benzinga API key is stored in `.env`:
```
EXPO_PUBLIC_BENZINGA_API_KEY=bz.S2EJKEA5CO7YELLCJOE7E7GSUI5QZCIR
```

## Features

### 1. Stock Logo Fetching
- Automatically fetches stock logos from Benzinga API
- Supports both US and Indian stocks (NSE/BSE)
- Caches logos to minimize API calls
- Falls back to emoji/color system if logo not available

### 2. Batch Loading
- Preloads logos for all stocks in watchlist on app startup
- Reduces loading time during browsing

### 3. Fallback System
- If Benzinga logo not available: uses emoji icons
- If emoji not defined: uses color-coded initials
- Ensures consistent visual experience

## Usage

### In Components
```typescript
import { getStockLogo, getStockLogoAsync } from '../utils/stockLogos';

// Synchronous (uses cache or fallback)
const logoInfo = getStockLogo('RELIANCE');

// Asynchronous (fetches from API if needed)
const logoInfo = await getStockLogoAsync('RELIANCE');

// Logo info contains:
// - imageUrl?: string (Benzinga logo URL)
// - emoji?: string (fallback emoji)
// - color: string (brand color or generated color)
```

### Preloading
```typescript
import { preloadStockLogos } from '../utils/stockLogos';

// Preload logos for multiple stocks
await preloadStockLogos(['RELIANCE', 'TCS', 'INFY']);
```

## API Endpoints Used

### Get Logo
```
GET https://api.benzinga.com/api/v2/logos?symbols=RELIANCE.NS&token={API_KEY}
```

### Batch Get Logos
```
GET https://api.benzinga.com/api/v2/logos?symbols=RELIANCE.NS,TCS.NS,INFY.NS&token={API_KEY}
```

## Symbol Formatting

### Indian Stocks (NSE)
- Input: `RELIANCE`
- Formatted: `RELIANCE.NS`

### Indian Stocks (BSE)
- Input: `RELIANCE`
- Formatted: `RELIANCE.BO`

### US Stocks
- Input: `AAPL`
- Formatted: `AAPL` (no change)

## Files Modified

1. **src/services/benzingaService.ts** - New service for Benzinga API
2. **src/utils/stockLogos.ts** - Updated to integrate Benzinga
3. **src/components/StockCard.tsx** - Updated to display real logos
4. **src/store/useMarketStore.ts** - Added logo preloading
5. **.env** - Added Benzinga API key

## Carousel Changes

### Portfolio Page
- ✅ Kept: Top Indices Carousel
- ❌ Removed: Universal Carousel (second carousel)

### Profile Page
- ✅ Kept: Top Indices Carousel
- ❌ Removed: Universal Carousel (second carousel)

This keeps the UI clean with only the main trading carousel visible.

## Performance Considerations

1. **Caching**: Logos are cached in memory to avoid repeated API calls
2. **Batch Loading**: Multiple logos fetched in single API call
3. **Background Loading**: Logos preloaded asynchronously without blocking UI
4. **Fallback**: Instant fallback to emoji/color if API fails

## Error Handling

- API failures are logged but don't break the UI
- Automatic fallback to emoji/color system
- Network errors are caught and handled gracefully
- Invalid symbols return null without crashing

## Future Enhancements

1. Persist logo cache to AsyncStorage
2. Add logo refresh mechanism
3. Support for custom logo uploads
4. Add logo size variants (small, medium, large)
