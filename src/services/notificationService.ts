// Mock notification service for stock alerts
export interface StockAlert {
  id: string;
  symbol: string;
  type: 'price_increase' | 'price_decrease' | 'volume_spike' | 'news_alert' | 'urgent_news';
  message: string;
  timestamp: Date;
  read: boolean;
  urgent?: boolean;
}

class NotificationService {
  private alerts: StockAlert[] = [];
  private listeners: ((alerts: StockAlert[]) => void)[] = [];

  // Mock alerts for demonstration - Only urgent news
  private mockAlerts: StockAlert[] = [
    {
      id: '1',
      symbol: 'MARKET',
      type: 'urgent_news',
      message: '🚨 SEBI announces new trading regulations effective from next month',
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      read: false,
      urgent: true,
    },
    {
      id: '2',
      symbol: 'NIFTY',
      type: 'urgent_news',
      message: '⚠️ Market volatility expected due to global economic concerns',
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      read: false,
      urgent: true,
    },
    {
      id: '3',
      symbol: 'RELIANCE',
      type: 'urgent_news',
      message: '📢 Reliance Industries announces major acquisition deal',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: true,
      urgent: true,
    },
  ];

  constructor() {
    // Initialize with mock alerts
    this.alerts = [...this.mockAlerts];
  }

  getAlerts(): StockAlert[] {
    return this.alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getUnreadCount(): number {
    return this.alerts.filter(alert => !alert.read).length;
  }

  markAsRead(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.read = true;
      this.notifyListeners();
    }
  }

  markAllAsRead(): void {
    this.alerts.forEach(alert => alert.read = true);
    this.notifyListeners();
  }

  addAlert(alert: Omit<StockAlert, 'id' | 'timestamp' | 'read'>): void {
    const newAlert: StockAlert = {
      ...alert,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
      urgent: alert.urgent || false,
    };
    this.alerts.unshift(newAlert);
    this.notifyListeners();
  }

  subscribe(listener: (alerts: StockAlert[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getAlerts()));
  }

  // Simulate real-time alerts - Only urgent news
  startMockAlerts(): void {
    setInterval(() => {
      if (Math.random() > 0.8) { // 20% chance every interval
        const urgentNews = [
          '🚨 Breaking: RBI announces policy rate change',
          '⚠️ Market Alert: Circuit breaker triggered on NSE',
          '📢 Urgent: Major IPO oversubscribed 50x',
          '🔔 Alert: FII selling crosses ₹5000 crore',
          '⚡ Breaking: Government announces new tax reforms',
          '🚨 Market Update: Sensex crosses new milestone',
        ];

        const randomNews = urgentNews[Math.floor(Math.random() * urgentNews.length)];
        
        this.addAlert({
          symbol: 'MARKET',
          type: 'urgent_news',
          message: randomNews,
          urgent: true,
        });
      }
    }, 60000); // Every 60 seconds
  }
}

export const notificationService = new NotificationService();