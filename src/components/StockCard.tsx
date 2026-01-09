import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Stock } from '../types';
import { LinearGradient } from 'expo-linear-gradient';

interface StockCardProps {
  stock: Stock;
  onPress: () => void;
}

export default function StockCard({ stock, onPress }: StockCardProps) {
  const isPositive = stock.change >= 0;
  const changeColor = isPositive ? '#00C853' : '#FF5252';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={styles.card}>
        <LinearGradient
          colors={['#1A1A1A', '#0A0A0A']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <View style={styles.leftSection}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoText}>
                  {stock.symbol.substring(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.symbol}>{stock.symbol}</Text>
                <Text style={styles.name} numberOfLines={1}>
                  {stock.name}
                </Text>
                <Text style={styles.exchange}>{stock.exchange}</Text>
              </View>
            </View>

            <View style={styles.rightSection}>
              <Text style={styles.price}>₹{stock.lastPrice.toFixed(2)}</Text>
              <View style={styles.changeContainer}>
                <Text style={[styles.change, { color: changeColor }]}>
                  {isPositive ? '+' : ''}
                  {stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                </Text>
              </View>
              <Text style={styles.volume}>
                Vol: {(stock.volume / 1000).toFixed(0)}K
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    padding: 16,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2962FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  symbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  name: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  exchange: {
    fontSize: 10,
    color: '#666',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  changeContainer: {
    marginBottom: 4,
  },
  change: {
    fontSize: 14,
    fontWeight: '600',
  },
  volume: {
    fontSize: 10,
    color: '#666',
  },
});

