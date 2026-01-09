// Market Types
export type Exchange = 'NSE' | 'BSE' | 'MCX';
export type InstrumentType = 'EQ' | 'FUT' | 'OPT' | 'CUR' | 'COM';
export type ProductType = 'MIS' | 'CNC' | 'NRML';
export type OrderType = 'MARKET' | 'LIMIT' | 'SL' | 'SL-M';
export type OrderStatus = 'OPEN' | 'EXECUTED' | 'CANCELLED' | 'REJECTED' | 'TRIGGER_PENDING';
export type OrderSide = 'BUY' | 'SELL';
export type TradingMode = 'REAL' | 'PAPER';

export interface Stock {
  symbol: string;
  name: string;
  exchange: Exchange;
  instrumentType: InstrumentType;
  lastPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  logo?: string;
}

export interface Order {
  id: string;
  symbol: string;
  exchange: Exchange;
  side: OrderSide;
  type: OrderType;
  product: ProductType;
  quantity: number;
  price?: number;
  triggerPrice?: number;
  status: OrderStatus;
  filledQuantity: number;
  averagePrice?: number;
  placedAt: Date;
  executedAt?: Date;
  cancelledAt?: Date;
  mode: TradingMode;
}

export interface Position {
  symbol: string;
  exchange: Exchange;
  product: ProductType;
  quantity: number;
  averagePrice: number;
  lastPrice: number;
  buyValue: number;
  sellValue: number;
  pnl: number;
  pnlPercent: number;
  mode: TradingMode;
}

export interface Holding {
  symbol: string;
  exchange: Exchange;
  quantity: number;
  averagePrice: number;
  lastPrice: number;
  currentValue: number;
  investment: number;
  pnl: number;
  pnlPercent: number;
  mode: TradingMode;
}

export interface Watchlist {
  id: string;
  name: string;
  symbols: string[];
  createdAt: Date;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  createdAt: Date;
}

export interface Funds {
  available: number;
  used: number;
  total: number;
  mode: TradingMode;
}

export interface IPO {
  id: string;
  name: string;
  symbol: string;
  exchange: Exchange;
  issueSize: number;
  priceRange: { min: number; max: number };
  openDate: Date;
  closeDate: Date;
  listingDate: Date;
  status: 'UPCOMING' | 'OPEN' | 'CLOSED' | 'LISTED';
}

export interface Candle {
  time: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketData {
  symbol: string;
  lastPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  bid: number;
  ask: number;
  timestamp: Date;
}

