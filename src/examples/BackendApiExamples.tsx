/**
 * Example: Using Backend API in React Native Components
 * 
 * This file demonstrates how to integrate the backend API service
 * in your React Native components.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';
import { 
  getMarketQuote, 
  getHoldings, 
  placeOrder,
  testBackendConnection 
} from '../services/backendApiService';

/**
 * Example 1: Fetch Market Quote
 */
export const MarketQuoteExample = () => {
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getMarketQuote('RELIANCE', 'NSE');
      setQuote(data.data);
      console.log('Quote received:', data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching quote:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Market Quote Example</Text>
      
      <Button title="Get RELIANCE Quote" onPress={fetchQuote} />
      
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      
      {error && <Text style={styles.error}>Error: {error}</Text>}
      
      {quote && (
        <View style={styles.quoteCard}>
          <Text>Symbol: {quote.symbol}</Text>
          <Text>Last Price: ₹{quote.lastPrice}</Text>
          <Text>Change: {quote.changePercent}%</Text>
          <Text>Volume: {quote.volume}</Text>
        </View>
      )}
    </View>
  );
};

/**
 * Example 2: Fetch User Holdings
 */
export const HoldingsExample = () => {
  const [holdings, setHoldings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHoldings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getHoldings();
      setHoldings(data.data);
      console.log('Holdings received:', data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching holdings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHoldings();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Holdings Example</Text>
      
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      
      {error && <Text style={styles.error}>Error: {error}</Text>}
      
      {holdings.length > 0 && (
        <View>
          {holdings.map((holding, index) => (
            <View key={index} style={styles.holdingCard}>
              <Text>{holding.symbol}</Text>
              <Text>Qty: {holding.quantity}</Text>
              <Text>Avg Price: ₹{holding.avgPrice}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

/**
 * Example 3: Place Order
 */
export const PlaceOrderExample = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const orderData = {
        transactionType: 'BUY' as const,
        securityId: '1333', // Reliance security ID
        quantity: 1,
        exchange: 'NSE_EQ',
        productType: 'INTRADAY',
        orderType: 'MARKET',
      };

      const data = await placeOrder(orderData);
      setResult(data);
      console.log('Order placed:', data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error placing order:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Place Order Example</Text>
      
      <Button 
        title="Buy 1 RELIANCE (Market Order)" 
        onPress={handlePlaceOrder}
        disabled={loading}
      />
      
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      
      {error && <Text style={styles.error}>Error: {error}</Text>}
      
      {result && (
        <View style={styles.successCard}>
          <Text style={styles.success}>Order Placed Successfully!</Text>
          <Text>Order ID: {result.data?.orderId}</Text>
        </View>
      )}
    </View>
  );
};

/**
 * Example 4: Test Backend Connection
 */
export const ConnectionTestExample = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    
    try {
      const connected = await testBackendConnection();
      setIsConnected(connected);
      console.log('Backend connection:', connected ? 'OK' : 'Failed');
    } catch (err) {
      setIsConnected(false);
      console.error('Connection test error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backend Connection Status</Text>
      
      {loading && <ActivityIndicator size="small" color="#0000ff" />}
      
      {isConnected !== null && (
        <View style={[
          styles.statusCard, 
          isConnected ? styles.statusConnected : styles.statusDisconnected
        ]}>
          <Text style={styles.statusText}>
            {isConnected ? '✅ Connected' : '❌ Disconnected'}
          </Text>
        </View>
      )}
      
      <Button title="Test Again" onPress={testConnection} />
    </View>
  );
};

/**
 * Example 5: Complete Integration in a Screen
 */
export const StockDetailScreenExample = () => {
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const symbol = 'RELIANCE';

  useEffect(() => {
    loadStockData();
  }, []);

  const loadStockData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch quote from backend API
      const data = await getMarketQuote(symbol);
      setQuote(data.data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading stock data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async () => {
    try {
      const orderData = {
        transactionType: 'BUY' as const,
        securityId: '1333',
        quantity: 1,
        orderType: 'MARKET',
      };

      const result = await placeOrder(orderData);
      alert(`Order placed successfully! ID: ${result.data?.orderId}`);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.error}>Error: {error}</Text>
        <Button title="Retry" onPress={loadStockData} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{quote?.symbol}</Text>
      <Text style={styles.price}>₹{quote?.lastPrice}</Text>
      <Text style={[
        styles.change, 
        quote?.change >= 0 ? styles.positive : styles.negative
      ]}>
        {quote?.change >= 0 ? '+' : ''}{quote?.changePercent}%
      </Text>
      
      <View style={styles.detailsCard}>
        <Text>Open: ₹{quote?.open}</Text>
        <Text>High: ₹{quote?.high}</Text>
        <Text>Low: ₹{quote?.low}</Text>
        <Text>Volume: {quote?.volume}</Text>
      </View>

      <Button title="Buy" onPress={handleBuy} />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  change: {
    fontSize: 18,
    marginBottom: 20,
  },
  positive: {
    color: 'green',
  },
  negative: {
    color: 'red',
  },
  quoteCard: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  holdingCard: {
    marginVertical: 5,
    padding: 10,
    backgroundColor: '#e8e8e8',
    borderRadius: 5,
  },
  detailsCard: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  successCard: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#d4edda',
    borderRadius: 8,
  },
  statusCard: {
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  statusConnected: {
    backgroundColor: '#d4edda',
  },
  statusDisconnected: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 18,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    marginVertical: 10,
  },
  success: {
    color: 'green',
    fontWeight: 'bold',
    marginBottom: 5,
  },
});
