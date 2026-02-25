import { Stock, MarketData, Exchange, Candle } from '../types';

// Comprehensive Indian Stock Symbols - NSE/BSE
// NIFTY50 + BANKNIFTY + Additional Major Stocks
const INDIAN_STOCKS: Stock[] = [
  // NIFTY50 - Top 50 Stocks
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
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 2650, change: 15, changePercent: 0.57, volume: 600000, high: 2665, low: 2635, open: 2640, prevClose: 2635 },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 1850, change: 12, changePercent: 0.65, volume: 700000, high: 1860, low: 1840, open: 1845, prevClose: 1838 },
  { symbol: 'LT', name: 'Larsen & Toubro', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 3850, change: 25, changePercent: 0.65, volume: 400000, high: 3870, low: 3830, open: 3840, prevClose: 3825 },
  { symbol: 'AXISBANK', name: 'Axis Bank', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 1150, change: 8, changePercent: 0.70, volume: 1500000, high: 1160, low: 1145, open: 1148, prevClose: 1142 },
  { symbol: 'MARUTI', name: 'Maruti Suzuki', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 12500, change: -100, changePercent: -0.79, volume: 200000, high: 12600, low: 12450, open: 12550, prevClose: 12600 },
  { symbol: 'TITAN', name: 'Titan Company', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 3850, change: 30, changePercent: 0.79, volume: 300000, high: 3870, low: 3820, open: 3830, prevClose: 3820 },
  { symbol: 'ASIANPAINT', name: 'Asian Paints', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 3150, change: 20, changePercent: 0.64, volume: 250000, high: 3170, low: 3130, open: 3140, prevClose: 3130 },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 9850, change: 50, changePercent: 0.51, volume: 150000, high: 9900, low: 9800, open: 9820, prevClose: 9800 },
  { symbol: 'NESTLEIND', name: 'Nestle India', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 24500, change: 150, changePercent: 0.62, volume: 50000, high: 24600, low: 24350, open: 24400, prevClose: 24350 },
  { symbol: 'WIPRO', name: 'Wipro', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 450, change: 5, changePercent: 1.12, volume: 2000000, high: 455, low: 445, open: 448, prevClose: 445 },
  { symbol: 'HCLTECH', name: 'HCL Technologies', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 1650, change: 20, changePercent: 1.23, volume: 800000, high: 1670, low: 1630, open: 1640, prevClose: 1630 },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 1450, change: 10, changePercent: 0.69, volume: 900000, high: 1460, low: 1440, open: 1445, prevClose: 1440 },
  { symbol: 'ONGC', name: 'Oil & Natural Gas Corp', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 280, change: 2, changePercent: 0.72, volume: 5000000, high: 282, low: 278, open: 279, prevClose: 278 },
  { symbol: 'NTPC', name: 'NTPC', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 350, change: 3, changePercent: 0.86, volume: 3000000, high: 352, low: 348, open: 349, prevClose: 347 },
  { symbol: 'POWERGRID', name: 'Power Grid Corp', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 285, change: 2.5, changePercent: 0.88, volume: 4000000, high: 287, low: 283, open: 284, prevClose: 282.5 },
  { symbol: 'COALINDIA', name: 'Coal India', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 450, change: 4, changePercent: 0.90, volume: 2500000, high: 453, low: 447, open: 448, prevClose: 446 },
  { symbol: 'TECHM', name: 'Tech Mahindra', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 1250, change: 15, changePercent: 1.21, volume: 1000000, high: 1265, low: 1235, open: 1240, prevClose: 1235 },
  { symbol: 'TATAMOTORS', name: 'Tata Motors', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 950, change: 8, changePercent: 0.85, volume: 1500000, high: 960, low: 945, open: 948, prevClose: 942 },
  { symbol: 'JSWSTEEL', name: 'JSW Steel', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 850, change: 5, changePercent: 0.59, volume: 1200000, high: 855, low: 845, open: 848, prevClose: 845 },
  { symbol: 'TATASTEEL', name: 'Tata Steel', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 150, change: 1.5, changePercent: 1.01, volume: 8000000, high: 152, low: 148, open: 149, prevClose: 148.5 },
  // BANKNIFTY Components
  { symbol: 'INDUSINDBK', name: 'IndusInd Bank', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 1450, change: 12, changePercent: 0.83, volume: 600000, high: 1460, low: 1440, open: 1445, prevClose: 1438 },
  { symbol: 'PNB', name: 'Punjab National Bank', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 120, change: 1, changePercent: 0.84, volume: 10000000, high: 121, low: 119, open: 119.5, prevClose: 119 },
  { symbol: 'BANKBARODA', name: 'Bank of Baroda', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 250, change: 2, changePercent: 0.81, volume: 5000000, high: 252, low: 248, open: 249, prevClose: 248 },
  { symbol: 'UNIONBANK', name: 'Union Bank of India', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 140, change: 1.2, changePercent: 0.86, volume: 6000000, high: 141, low: 139, open: 139.5, prevClose: 138.8 },
  { symbol: 'CANBK', name: 'Canara Bank', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 550, change: 4, changePercent: 0.73, volume: 2000000, high: 554, low: 546, open: 548, prevClose: 546 },
  // Additional Major Stocks
  { symbol: 'ADANIENT', name: 'Adani Enterprises', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 3200, change: 25, changePercent: 0.79, volume: 400000, high: 3225, low: 3175, open: 3190, prevClose: 3175 },
  { symbol: 'ADANIPORTS', name: 'Adani Ports', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 1350, change: 10, changePercent: 0.75, volume: 800000, high: 1360, low: 1340, open: 1345, prevClose: 1340 },
  { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 6250, change: 50, changePercent: 0.81, volume: 150000, high: 6300, low: 6200, open: 6220, prevClose: 6200 },
  { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 16500, change: 100, changePercent: 0.61, volume: 100000, high: 16600, low: 16400, open: 16450, prevClose: 16400 },
  { symbol: 'BRITANNIA', name: 'Britannia Industries', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 5200, change: 30, changePercent: 0.58, volume: 80000, high: 5230, low: 5170, open: 5190, prevClose: 5170 },
  { symbol: 'CIPLA', name: 'Cipla', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 1450, change: 12, changePercent: 0.83, volume: 700000, high: 1462, low: 1438, open: 1445, prevClose: 1438 },
  { symbol: 'DIVISLAB', name: 'Dr. Reddys Labs', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 5850, change: 45, changePercent: 0.78, volume: 200000, high: 5880, low: 5810, open: 5830, prevClose: 5805 },
  { symbol: 'DRREDDY', name: 'Dr. Reddys Laboratories', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 5850, change: 45, changePercent: 0.78, volume: 200000, high: 5880, low: 5810, open: 5830, prevClose: 5805 },
  { symbol: 'EICHERMOT', name: 'Eicher Motors', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 4200, change: 35, changePercent: 0.84, volume: 120000, high: 4235, low: 4165, open: 4190, prevClose: 4165 },
  { symbol: 'GRASIM', name: 'Grasim Industries', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 2250, change: 18, changePercent: 0.81, volume: 300000, high: 2270, low: 2230, open: 2240, prevClose: 2232 },
  { symbol: 'HDFCLIFE', name: 'HDFC Life Insurance', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 650, change: 5, changePercent: 0.78, volume: 1500000, high: 655, low: 645, open: 648, prevClose: 645 },
  { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 4850, change: 40, changePercent: 0.83, volume: 180000, high: 4890, low: 4810, open: 4830, prevClose: 4810 },
  { symbol: 'HINDALCO', name: 'Hindalco Industries', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 650, change: 5, changePercent: 0.78, volume: 2000000, high: 655, low: 645, open: 648, prevClose: 645 },
  { symbol: 'IOC', name: 'Indian Oil Corp', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 165, change: 1.5, changePercent: 0.92, volume: 6000000, high: 167, low: 163, open: 164, prevClose: 163.5 },
  { symbol: 'M&M', name: 'Mahindra & Mahindra', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 1850, change: 15, changePercent: 0.82, volume: 800000, high: 1865, low: 1835, open: 1845, prevClose: 1835 },
  { symbol: 'MARICO', name: 'Marico', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 550, change: 4, changePercent: 0.73, volume: 1000000, high: 554, low: 546, open: 548, prevClose: 546 },
  { symbol: 'PIDILITIND', name: 'Pidilite Industries', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 2850, change: 22, changePercent: 0.78, volume: 200000, high: 2872, low: 2828, open: 2840, prevClose: 2828 },
  { symbol: 'SHREECEM', name: 'Shree Cement', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 28500, change: 200, changePercent: 0.71, volume: 30000, high: 28700, low: 28300, open: 28450, prevClose: 28300 },
  { symbol: 'TATACONSUM', name: 'Tata Consumer', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 1150, change: 9, changePercent: 0.79, volume: 600000, high: 1160, low: 1140, open: 1145, prevClose: 1141 },
  { symbol: 'VEDL', name: 'Vedanta', exchange: 'NSE', instrumentType: 'EQ', lastPrice: 280, change: 2.5, changePercent: 0.90, volume: 5000000, high: 283, low: 277, open: 279, prevClose: 277.5 },
  // Indices (for reference)
  { symbol: 'NIFTY', name: 'NIFTY 50', exchange: 'NSE', instrumentType: 'INDEX', lastPrice: 25876.85, change: -263.90, changePercent: -1.00, volume: 0, high: 26100, low: 25800, open: 26000, prevClose: 26140.75 },
  { symbol: 'BANKNIFTY', name: 'NIFTY Bank', exchange: 'NSE', instrumentType: 'INDEX', lastPrice: 59686.50, change: -304.35, changePercent: -0.5, volume: 0, high: 60000, low: 59500, open: 59900, prevClose: 59990.85 },
  { symbol: 'FINNIFTY', name: 'NIFTY Financial Services', exchange: 'NSE', instrumentType: 'INDEX', lastPrice: 21500, change: 100, changePercent: 0.47, volume: 0, high: 21550, low: 21450, open: 21475, prevClose: 21400 },
  { symbol: 'SENSEX', name: 'S&P BSE Sensex', exchange: 'BSE', instrumentType: 'INDEX', lastPrice: 84180.96, change: -780.18, changePercent: -0.91, volume: 0, high: 85000, low: 84000, open: 84900, prevClose: 84961.14 },
  { symbol: 'INDIAVIX', name: 'INDIA VIX', exchange: 'NSE', instrumentType: 'INDEX', lastPrice: 10.60, change: 0.65, changePercent: 6.53, volume: 0, high: 11.00, low: 9.50, open: 9.95, prevClose: 9.95 },
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

  // Generate candle data for a stock (for charting)
  generateCandleData(
    symbol: string, 
    period: '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL' = '1M'
  ): Candle[] {
    const stock = this.getStock(symbol);
    if (!stock) return [];

    // Import data parser
    const { generateIndianStockData, parseIBMData } = require('../utils/dataParser');
    
    // Try to use real JSON data if available (for IBM or other stocks with stored data)
    // For now, use generated data for Indian stocks
    // In production, you would check for stored JSON data files or API responses
    
    // Calculate days based on period
    let days = 30;
    if (period === '1D') days = 1;
    else if (period === '1W') days = 7;
    else if (period === '1M') days = 30;
    else if (period === '3M') days = 90;
    else if (period === '1Y') days = 365;
    else if (period === 'ALL') days = 730;

    // Use realistic data generation for Indian stocks
    // This simulates realistic price movements with proper volatility
    return generateIndianStockData(symbol, stock.lastPrice, days);
  }

  // Get candle data from stored JSON data (if available)
  // This method can be used when you have actual JSON data files
  getCandleDataFromJSON(
    symbol: string,
    period: 'daily' | 'intraday' | 'monthly' | 'weekly' = 'daily',
    jsonData?: any
  ): Candle[] {
    if (!jsonData) {
      // Fallback to generated data
      return this.generateCandleData(symbol, period === 'daily' ? '1M' : '1M');
    }

    const { parseIBMData } = require('../utils/dataParser');
    return parseIBMData(jsonData, period);
  }
}

export const marketDataService = new MarketDataService();

