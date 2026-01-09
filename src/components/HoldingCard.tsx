import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Holding } from '../types';
import { useMarketStore } from '../store/useMarketStore';

interface HoldingCardProps {
  holding: Holding;
}

export default function HoldingCard({ holding }: HoldingCardProps) {
  const { stocks } = useMarketStore();
  const stock = stocks[holding.symbol];
  const currentPrice = stock?.lastPrice || holding.lastPrice;

  // Recalculate values
  const currentValue = holding.quantity * currentPrice;
  const pnl = currentValue - holding.investment;
  const pnlPercent = (pnl / holding.investment) * 100;

  const isPositive = pnl >= 0;
  const pnlColor = isPositive ? '#00C853' : '#FF5252';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.symbol}>{holding.symbol}</Text>
          <Text style={styles.exchange}>{holding.exchange}</Text>
        </View>
        <View style={styles.quantityContainer}>
          <Text style={styles.quantity}>{holding.quantity}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.row}>
          <Text style={styles.label}>Avg Price:</Text>
          <Text style={styles.value}>₹{holding.averagePrice.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>LTP:</Text>
          <Text style={styles.value}>₹{currentPrice.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Investment:</Text>
          <Text style={styles.value}>₹{holding.investment.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Current Value:</Text>
          <Text style={styles.value}>₹{currentValue.toLocaleString('en-IN')}</Text>
        </View>
        <View style={[styles.row, styles.pnlRow]}>
          <Text style={styles.label}>P&L:</Text>
          <View style={styles.pnlContainer}>
            <Text style={[styles.pnlValue, { color: pnlColor }]}>
              {isPositive ? '+' : ''}₹{pnl.toFixed(2)}
            </Text>
            <Text style={[styles.pnlPercent, { color: pnlColor }]}>
              ({isPositive ? '+' : ''}{pnlPercent.toFixed(2)}%)
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  symbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  exchange: {
    fontSize: 12,
    color: '#666',
  },
  quantityContainer: {
    backgroundColor: '#2962FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  quantity: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pnlRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  label: {
    fontSize: 14,
    color: '#999',
  },
  value: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  pnlContainer: {
    alignItems: 'flex-end',
  },
  pnlValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pnlPercent: {
    fontSize: 12,
    marginTop: 2,
  },
});

