import { Order, OrderType, OrderSide, ProductType, TradingMode, Position, Holding } from '../types';
import { marketDataService } from './marketDataService';

class TradingService {
  private onOrderUpdate?: (order: Order) => void;
  private onPositionUpdate?: (positions: Position[]) => void;
  private onHoldingUpdate?: (holdings: Holding[]) => void;
  private onFundsUpdate?: (funds: { available: number; used: number; total: number }) => void;

  setCallbacks(callbacks: {
    onOrderUpdate?: (order: Order) => void;
    onPositionUpdate?: (positions: Position[]) => void;
    onHoldingUpdate?: (holdings: Holding[]) => void;
    onFundsUpdate?: (funds: { available: number; used: number; total: number }) => void;
  }) {
    this.onOrderUpdate = callbacks.onOrderUpdate;
    this.onPositionUpdate = callbacks.onPositionUpdate;
    this.onHoldingUpdate = callbacks.onHoldingUpdate;
    this.onFundsUpdate = callbacks.onFundsUpdate;
  }

  async placeOrder(orderData: {
    symbol: string;
    exchange: string;
    side: OrderSide;
    type: OrderType;
    product: ProductType;
    quantity: number;
    price?: number;
    triggerPrice?: number;
    mode: TradingMode;
    currentOrders?: Order[];
    currentPositions?: Position[];
    currentHoldings?: Holding[];
    currentFunds?: { available: number; used: number; total: number };
  }): Promise<Order> {
    const stock = marketDataService.getStock(orderData.symbol);
    if (!stock) {
      throw new Error('Stock not found');
    }

    const order: Order = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      symbol: orderData.symbol,
      exchange: orderData.exchange as any,
      side: orderData.side,
      type: orderData.type,
      product: orderData.product,
      quantity: orderData.quantity,
      price: orderData.price,
      triggerPrice: orderData.triggerPrice,
      status: 'OPEN',
      filledQuantity: 0,
      placedAt: new Date(),
      mode: orderData.mode,
    };

    // Simulate order execution
    setTimeout(() => {
      this.executeOrder(order, {
        orders: orderData.currentOrders || [],
        positions: orderData.currentPositions || [],
        holdings: orderData.currentHoldings || [],
        funds: orderData.currentFunds || { available: 0, used: 0, total: 0 },
      });
    }, 1000 + Math.random() * 2000); // 1-3 seconds delay

    return order;
  }

  private async executeOrder(
    order: Order,
    state: {
      orders: Order[];
      positions: Position[];
      holdings: Holding[];
      funds: { available: number; used: number; total: number };
    }
  ) {
    const stock = marketDataService.getStock(order.symbol);
    if (!stock) return;

    let executionPrice = stock.lastPrice;

    // Determine execution price based on order type
    if (order.type === 'LIMIT' && order.price) {
      if (order.side === 'BUY' && order.price >= stock.lastPrice) {
        executionPrice = order.price;
      } else if (order.side === 'SELL' && order.price <= stock.lastPrice) {
        executionPrice = order.price;
      } else {
        // Limit not met, keep as OPEN
        return;
      }
    } else if (order.type === 'SL' || order.type === 'SL-M') {
      if (order.triggerPrice) {
        if (order.side === 'BUY' && stock.lastPrice >= order.triggerPrice) {
          executionPrice = order.type === 'SL-M' ? stock.lastPrice : order.triggerPrice;
        } else if (order.side === 'SELL' && stock.lastPrice <= order.triggerPrice) {
          executionPrice = order.type === 'SL-M' ? stock.lastPrice : order.triggerPrice;
        } else {
          // Trigger not met
          return;
        }
      }
    }

    // Simulate slippage (0.1% random)
    const slippage = executionPrice * (Math.random() * 0.002 - 0.001);
    executionPrice = executionPrice + slippage;

    // Update order
    const updatedOrder = {
      ...order,
      status: 'EXECUTED' as const,
      filledQuantity: order.quantity,
      averagePrice: executionPrice,
      executedAt: new Date(),
    };

    const updatedOrders = state.orders.map((o) =>
      o.id === order.id ? updatedOrder : o
    );

    // Update positions/holdings
    const updatedState = this.updatePositionsAndHoldings(
      order,
      executionPrice,
      state
    );
    
    const { positions, holdings, funds } = updatedState;

    // Notify callbacks
    if (this.onOrderUpdate) {
      this.onOrderUpdate(updatedOrder);
    }
    if (this.onPositionUpdate) {
      this.onPositionUpdate(positions);
    }
    if (this.onHoldingUpdate) {
      this.onHoldingUpdate(holdings);
    }
    if (this.onFundsUpdate) {
      this.onFundsUpdate(funds);
    }
  }

  private updatePositionsAndHoldings(
    order: Order,
    executionPrice: number,
    state: {
      positions: Position[];
      holdings: Holding[];
      funds: { available: number; used: number; total: number };
    }
  ): {
    positions: Position[];
    holdings: Holding[];
    funds: { available: number; used: number; total: number };
  } {
    const { positions, holdings, funds } = state;

    const totalValue = order.quantity * executionPrice;

    if (order.product === 'MIS') {
      // Intraday position
      const existingPosition = positions.find(
        (p) => p.symbol === order.symbol && p.product === 'MIS' && p.mode === order.mode
      );

      if (existingPosition) {
        const updatedPositions = positions.map((p) => {
          if (p.symbol === existingPosition.symbol && p.product === existingPosition.product) {
            const newQuantity =
              order.side === 'BUY'
                ? p.quantity + order.quantity
                : p.quantity - order.quantity;

            if (newQuantity === 0) {
              // Position closed
              return null;
            }

            const newAvgPrice =
              order.side === 'BUY'
                ? (p.averagePrice * p.quantity + totalValue) / newQuantity
                : p.averagePrice;

            return {
              ...p,
              quantity: newQuantity,
              averagePrice: newAvgPrice,
              buyValue: order.side === 'BUY' ? p.buyValue + totalValue : p.buyValue,
              sellValue: order.side === 'SELL' ? p.sellValue + totalValue : p.sellValue,
            };
          }
          return p;
        }).filter(Boolean) as Position[];

        return {
          positions: updatedPositions,
          holdings,
          funds,
        };
      } else if (order.side === 'BUY') {
        const stock = marketDataService.getStock(order.symbol);
        const newPosition: Position = {
          symbol: order.symbol,
          exchange: order.exchange,
          product: 'MIS',
          quantity: order.quantity,
          averagePrice: executionPrice,
          lastPrice: stock?.lastPrice || executionPrice,
          buyValue: totalValue,
          sellValue: 0,
          pnl: 0,
          pnlPercent: 0,
          mode: order.mode,
        };
        return {
          positions: [...positions, newPosition],
          holdings,
          funds,
        };
      }
    } else if (order.product === 'CNC') {
      // Delivery holding
      const existingHolding = holdings.find(
        (h) => h.symbol === order.symbol && h.mode === order.mode
      );

      if (existingHolding) {
        const updatedHoldings = holdings.map((h) => {
          if (h.symbol === order.symbol && h.mode === order.mode) {
            const newQuantity =
              order.side === 'BUY'
                ? h.quantity + order.quantity
                : h.quantity - order.quantity;

            if (newQuantity === 0) {
              return null;
            }

            const newAvgPrice =
              order.side === 'BUY'
                ? (h.averagePrice * h.quantity + totalValue) / newQuantity
                : h.averagePrice;

            const stock = marketDataService.getStock(order.symbol);
            const currentValue = newQuantity * (stock?.lastPrice || executionPrice);
            const investment = newAvgPrice * newQuantity;
            const pnl = currentValue - investment;

            return {
              ...h,
              quantity: newQuantity,
              averagePrice: newAvgPrice,
              lastPrice: stock?.lastPrice || executionPrice,
              currentValue,
              investment,
              pnl,
              pnlPercent: (pnl / investment) * 100,
            };
          }
          return h;
        }).filter(Boolean) as Holding[];

        return {
          positions,
          holdings: updatedHoldings,
          funds,
        };
      } else if (order.side === 'BUY') {
        const stock = marketDataService.getStock(order.symbol);
        const newHolding: Holding = {
          symbol: order.symbol,
          exchange: order.exchange,
          quantity: order.quantity,
          averagePrice: executionPrice,
          lastPrice: stock?.lastPrice || executionPrice,
          currentValue: order.quantity * (stock?.lastPrice || executionPrice),
          investment: totalValue,
          pnl: 0,
          pnlPercent: 0,
          mode: order.mode,
        };
        return {
          positions,
          holdings: [...holdings, newHolding],
          funds,
        };
      }
    }

    // Update funds
    let updatedFunds = funds;
    if (order.mode === 'PAPER') {
      const totalValue = order.quantity * executionPrice;
      const newAvailable =
        order.side === 'BUY'
          ? funds.available - totalValue
          : funds.available + totalValue;

      updatedFunds = {
        ...funds,
        available: Math.max(0, newAvailable),
        used: order.side === 'BUY' ? funds.used + totalValue : Math.max(0, funds.used - totalValue),
      };
    }

    // Default return if no position/holding was updated
    return {
      positions,
      holdings,
      funds: updatedFunds,
    };
  }

  async cancelOrder(orderId: string, orders: Order[]): Promise<void> {
    const order = orders.find((o) => o.id === orderId);
    
    if (order && order.status === 'OPEN') {
      // Order can be cancelled
      return;
    }
    
    throw new Error('Order cannot be cancelled');
  }
}

export const tradingService = new TradingService();

