import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Position } from '../types';
import { useMarketStore } from '../store/useMarketStore';
import { Ionicons } from '@expo/vector-icons';

// Theme colors
const colors = {
  primary: '#00D4FF', // Blue Neon
  profit: '#00C853',
  loss: '#FF5252',
  card: '#1A1A1A',
  border: '#2A2A2A',
  text: '#FFFFFF',
  textMuted: '#666666',
  textSecondary: '#999999',
};

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

  // Calculate day change (mock data - would come from real-time updates)
  const dayChange = stock?.change || 0;
  const dayChangePercent = stock?.changePercent || 0;
  const isDayPositive = dayChange >= 0;
  const dayChangeColor = isDayPositive ? '#00C853' : '#FF5252';

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9}>
      <View style={styles.header}>
        <View style={styles.stockInfo}>
          <Text style={styles.symbol}>{position.symbol}</Text>
          <Text style={styles.exchange}>{position.exchange} • {position.product}</Text>
        </View>
        <View style={styles.rightHeader}>
          <View style={[styles.quantityContainer, { backgroundColor: position.quantity > 0 ? '#00C853' : '#FF5252' }]}>
            <Text style={styles.quantity}>{Math.abs(position.quantity)}</Text>
            <Text style={styles.quantityType}>{position.quantity > 0 ? 'BUY' : 'SELL'}</Text>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={16} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.priceSection}>
        <View style={styles.priceRow}>
          <Text style={styles.currentPrice}>₹{currentPrice.toFixed(2)}</Text>
          <View style={styles.dayChangeContainer}>
            <Text style={[styles.dayChange, { color: dayChangeColor }]}>
              {isDayPositive ? '+' : ''}₹{dayChange.toFixed(2)}
            </Text>
            <Text style={[styles.dayChangePercent, { color: dayChangeColor }]}>
              ({isDayPositive ? '+' : ''}{dayChangePercent.toFixed(2)}%)
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Avg</Text>
            <Text style={styles.detailValue}>₹{position.averagePrice.toFixed(2)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Buy Value</Text>
            <Text style={styles.detailValue}>₹{buyValue.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Current</Text>
            <Text style={styles.detailValue}>₹{currentValue.toLocaleString('en-IN')}</Text>
          </View>
        </View>
        
        <View style={[styles.pnlRow]}>
          <View style={styles.pnlContainer}>
            <Text style={[styles.pnlValue, { color: pnlColor }]}>
              {isPositive ? '+' : ''}₹{Math.abs(pnl).toFixed(2)}
            </Text>
            <Text style={[styles.pnlPercent, { color: pnlColor }]}>
              ({isPositive ? '+' : ''}{pnlPercent.toFixed(2)}%)
            </Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.actionButton, styles.exitButton]}>
              <Text style={styles.exitButtonText}>EXIT</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.convertButton]}>
              <Text style={styles.convertButtonText}>CONVERT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stockInfo: {
    flex: 1,
  },
  symbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  exchange: {
    fontSize: 11,
    color: colors.textMuted,
  },
  rightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quantity: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  quantityType: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '600',
  },
  menuButton: {
    padding: 4,
  },
  priceSection: {
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  dayChangeContainer: {
    alignItems: 'flex-end',
  },
  dayChange: {
    fontSize: 14,
    fontWeight: '600',
  },
  dayChangePercent: {
    fontSize: 12,
    marginTop: 2,
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  pnlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pnlContainer: {
    flex: 1,
  },
  pnlValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pnlPercent: {
    fontSize: 12,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  exitButton: {
    backgroundColor: colors.loss,
  },
  convertButton: {
    backgroundColor: colors.primary,
  },
  exitButtonText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '600',
  },
  convertButtonText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '600',
  },
});

