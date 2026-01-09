import { Candle } from '../types';

// Types for Alpha Vantage API response format
interface AlphaVantageTimeSeries {
  [date: string]: {
    '1. open': string;
    '2. high': string;
    '3. low': string;
    '4. close': string;
    '5. volume': string;
  };
}

interface AlphaVantageResponse {
  'Meta Data': {
    '1. Information': string;
    '2. Symbol': string;
    '3. Last Refreshed': string;
    '4. Output Size'?: string;
    '5. Time Zone'?: string;
    '4. Interval'?: string;
  };
  'Time Series (Daily)'?: AlphaVantageTimeSeries;
  'Time Series (5min)'?: AlphaVantageTimeSeries;
  'Time Series (1min)'?: AlphaVantageTimeSeries;
  'Monthly Time Series'?: AlphaVantageTimeSeries;
  'Weekly Time Series'?: AlphaVantageTimeSeries;
}

/**
 * Parse Alpha Vantage API response to Candle array
 */
export function parseAlphaVantageData(
  data: AlphaVantageResponse,
  period: 'daily' | 'intraday' | 'monthly' | 'weekly' = 'daily'
): Candle[] {
  let timeSeries: AlphaVantageTimeSeries | undefined;

  // Determine which time series to use
  if (period === 'daily') {
    timeSeries = data['Time Series (Daily)'];
  } else if (period === 'intraday') {
    timeSeries = data['Time Series (5min)'] || data['Time Series (1min)'];
  } else if (period === 'monthly') {
    timeSeries = data['Monthly Time Series'];
  } else if (period === 'weekly') {
    timeSeries = data['Weekly Time Series'];
  }

  if (!timeSeries) {
    return [];
  }

  // Convert to Candle array, sorted by time (oldest first)
  const candles: Candle[] = Object.entries(timeSeries)
    .map(([dateStr, values]) => {
      // Parse date string (format: "2025-07-15" or "2025-07-15 19:55:00")
      const dateParts = dateStr.split(' ');
      const dateOnly = dateParts[0];
      const timeOnly = dateParts[1] || '00:00:00';
      
      const [year, month, day] = dateOnly.split('-').map(Number);
      const [hours, minutes, seconds] = timeOnly.split(':').map(Number);
      
      const time = new Date(year, month - 1, day, hours || 0, minutes || 0, seconds || 0);

      return {
        time,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume'], 10),
      };
    })
    .sort((a, b) => a.time.getTime() - b.time.getTime()); // Sort by time ascending

  return candles;
}

/**
 * Convert IBM JSON data (provided by user) to Candle array
 * This handles the specific format the user provided
 */
export function parseIBMData(
  jsonData: any,
  period: 'daily' | 'intraday' | 'monthly' | 'weekly' = 'daily'
): Candle[] {
  try {
    // Handle the format provided by user
    let timeSeries: any;

    if (period === 'daily') {
      timeSeries = jsonData['Time Series (Daily)'];
    } else if (period === 'intraday') {
      timeSeries = jsonData['Time Series (5min)'];
    } else if (period === 'monthly') {
      timeSeries = jsonData['Monthly Time Series'];
    } else if (period === 'weekly') {
      timeSeries = jsonData['Weekly Time Series'];
    }

    if (!timeSeries) {
      return [];
    }

    const candles: Candle[] = Object.entries(timeSeries)
      .map(([dateStr, values]: [string, any]) => {
        // Parse date string
        const dateParts = dateStr.split(' ');
        const dateOnly = dateParts[0];
        const timeOnly = dateParts[1] || '00:00:00';
        
        const [year, month, day] = dateOnly.split('-').map(Number);
        const [hours, minutes, seconds] = timeOnly.split(':').map(Number);
        
        const time = new Date(year, month - 1, day, hours || 0, minutes || 0, seconds || 0);

        return {
          time,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume'], 10),
        };
      })
      .sort((a, b) => a.time.getTime() - b.time.getTime());

    return candles;
  } catch (error) {
    console.error('Error parsing IBM data:', error);
    return [];
  }
}

/**
 * Generate sample Indian stock data in IBM format for testing
 */
export function generateIndianStockData(
  symbol: string,
  basePrice: number,
  days: number = 30
): Candle[] {
  const candles: Candle[] = [];
  const now = new Date();
  let currentPrice = basePrice;

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(9, 15, 0, 0); // Market open time

    // Simulate realistic price movement
    const volatility = 0.02; // 2% daily volatility
    const trend = (Math.random() - 0.5) * 0.001; // Slight trend
    const change = (Math.random() - 0.5) * volatility * currentPrice + trend * currentPrice;
    
    const open = currentPrice;
    const close = Math.max(1, open + change);
    const high = Math.max(open, close) * (1 + Math.random() * 0.015);
    const low = Math.min(open, close) * (1 - Math.random() * 0.015);
    const volume = Math.floor(Math.random() * 5000000) + 100000;

    candles.push({
      time: date,
      open,
      high,
      low,
      close,
      volume,
    });

    currentPrice = close;
  }

  return candles;
}

