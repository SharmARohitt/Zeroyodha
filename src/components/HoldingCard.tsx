import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Holding } from '../types';
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

  // Calculate day change (mock data - would come from real-time updates)
  const dayChange = stock?.change || 0;
  const dayChangePercent = stock?.changePercent || 0;
  const isDayPositive = dayChange >= 0;
  const dayChangeColor = isDayPositive ? '#00C853' : '#FF5252';

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9}>
      <View style={styles.header}>
        <View style={styles.stockInfo}>
          <Text style={styles.symbol}>{holding.symbol}</Text>
          <Text style={styles.exchange}>{holding.exchange}</Text>
        </View>
        <View style={styles.rightHeader}>
          <View style={styles.quantityContainer}>
            <Text style={styles.quantity}>{holding.quantity}</Text>
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
            <Text style={styles.detailValue}>₹{holding.averagePrice.toFixed(2)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Investment</Text>
            <Text style={styles.detailValue}>₹{holding.investment.toLocaleString('en-IN')}</Text>
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
            <TouchableOpacity style={[styles.actionButton, styles.sellButton]}>
              <Text style={styles.sellButtonText}>SELL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.buyButton]}>
              <Text style={styles.buyButtonText}>BUY</Text>
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
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  quantity: {
    color: colors.text,
    fontSize: 12,
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
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 50,
    alignItems: 'center',
  },
  sellButton: {
    backgroundColor: colors.loss,
  },
  buyButton: {
    backgroundColor: colors.profit,
  },
  sellButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  buyButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
});

