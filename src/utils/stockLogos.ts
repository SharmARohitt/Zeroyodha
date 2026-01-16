// Stock logo mapping with colors for Indian stocks
// Real logos fetched from Logo.dev API
import { benzingaService } from '../services/benzingaService';

interface StockLogoInfo {
  color: string;
  imageUrl?: string;
}

// Remove static logo URLs - we'll fetch them dynamically
const STOCK_LOGO_URLS: Record<string, string> = {};

const STOCK_LOGOS: Record<string, StockLogoInfo> = {
  // Major Banks
  'HDFCBANK': { color: '#004C8F' },
  'ICICIBANK': { color: '#F37021' },
  'SBIN': { color: '#22409A' },
  'KOTAKBANK': { color: '#ED232A' },
  'AXISBANK': { color: '#97144D' },
  'INDUSINDBK': { color: '#ED1C24' },
  'PNB': { color: '#0066B3' },
  'BANKBARODA': { color: '#F15A29' },
  'UNIONBANK': { color: '#E31E24' },
  'CANBK': { color: '#ED1C24' },
  
  // IT Companies
  'TCS': { color: '#0F62FE' },
  'INFY': { color: '#007CC3' },
  'WIPRO': { color: '#7B3F00' },
  'HCLTECH': { color: '#0066B3' },
  'TECHM': { color: '#FF6600' },
  
  // Telecom
  'BHARTIARTL': { color: '#E60000' },
  
  // Oil & Gas
  'RELIANCE': { color: '#0033A0' },
  'ONGC': { color: '#FF6600' },
  'IOC': { color: '#ED1C24' },
  
  // Power
  'NTPC': { color: '#0066B3' },
  'POWERGRID': { color: '#ED1C24' },
  'COALINDIA': { color: '#000000' },
  
  // Automobiles
  'MARUTI': { color: '#0033A0' },
  'TATAMOTORS': { color: '#0066B3' },
  'EICHERMOT': { color: '#ED1C24' },
  'HEROMOTOCO': { color: '#ED1C24' },
  'M&M': { color: '#ED1C24' },
  
  // Pharma
  'SUNPHARMA': { color: '#0066B3' },
  'CIPLA': { color: '#ED1C24' },
  'DIVISLAB': { color: '#0066B3' },
  'DRREDDY': { color: '#ED1C24' },
  
  // FMCG
  'ITC': { color: '#003087' },
  'HINDUNILVR': { color: '#0066B3' },
  'NESTLEIND': { color: '#ED1C24' },
  'BRITANNIA': { color: '#ED1C24' },
  'MARICO': { color: '#0066B3' },
  'TATACONSUM': { color: '#0066B3' },
  
  // Cement
  'ULTRACEMCO': { color: '#666666' },
  'SHREECEM': { color: '#999999' },
  'GRASIM': { color: '#0066B3' },
  
  // Steel & Metals
  'JSWSTEEL': { color: '#0066B3' },
  'TATASTEEL': { color: '#0066B3' },
  'HINDALCO': { color: '#ED1C24' },
  'VEDL': { color: '#ED1C24' },
  
  // Finance
  'BAJFINANCE': { color: '#0066B3' },
  'BAJAJFINSV': { color: '#0066B3' },
  'HDFCLIFE': { color: '#004C8F' },
  'LICI': { color: '#FF6600' },
  
  // Conglomerates
  'LT': { color: '#ED1C24' },
  'ADANIENT': { color: '#0066B3' },
  'ADANIPORTS': { color: '#0066B3' },
  
  // Retail & Consumer
  'TITAN': { color: '#FFD700' },
  'ASIANPAINT': { color: '#ED1C24' },
  'PIDILITIND': { color: '#ED1C24' },
  
  // Healthcare
  'APOLLOHOSP': { color: '#0066B3' },
  
  // Indices
  'NIFTY': { color: '#0066B3' },
  'BANKNIFTY': { color: '#ED1C24' },
  'FINNIFTY': { color: '#FF6600' },
  'SENSEX': { color: '#0066B3' },
  'INDIAVIX': { color: '#FF6600' },
};

// Color palette for stocks without specific logos
const DEFAULT_COLORS = [
  '#2962FF', '#00D4FF', '#00C853', '#FF6600', '#9C27B0',
  '#E91E63', '#FF5252', '#FFC107', '#00BCD4', '#4CAF50',
];

// Cache for Benzinga logos
const benzingaLogoCache = new Map<string, string>();

export async function getStockLogoAsync(symbol: string): Promise<StockLogoInfo> {
  // Check if we have a cached logo
  if (benzingaLogoCache.has(symbol)) {
    const imageUrl = benzingaLogoCache.get(symbol);
    return {
      imageUrl,
      color: STOCK_LOGOS[symbol]?.color || getDefaultColor(symbol),
    };
  }

  // Try to fetch from Logo.dev API
  try {
    const logoUrl = await benzingaService.getStockLogo(symbol);
    if (logoUrl) {
      benzingaLogoCache.set(symbol, logoUrl);
      return {
        imageUrl: logoUrl,
        color: STOCK_LOGOS[symbol]?.color || getDefaultColor(symbol),
      };
    }
  } catch (error) {
    console.warn(`Failed to fetch logo for ${symbol}:`, error);
  }

  // Fallback to color only
  return getStockLogo(symbol);
}

function getDefaultColor(symbol: string): string {
  const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorIndex = hash % DEFAULT_COLORS.length;
  return DEFAULT_COLORS[colorIndex];
}

export function getStockLogo(symbol: string): StockLogoInfo {
  // Check if we have a cached logo from API
  const cachedUrl = benzingaService.getCachedLogo(symbol);
  if (cachedUrl) {
    return {
      imageUrl: cachedUrl,
      color: STOCK_LOGOS[symbol]?.color || getDefaultColor(symbol),
    };
  }

  // Check if we have a specific color for this stock
  if (STOCK_LOGOS[symbol]) {
    return STOCK_LOGOS[symbol];
  }
  
  // Generate a consistent color based on symbol
  return {
    color: getDefaultColor(symbol),
  };
}

export function hasStockLogo(symbol: string): boolean {
  return symbol in STOCK_LOGOS || benzingaService.getCachedLogo(symbol) !== null;
}

// Preload logos for common stocks
export async function preloadStockLogos(symbols: string[]): Promise<void> {
  try {
    await benzingaService.getStockLogos(symbols);
  } catch (error) {
    console.warn('Failed to preload stock logos:', error);
  }
}
