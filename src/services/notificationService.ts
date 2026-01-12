// Mock notification service for stock alerts
export interface StockAlert {
  id: string;
  symbol: string;
  type: 'price_increase' | 'price_decrease' | 'volume_spike' | 'news_alert';
  message: string;
  timestamp: Date;
  read: boolean;
}

class NotificationService {
  private alerts: StockAlert[] = [];
  private listeners: ((alerts: StockAlert[]) => void)[] = [];

  // Mock alerts for demonstration
  private mockAlerts: StockAlert[] = [
    {
      id: '1',
      symbol: 'RELIANCE',
      type: 'price_increase',
      message: 'RELIANCE is up 5.2% today! Your investment is performing well.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
    },
    {
      id: '2',
      symbol: 'TCS',
      type: 'volume_spike',
      message: 'TCS showing unusual volume activity. Consider reviewing your position.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: false,
    },
    {
      id: '3',
      symbol: 'INFY',
      type: 'news_alert',
      message: 'INFY announces new AI partnership. Stock may see positive movement.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      read: true,
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

  // Simulate real-time alerts
  startMockAlerts(): void {
    setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every interval
        const symbols = ['RELIANCE', 'TCS', 'INFY', 'HDFC', 'ICICI'];
        const types: StockAlert['type'][] = ['price_increase', 'price_decrease', 'volume_spike', 'news_alert'];
        const messages = {
          price_increase: 'is showing strong upward momentum!',
          price_decrease: 'has dropped significantly. Monitor closely.',
          volume_spike: 'showing unusual trading volume.',
          news_alert: 'has important news updates.',
        };

        const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
        const randomType = types[Math.floor(Math.random() * types.length)];
        
        this.addAlert({
          symbol: randomSymbol,
          type: randomType,
          message: `${randomSymbol} ${messages[randomType]}`,
        });
      }
    }, 30000); // Every 30 seconds
  }
}

export const notificationService = new NotificationService();