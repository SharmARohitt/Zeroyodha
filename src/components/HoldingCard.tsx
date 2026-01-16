import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Holding } from '../types';
import { useMarketStore } from '../store/useMarketStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';

interface HoldingCardProps {
  holding: Holding;
}

export default function HoldingCard({ holding }: HoldingCardProps) {
  const { stocks } = useMarketStore();
  const { theme } = useTheme();
  const router = useRouter();
  const stock = stocks[holding.symbol];
  const currentPrice = stock?.lastPrice || holding.lastPrice;

  // Recalculate values
  const currentValue = holding.quantity * currentPrice;
  const pnl = currentValue - holding.investment;
  const pnlPercent = (pnl / holding.investment) * 100;

  const isPositive = pnl >= 0;
  const pnlColor = isPositive ? theme.profit : theme.loss;

  // Calculate day change (mock data - would come from real-time updates)
  const dayChange = stock?.change || 0;
  const dayChangePercent = stock?.changePercent || 0;
  const isDayPositive = dayChange >= 0;
  const dayChangeColor = isDayPositive ? theme.profit : theme.loss;

  const handleSell = () => {
    Alert.alert(
      'Sell Stock',
      `Do you want to sell ${holding.symbol}?\n\nYou own: ${holding.quantity} shares\nCurrent Price: ₹${currentPrice.toFixed(2)}\nTotal Value: ₹${currentValue.toLocaleString('en-IN')}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sell',
          style: 'destructive',
          onPress: () => {
            router.push({
              pathname: '/order',
              params: { 
                symbol: holding.symbol,
                side: 'SELL',
                maxQuantity: holding.quantity.toString(),
              },
            });
          },
        },
      ]
    );
  };

  const handleBuy = () => {
    router.push({
      pathname: '/order',
      params: { 
        symbol: holding.symbol,
        side: 'BUY',
      },
    });
  };

  const handleCardPress = () => {
    router.push({
      pathname: '/stock-detail',
      params: { symbol: holding.symbol },
    });
  };

  return (
    <TouchableOpacity style={createStyles(theme).card} activeOpacity={0.9} onPress={handleCardPress}>
      <View style={createStyles(theme).header}>
        <View style={createStyles(theme).stockInfo}>
          <Text style={createStyles(theme).symbol}>{holding.symbol}</Text>
          <Text style={createStyles(theme).exchange}>{holding.exchange}</Text>
        </View>
        <View style={createStyles(theme).rightHeader}>
          <View style={createStyles(theme).quantityContainer}>
            <Text style={createStyles(theme).quantity}>{holding.quantity}</Text>
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
            <Text style={createStyles(theme).detailValue}>₹{holding.averagePrice.toFixed(2)}</Text>
          </View>
          <View style={createStyles(theme).detailItem}>
            <Text style={createStyles(theme).detailLabel}>Investment</Text>
            <Text style={createStyles(theme).detailValue}>₹{holding.investment.toLocaleString('en-IN')}</Text>
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
              style={[createStyles(theme).actionButton, createStyles(theme).sellButton]}
              onPress={handleSell}
            >
              <Text style={createStyles(theme).sellButtonText}>SELL</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[createStyles(theme).actionButton, createStyles(theme).buyButton]}
              onPress={handleBuy}
            >
              <Text style={createStyles(theme).buyButtonText}>BUY</Text>
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
    backgroundColor: theme.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  quantity: {
    color: theme.text,
    fontSize: 12,
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
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 50,
    alignItems: 'center',
  },
  sellButton: {
    backgroundColor: theme.loss,
  },
  buyButton: {
    backgroundColor: theme.profit,
  },
  sellButtonText: {
    color: theme.text,
    fontSize: 12,
    fontWeight: '600',
  },
  buyButtonText: {
    color: theme.text,
    fontSize: 12,
    fontWeight: '600',
  },
});

