import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order, Position, Holding, TradingMode, Funds } from '../types';
import { tradingService } from '../services/tradingService';

interface TradingState {
  mode: TradingMode;
  orders: Order[];
  positions: Position[];
  holdings: Holding[];
  funds: Funds;
  setMode: (mode: TradingMode) => Promise<void>;
  placeOrder: (order: Omit<Order, 'id' | 'status' | 'placedAt' | 'mode'>) => Promise<Order>;
  cancelOrder: (orderId: string) => Promise<void>;
  resetPaperTrading: () => Promise<void>;
  loadData: () => Promise<void>;
  saveData: () => Promise<void>;
}

const PAPER_INITIAL_FUNDS = 100000; // ₹1,00,000

export const useTradingStore = create<TradingState>((set, get) => ({
  mode: 'PAPER',
  orders: [],
  positions: [],
  holdings: [],
  funds: {
    available: PAPER_INITIAL_FUNDS,
    used: 0,
    total: PAPER_INITIAL_FUNDS,
    mode: 'PAPER',
  },

  setMode: async (mode: TradingMode) => {
    set({ mode });
    await AsyncStorage.setItem('tradingMode', mode);
    await get().loadData();
  },

  placeOrder: async (orderData) => {
    const { mode, orders, positions, holdings, funds } = get();
    const order = await tradingService.placeOrder({
      ...orderData,
      mode,
      currentOrders: orders,
      currentPositions: positions,
      currentHoldings: holdings,
      currentFunds: funds,
    });
    set((state) => ({
      orders: [order, ...state.orders],
    }));
    
    // Set up callbacks for order execution updates
    tradingService.setCallbacks({
      onOrderUpdate: (updatedOrder) => {
        set((state) => ({
          orders: state.orders.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)),
        }));
        get().saveData();
      },
      onPositionUpdate: (updatedPositions) => {
        set({ positions: updatedPositions });
        get().saveData();
      },
      onHoldingUpdate: (updatedHoldings) => {
        set({ holdings: updatedHoldings });
        get().saveData();
      },
      onFundsUpdate: (updatedFunds) => {
        set({
          funds: {
            ...updatedFunds,
            total: updatedFunds.available + updatedFunds.used,
            mode,
          },
        });
        get().saveData();
      },
    });
    
    await get().saveData();
    return order;
  },

  cancelOrder: async (orderId: string) => {
    const { orders } = get();
    await tradingService.cancelOrder(orderId, orders);
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status: 'CANCELLED' as const } : o
      ),
    }));
    await get().saveData();
  },

  resetPaperTrading: async () => {
    const { mode } = get();
    if (mode === 'PAPER') {
      set({
        orders: [],
        positions: [],
        holdings: [],
        funds: {
          available: PAPER_INITIAL_FUNDS,
          used: 0,
          total: PAPER_INITIAL_FUNDS,
          mode: 'PAPER',
        },
      });
      await get().saveData();
    }
  },

  loadData: async () => {
    try {
      const mode = (await AsyncStorage.getItem('tradingMode')) as TradingMode || 'PAPER';
      const dataKey = `tradingData_${mode}`;
      const data = await AsyncStorage.getItem(dataKey);
      
      if (data) {
        const parsed = JSON.parse(data);
        set({
          mode,
          orders: parsed.orders?.map((o: any) => ({ ...o, placedAt: new Date(o.placedAt) })) || [],
          positions: parsed.positions || [],
          holdings: parsed.holdings || [],
          funds: parsed.funds || {
            available: PAPER_INITIAL_FUNDS,
            used: 0,
            total: PAPER_INITIAL_FUNDS,
            mode,
          },
        });
      } else if (mode === 'PAPER') {
        set({
          mode,
          funds: {
            available: PAPER_INITIAL_FUNDS,
            used: 0,
            total: PAPER_INITIAL_FUNDS,
            mode: 'PAPER',
          },
        });
      } else {
        set({ mode });
      }
    } catch (error) {
      console.error('Error loading trading data:', error);
      // Set default state on error
      set({
        mode: 'PAPER',
        orders: [],
        positions: [],
        holdings: [],
        funds: {
          available: PAPER_INITIAL_FUNDS,
          used: 0,
          total: PAPER_INITIAL_FUNDS,
          mode: 'PAPER',
        },
      });
    }
  },

  saveData: async () => {
    try {
      const { mode, orders, positions, holdings, funds } = get();
      const dataKey = `tradingData_${mode}`;
      await AsyncStorage.setItem(dataKey, JSON.stringify({
        orders,
        positions,
        holdings,
        funds,
      }));
    } catch (error) {
      console.error('Error saving trading data:', error);
    }
  },
}));

