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

export interface IPOSubscriptionData {
  qib: {
    sharesOffered: number;
    sharesApplied: number;
    timesSubscribed: number;
  };
  nii: {
    sharesOffered: number;
    sharesApplied: number;
    timesSubscribed: number;
  };
  retail: {
    sharesOffered: number;
    sharesApplied: number;
    timesSubscribed: number;
  };
  total: {
    sharesOffered: number;
    sharesApplied: number;
    timesSubscribed: number;
  };
  lastUpdated: Date;
}

export interface IPOGMPData {
  gmp: number;
  gmpPercent: number;
  estimatedListing: number;
  lastUpdated: Date;
  subject: string;
}

export interface IPOAllotmentData {
  status: 'PENDING' | 'FINALIZED' | 'REFUND_INITIATED' | 'COMPLETED';
  allotmentDate?: Date;
  listingDate?: Date;
  registrarName: string;
  registrarWebsite: string;
}

export interface IPO {
  id: string;
  name: string;
  symbol: string;
  exchange: 'NSE' | 'BSE' | 'BOTH';
  issueSize: number;
  freshIssue: number;
  offerForSale: number;
  priceRange: { min: number; max: number };
  lotSize: number;
  openDate: Date;
  closeDate: Date;
  basisOfAllotment?: Date;
  initiationOfRefunds?: Date;
  creditOfShares?: Date;
  listingDate?: Date;
  status: 'UPCOMING' | 'OPEN' | 'CLOSED' | 'ALLOTTED' | 'LISTED';
  subscription?: IPOSubscriptionData;
  gmp?: IPOGMPData;
  allotment?: IPOAllotmentData;
  companyInfo: {
    industry: string;
    faceValue: number;
    marketLot: number;
    minInvestment: number;
    maxInvestment?: number;
  };
  financials?: {
    revenue: number;
    profit: number;
    eps: number;
    peRatio?: number;
    roe?: number;
  };
  leadManagers: string[];
  registrar: string;
  reviews?: {
    source: string;
    rating: 'APPLY' | 'MAY_APPLY' | 'NEUTRAL' | 'AVOID';
    reason?: string;
  }[];
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

