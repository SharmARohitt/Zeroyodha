import { create } from 'zustand';
import { Stock, MarketData, Watchlist } from '../types';
import { marketDataService } from '../services/marketDataService';
import { preloadStockLogos } from '../utils/stockLogos';

interface MarketState {
  stocks: Record<string, Stock>;
  watchlists: Watchlist[];
  currentWatchlist: string | null;
  marketData: Record<string, MarketData>;
  selectedSymbol: string | null;
  setSelectedSymbol: (symbol: string | null) => void;
  addToWatchlist: (symbol: string, watchlistId?: string) => void;
  removeFromWatchlist: (symbol: string, watchlistId?: string) => void;
  createWatchlist: (name: string) => void;
  setCurrentWatchlist: (id: string) => void;
  updateMarketData: (data: MarketData) => void;
  initializeMarketData: () => Promise<void>;
  searchStocks: (query: string) => Stock[];
}

export const useMarketStore = create<MarketState>((set, get) => ({
  stocks: {},
  watchlists: [],
  currentWatchlist: null,
  marketData: {},
  selectedSymbol: null,

  setSelectedSymbol: (symbol: string | null) => {
    set({ selectedSymbol: symbol });
  },

  addToWatchlist: (symbol: string, watchlistId?: string) => {
    const { watchlists, currentWatchlist } = get();
    const targetId = watchlistId || currentWatchlist || watchlists[0]?.id;
    
    if (targetId) {
      set({
        watchlists: watchlists.map((w) =>
          w.id === targetId && !w.symbols.includes(symbol)
            ? { ...w, symbols: [...w.symbols, symbol] }
            : w
        ),
      });
    }
  },

  removeFromWatchlist: (symbol: string, watchlistId?: string) => {
    const { watchlists, currentWatchlist } = get();
    const targetId = watchlistId || currentWatchlist || watchlists[0]?.id;
    
    if (targetId) {
      set({
        watchlists: watchlists.map((w) =>
          w.id === targetId
            ? { ...w, symbols: w.symbols.filter((s) => s !== symbol) }
            : w
        ),
      });
    }
  },

  createWatchlist: (name: string) => {
    const newWatchlist: Watchlist = {
      id: Date.now().toString(),
      name,
      symbols: [],
      createdAt: new Date(),
    };
    set((state) => ({
      watchlists: [...state.watchlists, newWatchlist],
      currentWatchlist: newWatchlist.id,
    }));
  },

  setCurrentWatchlist: (id: string) => {
    set({ currentWatchlist: id });
  },

  updateMarketData: (data: MarketData) => {
    set((state) => ({
      marketData: {
        ...state.marketData,
        [data.symbol]: data,
      },
      stocks: {
        ...state.stocks,
        [data.symbol]: {
          ...state.stocks[data.symbol],
          symbol: data.symbol,
          lastPrice: data.lastPrice,
          change: data.change,
          changePercent: data.changePercent,
          volume: data.volume,
          high: data.high,
          low: data.low,
          open: data.open,
          prevClose: data.prevClose,
        },
      },
    }));
  },

  initializeMarketData: async () => {
    try {
      const stocks = await marketDataService.getInitialStocks();
      const stocksMap: Record<string, Stock> = {};
      stocks.forEach((stock) => {
        stocksMap[stock.symbol] = stock;
      });
      
      // Preload stock logos from Benzinga in background
      const stockSymbols = stocks.map(s => s.symbol);
      preloadStockLogos(stockSymbols).catch(err => 
        console.warn('Failed to preload logos:', err)
      );
      
      // Initialize multiple default watchlists
      const existingWatchlists = get().watchlists;
      if (existingWatchlists.length === 0) {
        const basicWatchlist: Watchlist = {
          id: 'basic',
          name: 'Basic',
          symbols: stocks.slice(0, 15).map((s) => s.symbol),
          createdAt: new Date(),
        };
        
        const longTermWatchlist: Watchlist = {
          id: 'long-term',
          name: 'Long Term',
          symbols: stocks.slice(15, 30).map((s) => s.symbol),
          createdAt: new Date(),
        };
        
        const watchlist3: Watchlist = {
          id: 'watchlist-3',
          name: 'Watchlist 3',
          symbols: stocks.slice(30, 45).map((s) => s.symbol),
          createdAt: new Date(),
        };

        set({
          stocks: stocksMap,
          watchlists: [basicWatchlist, longTermWatchlist, watchlist3],
          currentWatchlist: basicWatchlist.id,
        });
      } else {
        // Just update stocks if watchlists already exist
        set({ stocks: stocksMap });
      }

      // Start market data updates
      marketDataService.startUpdates((data) => {
        get().updateMarketData(data);
      });
    } catch (error) {
      console.error('Error initializing market data:', error);
      // Set empty state to prevent crashes
      set({
        stocks: {},
        watchlists: [],
        currentWatchlist: null,
      });
    }
  },

  searchStocks: (query: string) => {
    return marketDataService.searchStocks(query);
  },
}));

