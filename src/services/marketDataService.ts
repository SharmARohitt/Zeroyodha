import { Stock, MarketData, Exchange } from '../types';

// Indian Stock Symbols - NSE/BSE
const INDIAN_STOCKS: Stock[] = [
  // NIFTY50
  { symbol: 'RELIANCE', name: 'Reliance Industries', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 2450, change: 12.5, changePercent: 0.51, volume: 1000000, high: 2460, low: 2430, open: 2440, prevClose: 2437.5 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 3850, change: -25, changePercent: -0.65, volume: 500000, high: 3880, low: 3840, open: 3860, prevClose: 3875 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 1650, change: 8.5, changePercent: 0.52, volume: 2000000, high: 1660, low: 1640, open: 1645, prevClose: 1641.5 },
  { symbol: 'INFY', name: 'Infosys', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 1520, change: 15, changePercent: 1.0, volume: 1500000, high: 1530, low: 1510, open: 1515, prevClose: 1505 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 1120, change: 5.5, changePercent: 0.49, volume: 1800000, high: 1125, low: 1115, open: 1118, prevClose: 1114.5 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 1250, change: 20, changePercent: 1.63, volume: 800000, high: 1260, low: 1240, open: 1245, prevClose: 1230 },
  { symbol: 'SBIN', name: 'State Bank of India', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 680, change: 3.5, changePercent: 0.52, volume: 2500000, high: 685, low: 675, open: 678, prevClose: 676.5 },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 7200, change: -50, changePercent: -0.69, volume: 300000, high: 7250, low: 7180, open: 7220, prevClose: 7250 },
  { symbol: 'LICI', name: 'Life Insurance Corp', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 950, change: 10, changePercent: 1.06, volume: 1200000, high: 955, low: 945, open: 948, prevClose: 940 },
  { symbol: 'ITC', name: 'ITC Limited', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 450, change: 2.5, changePercent: 0.56, volume: 2000000, high: 452, low: 448, open: 449, prevClose: 447.5 },
  // Add more stocks...
];

// Generate more stocks for variety
const generateMoreStocks = (): Stock[] => {
  const symbols = ['WIPRO', 'HCLTECH', 'LT', 'MARUTI', 'TITAN', 'NTPC', 'ONGC', 'POWERGRID', 'COALINDIA', 'ULTRACEMCO'];
  const names = ['Wipro', 'HCL Technologies', 'Larsen & Toubro', 'Maruti Suzuki', 'Titan Company', 'NTPC', 'ONGC', 'Power Grid', 'Coal India', 'UltraTech Cement'];
  
  return symbols.map((symbol, idx) => ({
    symbol,
    name: names[idx],
    exchange: 'NSE' as Exchange,
    instrumentType: 'EQ' as const,
    lastPrice: Math.floor(Math.random() * 2000) + 100,
    change: (Math.random() - 0.5) * 50,
    changePercent: (Math.random() - 0.5) * 3,
    volume: Math.floor(Math.random() * 5000000),
    high: 0,
    low: 0,
    open: 0,
    prevClose: 0,
  }));
};

class MarketDataService {
  private updateCallbacks: ((data: MarketData) => void)[] = [];
  private updateInterval: NodeJS.Timeout | null = null;
  private stocks: Stock[] = [];

  async getInitialStocks(): Promise<Stock[]> {
    this.stocks = [...INDIAN_STOCKS, ...generateMoreStocks()];
    // Initialize high/low/open from lastPrice
    this.stocks = this.stocks.map((stock) => ({
      ...stock,
      high: stock.lastPrice * 1.02,
      low: stock.lastPrice * 0.98,
      open: stock.lastPrice * 0.99,
      prevClose: stock.lastPrice - stock.change,
    }));
    return this.stocks;
  }

  startUpdates(callback: (data: MarketData) => void) {
    this.updateCallbacks.push(callback);
    
    if (!this.updateInterval) {
      this.updateInterval = setInterval(() => {
        this.updatePrices();
      }, 2000); // Update every 2 seconds
    }
  }

  stopUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.updateCallbacks = [];
  }

  private updatePrices() {
    this.stocks.forEach((stock) => {
      // Simulate price movement
      const volatility = 0.002; // 0.2% volatility
      const change = (Math.random() - 0.5) * volatility * stock.lastPrice;
      const newPrice = Math.max(1, stock.lastPrice + change);
      
      const marketData: MarketData = {
        symbol: stock.symbol,
        lastPrice: newPrice,
        change: newPrice - stock.prevClose,
        changePercent: ((newPrice - stock.prevClose) / stock.prevClose) * 100,
        volume: stock.volume + Math.floor(Math.random() * 10000),
        high: Math.max(stock.high, newPrice),
        low: Math.min(stock.low || newPrice, newPrice),
        open: stock.open || newPrice,
        prevClose: stock.prevClose,
        bid: newPrice * 0.9999,
        ask: newPrice * 1.0001,
        timestamp: new Date(),
      };

      // Update stock
      stock.lastPrice = newPrice;
      stock.change = marketData.change;
      stock.changePercent = marketData.changePercent;
      stock.volume = marketData.volume;
      stock.high = marketData.high;
      stock.low = marketData.low;

      // Notify callbacks
      this.updateCallbacks.forEach((cb) => cb(marketData));
    });
  }

  getStock(symbol: string): Stock | undefined {
    return this.stocks.find((s) => s.symbol === symbol);
  }

  searchStocks(query: string): Stock[] {
    const lowerQuery = query.toLowerCase();
    return this.stocks.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(lowerQuery) ||
        stock.name.toLowerCase().includes(lowerQuery)
    );
  }
}

export const marketDataService = new MarketDataService();

