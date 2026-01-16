import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Image,
  Platform,
  Animated,
} from 'react-native';
import { useTradingStore } from '../../src/store/useTradingStore';
import { useMarketStore } from '../../src/store/useMarketStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import { Position, Holding } from '../../src/types';
import { Ionicons } from '@expo/vector-icons';
import PositionCard from '../../src/components/PositionCard';
import HoldingCard from '../../src/components/HoldingCard';
import TopIndicesCarousel from '../../src/components/TopIndicesCarousel';
import { useTheme } from '../../src/contexts/ThemeContext';
import FloatingTradeButton from '../../src/components/FloatingTradeButton';

type TabType = 'HOLDINGS' | 'POSITIONS';

export default function PortfolioScreen() {
  const { theme } = useTheme();
  const { holdings, positions, mode, funds } = useTradingStore();
  const { stocks, updateMarketData } = useMarketStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('HOLDINGS');
  const [refreshing, setRefreshing] = useState(false);
  const logoScale = useRef(new Animated.Value(1)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;

  // Calculate comprehensive portfolio metrics
  const totalInvestment = holdings.reduce((sum, holding) => sum + holding.investment, 0);
  const totalCurrentValue = holdings.reduce((sum, holding) => {
    const currentPrice = stocks[holding.symbol]?.lastPrice || holding.lastPrice;
    return sum + (holding.quantity * currentPrice);
  }, 0);
  
  const totalHoldingsPnl = totalCurrentValue - totalInvestment;
  const totalHoldingsPnlPercent = totalInvestment > 0 ? (totalHoldingsPnl / totalInvestment) * 100 : 0;

  const totalPositionsPnl = positions.reduce((sum, position) => {
    const currentPrice = stocks[position.symbol]?.lastPrice || position.lastPrice;
    const buyValue = position.buyValue || position.quantity * position.averagePrice;
    const currentValue = position.quantity * currentPrice;
    return sum + (currentValue - buyValue);
  }, 0);

  const totalPnl = totalHoldingsPnl + totalPositionsPnl;
  const totalValue = funds.total + totalPnl;
  const dayChange = 0; // This would come from real-time data
  const dayChangePercent = 0; // This would come from real-time data

  // Update P&L based on current market prices
  useEffect(() => {
    // This would be called when market data updates
    
    // iOS-specific logo animation
    if (Platform.OS === 'ios') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(logoScale, {
            toValue: 1.05,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(logoScale, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [stocks]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh market data would be called here
    // await updateMarketData(newData);
    setRefreshing(false);
  };

  // Get user's first name for greeting
  const getUserName = () => {
    if (user?.displayName) {
      return user.displayName.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  return (
    <ScrollView 
      style={createStyles(theme).container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.primary}
        />
      }
    >
      <Animated.View style={[createStyles(theme).header, { opacity: headerOpacity }]}>
        <View style={createStyles(theme).headerLeft}>
          <Animated.View style={{ transform: [{ scale: logoScale }] }}>
            <Image
              source={require('../../assets/images/Wealth.png')}
              style={createStyles(theme).logo}
              resizeMode="contain"
            />
          </Animated.View>
          <Text style={createStyles(theme).title}>Hey {getUserName()}!</Text>
        </View>
        <View style={createStyles(theme).modeBadge}>
          <Text style={createStyles(theme).modeText}>{mode === 'PAPER' ? '📝 Paper' : '💰 Live'}</Text>
        </View>
      </Animated.View>

      {/* Top Indices Carousel */}
      <TopIndicesCarousel />

      {/* Enhanced Summary */}
      <View style={createStyles(theme).summaryContainer}>
        <View style={createStyles(theme).summaryCard}>
          <View style={createStyles(theme).summaryHeader}>
            <Text style={createStyles(theme).summaryTitle}>Holdings Summary</Text>
            <TouchableOpacity>
              <Ionicons name="analytics-outline" size={20} color={theme.primary} />
            </TouchableOpacity>
          </View>
          <View style={createStyles(theme).summaryGrid}>
            <View style={createStyles(theme).summaryItem}>
              <Text style={createStyles(theme).summaryLabel}>Investment</Text>
              <Text style={createStyles(theme).summaryValue}>₹{totalInvestment.toLocaleString('en-IN')}</Text>
            </View>
            <View style={createStyles(theme).summaryItem}>
              <Text style={createStyles(theme).summaryLabel}>Current</Text>
              <Text style={createStyles(theme).summaryValue}>₹{totalCurrentValue.toLocaleString('en-IN')}</Text>
            </View>
            <View style={createStyles(theme).summaryItem}>
              <Text style={createStyles(theme).summaryLabel}>P&L</Text>
              <Text style={[createStyles(theme).summaryValue, { color: totalHoldingsPnl >= 0 ? theme.profit : theme.loss }]}>
                {totalHoldingsPnl >= 0 ? '+' : ''}₹{totalHoldingsPnl.toFixed(0)}
              </Text>
            </View>
            <View style={createStyles(theme).summaryItem}>
              <Text style={createStyles(theme).summaryLabel}>Returns</Text>
              <Text style={[createStyles(theme).summaryValue, { color: totalHoldingsPnl >= 0 ? theme.profit : theme.loss }]}>
                {totalHoldingsPnlPercent >= 0 ? '+' : ''}{totalHoldingsPnlPercent.toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={createStyles(theme).tabs}>
        <TouchableOpacity
          style={[createStyles(theme).tab, activeTab === 'HOLDINGS' && createStyles(theme).activeTab]}
          onPress={() => setActiveTab('HOLDINGS')}
        >
          <Text
            style={[
              createStyles(theme).tabText,
              activeTab === 'HOLDINGS' && createStyles(theme).activeTabText,
            ]}
          >
            Holdings ({holdings.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[createStyles(theme).tab, activeTab === 'POSITIONS' && createStyles(theme).activeTab]}
          onPress={() => setActiveTab('POSITIONS')}
        >
          <Text
            style={[
              createStyles(theme).tabText,
              activeTab === 'POSITIONS' && createStyles(theme).activeTabText,
            ]}
          >
            Positions ({positions.length})
          </Text>
        </TouchableOpacity>
      </View>

      <View style={createStyles(theme).listContainer}>
        {activeTab === 'HOLDINGS' ? (
          holdings.length === 0 ? (
            <View style={createStyles(theme).emptyContainer}>
              <Ionicons name="pie-chart-outline" size={64} color={theme.textMuted} />
              <Text style={createStyles(theme).emptyText}>No holdings</Text>
              <Text style={createStyles(theme).emptySubtext}>Start investing to see your holdings here</Text>
            </View>
          ) : (
            <View>
              {holdings.map((holding) => (
                <HoldingCard key={`${holding.symbol}-${holding.mode}`} holding={holding} />
              ))}
            </View>
          )
        ) : (
          positions.length === 0 ? (
            <View style={createStyles(theme).emptyContainer}>
              <Ionicons name="trending-up-outline" size={64} color={theme.textMuted} />
              <Text style={createStyles(theme).emptyText}>No positions</Text>
              <Text style={createStyles(theme).emptySubtext}>Your intraday positions will appear here</Text>
            </View>
          ) : (
            <View>
              {positions.map((position) => (
                <PositionCard key={`${position.symbol}-${position.product}-${position.mode}`} position={position} />
              ))}
            </View>
          )
        )}
      </View>
      
      <FloatingTradeButton />
    </ScrollView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 55 : 45,
    paddingBottom: 12,
    backgroundColor: theme.surface,
    ...(Platform.OS === 'ios' && {
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    }),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: Platform.OS === 'ios' ? 56 : 52,
    height: Platform.OS === 'ios' ? 56 : 52,
    borderRadius: Platform.OS === 'ios' ? 14 : 12,
    ...(Platform.OS === 'ios' && {
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    }),
  },
  title: {
    fontSize: Platform.OS === 'ios' ? 24 : 22,
    fontWeight: Platform.OS === 'ios' ? '800' : 'bold',
    color: theme.text,
    ...(Platform.OS === 'ios' && {
      letterSpacing: 0.5,
      textShadowColor: theme.text + '1A',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    }),
  },
  modeBadge: {
    backgroundColor: theme.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.primary,
  },
  modeText: {
    color: theme.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  summaryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  summaryCard: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.card,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: theme.primary,
  },
  tabText: {
    color: theme.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: theme.primary,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    color: theme.textMuted,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
