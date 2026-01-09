import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Position } from '../types';
import { useMarketStore } from '../store/useMarketStore';
import { useEffect, useState } from 'react';

interface PositionCardProps {
  position: Position;
}

export default function PositionCard({ position }: PositionCardProps) {
  const { stocks } = useMarketStore();
  const stock = stocks[position.symbol];
  const currentPrice = stock?.lastPrice || position.lastPrice;

  // Recalculate P&L
  const buyValue = position.buyValue || position.quantity * position.averagePrice;
  const currentValue = position.quantity * currentPrice;
  const pnl = currentValue - buyValue;
  const pnlPercent = buyValue > 0 ? (pnl / buyValue) * 100 : 0;

  const isPositive = pnl >= 0;
  const pnlColor = isPositive ? '#00C853' : '#FF5252';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.symbol}>{position.symbol}</Text>
          <Text style={styles.exchange}>{position.exchange} • {position.product}</Text>
        </View>
        <View style={styles.quantityContainer}>
          <Text style={styles.quantity}>{position.quantity}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.row}>
          <Text style={styles.label}>Avg Price:</Text>
          <Text style={styles.value}>₹{position.averagePrice.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>LTP:</Text>
          <Text style={styles.value}>₹{currentPrice.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Buy Value:</Text>
          <Text style={styles.value}>₹{buyValue.toLocaleString('en-IN')}</Text>
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

