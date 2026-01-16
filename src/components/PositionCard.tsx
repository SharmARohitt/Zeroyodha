import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Position } from '../types';
import { useMarketStore } from '../store/useMarketStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';

interface PositionCardProps {
  position: Position;
}

export default function PositionCard({ position }: PositionCardProps) {
  const { stocks } = useMarketStore();
  const { theme } = useTheme();
  const router = useRouter();
  const stock = stocks[position.symbol];
  const currentPrice = stock?.lastPrice || position.lastPrice;

  // Recalculate P&L
  const buyValue = position.buyValue || position.quantity * position.averagePrice;
  const currentValue = position.quantity * currentPrice;
  const pnl = currentValue - buyValue;
  const pnlPercent = buyValue > 0 ? (pnl / buyValue) * 100 : 0;

  const isPositive = pnl >= 0;
  const pnlColor = isPositive ? theme.profit : theme.loss;

  // Calculate day change (mock data - would come from real-time updates)
  const dayChange = stock?.change || 0;
  const dayChangePercent = stock?.changePercent || 0;
  const isDayPositive = dayChange >= 0;
  const dayChangeColor = isDayPositive ? theme.profit : theme.loss;

  const handleExit = () => {
    Alert.alert(
      'Exit Position',
      `Do you want to exit your ${position.product} position in ${position.symbol}?\n\nQuantity: ${Math.abs(position.quantity)} shares\nCurrent Price: ₹${currentPrice.toFixed(2)}\nP&L: ${isPositive ? '+' : ''}₹${pnl.toFixed(2)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => {
            // Navigate to order screen with opposite side
            const exitSide = position.quantity > 0 ? 'SELL' : 'BUY';
            router.push({
              pathname: '/order',
              params: { 
                symbol: position.symbol,
                side: exitSide,
                quantity: Math.abs(position.quantity).toString(),
                product: position.product,
              },
            });
          },
        },
      ]
    );
  };

  const handleConvert = () => {
    Alert.alert(
      'Convert Position',
      `Convert ${position.product} position to CNC (delivery)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Convert',
          onPress: () => {
            // TODO: Implement position conversion logic
            Alert.alert('Coming Soon', 'Position conversion will be available soon');
          },
        },
      ]
    );
  };

  const handleCardPress = () => {
    router.push({
      pathname: '/stock-detail',
      params: { symbol: position.symbol },
    });
  };

  return (
    <TouchableOpacity style={createStyles(theme).card} activeOpacity={0.9} onPress={handleCardPress}>
      <View style={createStyles(theme).header}>
        <View style={createStyles(theme).stockInfo}>
          <Text style={createStyles(theme).symbol}>{position.symbol}</Text>
          <Text style={createStyles(theme).exchange}>{position.exchange} • {position.product}</Text>
        </View>
        <View style={createStyles(theme).rightHeader}>
          <View style={[createStyles(theme).quantityContainer, { backgroundColor: position.quantity > 0 ? theme.profit : theme.loss }]}>
            <Text style={createStyles(theme).quantity}>{Math.abs(position.quantity)}</Text>
            <Text style={createStyles(theme).quantityType}>{position.quantity > 0 ? 'BUY' : 'SELL'}</Text>
          </View>
        </View>
      </View>

      <View style={createStyles(theme).priceSection}>
        <View style={createStyles(theme).priceRow}>
          <Text style={createStyles(theme).currentPrice}>₹{currentPrice.toFixed(2)}</Text>
          <View style={createStyles(theme).dayChangeContainer}>
            <Text style={[createStyles(theme).dayChange, { color: dayChangeColor }]}>
              {isDayPositive ? '+' : ''}₹{dayChange.toFixed(2)}
            </Text>
            <Text style={[createStyles(theme).dayChangePercent, { color: dayChangeColor }]}>
              ({isDayPositive ? '+' : ''}{dayChangePercent.toFixed(2)}%)
            </Text>
          </View>
        </View>
      </View>

      <View style={createStyles(theme).details}>
        <View style={createStyles(theme).detailRow}>
          <View style={createStyles(theme).detailItem}>
            <Text style={createStyles(theme).detailLabel}>Avg</Text>
            <Text style={createStyles(theme).detailValue}>₹{position.averagePrice.toFixed(2)}</Text>
          </View>
          <View style={createStyles(theme).detailItem}>
            <Text style={createStyles(theme).detailLabel}>Buy Value</Text>
            <Text style={createStyles(theme).detailValue}>₹{buyValue.toLocaleString('en-IN')}</Text>
          </View>
          <View style={createStyles(theme).detailItem}>
            <Text style={createStyles(theme).detailLabel}>Current</Text>
            <Text style={createStyles(theme).detailValue}>₹{currentValue.toLocaleString('en-IN')}</Text>
          </View>
        </View>
        
        <View style={[createStyles(theme).pnlRow]}>
          <View style={createStyles(theme).pnlContainer}>
            <Text style={[createStyles(theme).pnlValue, { color: pnlColor }]}>
              {isPositive ? '+' : ''}₹{Math.abs(pnl).toFixed(2)}
            </Text>
            <Text style={[createStyles(theme).pnlPercent, { color: pnlColor }]}>
              ({isPositive ? '+' : ''}{pnlPercent.toFixed(2)}%)
            </Text>
          </View>
          <View style={createStyles(theme).actionButtons}>
            <TouchableOpacity 
              style={[createStyles(theme).actionButton, createStyles(theme).exitButton]}
              onPress={handleExit}
            >
              <Text style={createStyles(theme).exitButtonText}>EXIT</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[createStyles(theme).actionButton, createStyles(theme).convertButton]}
              onPress={handleConvert}
            >
              <Text style={createStyles(theme).convertButtonText}>CONVERT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  card: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
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
    color: theme.text,
    marginBottom: 2,
  },
  exchange: {
    fontSize: 11,
    color: theme.textMuted,
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
    color: theme.text,
    fontSize: 12,
    fontWeight: '600',
  },
  quantityType: {
    color: theme.text,
    fontSize: 10,
    fontWeight: '600',
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
    color: theme.text,
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
    borderTopColor: theme.border,
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
    color: theme.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    color: theme.text,
    fontWeight: '600',
  },
  pnlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
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
    backgroundColor: theme.loss,
  },
  convertButton: {
    backgroundColor: theme.primary,
  },
  exitButtonText: {
    color: theme.text,
    fontSize: 11,
    fontWeight: '600',
  },
  convertButtonText: {
    color: theme.text,
    fontSize: 11,
    fontWeight: '600',
  },
});

