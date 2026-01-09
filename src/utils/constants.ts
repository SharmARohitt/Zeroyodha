// Market Constants
export const MARKET_HOURS = {
  PRE_MARKET_START: '09:00',
  PRE_MARKET_END: '09:15',
  NORMAL_START: '09:15',
  NORMAL_END: '15:30',
  POST_MARKET_START: '15:40',
  POST_MARKET_END: '16:00',
};

export const EXCHANGES = {
  NSE: 'NSE',
  BSE: 'BSE',
  MCX: 'MCX',
} as const;

export const PRODUCT_TYPES = {
  MIS: 'MIS',
  CNC: 'CNC',
  NRML: 'NRML',
} as const;

export const ORDER_TYPES = {
  MARKET: 'MARKET',
  LIMIT: 'LIMIT',
  SL: 'SL',
  SL_M: 'SL-M',
} as const;

export const PAPER_TRADING_INITIAL_FUNDS = 100000; // ₹1,00,000

// Indian Market Indices
export const INDICES = {
  NIFTY50: 'NIFTY 50',
  BANKNIFTY: 'NIFTY BANK',
  FINNIFTY: 'NIFTY FIN SERVICE',
  SENSEX: 'SENSEX',
} as const;

