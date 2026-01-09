import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMarketStore } from '../src/store/useMarketStore';
import { useTradingStore } from '../src/store/useTradingStore';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency, formatPercent } from '../src/utils/formatters';
import FloatingTradeButton from '../src/components/FloatingTradeButton';

export default function StockDetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const router = useRouter();
  const { stocks, setSelectedSymbol } = useMarketStore();
  const stock = symbol ? stocks[symbol] : null;

  useEffect(() => {
    if (symbol) {
      setSelectedSymbol(symbol);
    }
  }, [symbol]);

  if (!stock) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Stock not found</Text>
      </View>
    );
  }

  const isPositive = stock.change >= 0;
  const changeColor = isPositive ? '#00C853' : '#FF5252';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{stock.symbol}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.stockHeader}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>
            {stock.symbol.substring(0, 2).toUpperCase()}
          </Text>
        </View>
        <View style={styles.stockInfo}>
          <Text style={styles.stockName}>{stock.name}</Text>
          <Text style={styles.stockExchange}>{stock.exchange}</Text>
        </View>
      </View>

      <View style={styles.priceSection}>
        <Text style={styles.price}>{formatCurrency(stock.lastPrice)}</Text>
        <View style={styles.changeContainer}>
          <Text style={[styles.change, { color: changeColor }]}>
            {isPositive ? '+' : ''}
            {formatCurrency(stock.change)} ({formatPercent(stock.changePercent)})
          </Text>
        </View>
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Open</Text>
          <Text style={styles.statValue}>{formatCurrency(stock.open)}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>High</Text>
          <Text style={styles.statValue}>{formatCurrency(stock.high)}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Low</Text>
          <Text style={styles.statValue}>{formatCurrency(stock.low)}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Prev Close</Text>
          <Text style={styles.statValue}>{formatCurrency(stock.prevClose)}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Volume</Text>
          <Text style={styles.statValue}>
            {(stock.volume / 1000).toFixed(0)}K
          </Text>
        </View>
      </View>

      <View style={styles.actionSection}>
        <TouchableOpacity
          style={[styles.actionButton, styles.buyButton]}
          onPress={() => router.push({
            pathname: '/order',
            params: { symbol: stock.symbol, side: 'BUY' },
          })}
        >
          <Text style={styles.buyButtonText}>BUY</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.sellButton]}
          onPress={() => router.push({
            pathname: '/order',
            params: { symbol: stock.symbol, side: 'SELL' },
          })}
        >
          <Text style={styles.sellButtonText}>SELL</Text>
        </TouchableOpacity>
      </View>

      <FloatingTradeButton />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#0A0A0A',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1A1A1A',
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2962FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  stockInfo: {
    flex: 1,
  },
  stockName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  stockExchange: {
    fontSize: 14,
    color: '#999',
  },
  priceSection: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  changeContainer: {
    marginTop: 8,
  },
  change: {
    fontSize: 18,
    fontWeight: '600',
  },
  statsSection: {
    backgroundColor: '#1A1A1A',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statLabel: {
    fontSize: 14,
    color: '#999',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyButton: {
    backgroundColor: '#00C853',
  },
  sellButton: {
    backgroundColor: '#FF5252',
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sellButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF5252',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
});

