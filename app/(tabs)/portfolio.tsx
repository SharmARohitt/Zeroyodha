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
import UniversalCarousel from '../../src/components/UniversalCarousel';
import TopIndicesCarousel from '../../src/components/TopIndicesCarousel';

// Theme colors
const colors = {
  primary: '#00D4FF', // Blue Neon
  profit: '#00C853',
  loss: '#FF5252',
  background: '#000000',
  backgroundSecondary: '#0A0A0A',
  card: '#1A1A1A',
  border: '#2A2A2A',
  text: '#FFFFFF',
  textMuted: '#666666',
  textSecondary: '#999999',
};

type TabType = 'HOLDINGS' | 'POSITIONS';

export default function PortfolioScreen() {
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
    await updateMarketData();
    setRefreshing(false);
  };

  const carouselItems = [
    {
      title: 'Day Change',
      value: `${dayChange >= 0 ? '+' : ''}₹${dayChange.toFixed(0)}`,
      color: dayChange >= 0 ? '#00C853' : '#FF5252',
      subtitle: `${dayChangePercent.toFixed(2)}%`,
    },
    {
      title: 'Available',
      value: `₹${funds.available.toLocaleString('en-IN')}`,
      subtitle: 'Cash Balance',
    },
    {
      title: 'Holdings',
      value: holdings.length.toString(),
      color: colors.primary,
      subtitle: 'Active',
    },
    {
      title: 'Positions',
      value: positions.length.toString(),
      color: colors.profit,
      subtitle: 'Open',
    },
  ];

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
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <View style={styles.headerLeft}>
          <Animated.View style={{ transform: [{ scale: logoScale }] }}>
            <Image
              source={require('../../assets/images/Wealth.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
          <Text style={styles.title}>Hey {getUserName()}!</Text>
        </View>
        <View style={styles.modeBadge}>
          <Text style={styles.modeText}>{mode === 'PAPER' ? '📝 Paper' : '💰 Live'}</Text>
        </View>
      </Animated.View>

      {/* Top Indices Carousel */}
      <TopIndicesCarousel />

      {/* Universal Carousel */}
      <UniversalCarousel items={carouselItems} />

      {/* Enhanced Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Holdings Summary</Text>
            <TouchableOpacity>
              <Ionicons name="analytics-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Investment</Text>
              <Text style={styles.summaryValue}>₹{totalInvestment.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Current</Text>
              <Text style={styles.summaryValue}>₹{totalCurrentValue.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>P&L</Text>
              <Text style={[styles.summaryValue, { color: totalHoldingsPnl >= 0 ? colors.profit : colors.loss }]}>
                {totalHoldingsPnl >= 0 ? '+' : ''}₹{totalHoldingsPnl.toFixed(0)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Returns</Text>
              <Text style={[styles.summaryValue, { color: totalHoldingsPnl >= 0 ? colors.profit : colors.loss }]}>
                {totalHoldingsPnlPercent >= 0 ? '+' : ''}{totalHoldingsPnlPercent.toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'HOLDINGS' && styles.activeTab]}
          onPress={() => setActiveTab('HOLDINGS')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'HOLDINGS' && styles.activeTabText,
            ]}
          >
            Holdings ({holdings.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'POSITIONS' && styles.activeTab]}
          onPress={() => setActiveTab('POSITIONS')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'POSITIONS' && styles.activeTabText,
            ]}
          >
            Positions ({positions.length})
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        {activeTab === 'HOLDINGS' ? (
          holdings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="pie-chart-outline" size={64} color="#666" />
              <Text style={styles.emptyText}>No holdings</Text>
              <Text style={styles.emptySubtext}>Start investing to see your holdings here</Text>
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
            <View style={styles.emptyContainer}>
              <Ionicons name="trending-up-outline" size={64} color="#666" />
              <Text style={styles.emptyText}>No positions</Text>
              <Text style={styles.emptySubtext}>Your intraday positions will appear here</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 55 : 45,
    paddingBottom: 12,
    backgroundColor: colors.backgroundSecondary,
    ...(Platform.OS === 'ios' && {
      shadowColor: colors.primary,
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
    width: Platform.OS === 'ios' ? 48 : 44,
    height: Platform.OS === 'ios' ? 48 : 44,
    borderRadius: Platform.OS === 'ios' ? 12 : 10,
    ...(Platform.OS === 'ios' && {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    }),
  },
  title: {
    fontSize: Platform.OS === 'ios' ? 24 : 22,
    fontWeight: Platform.OS === 'ios' ? '800' : 'bold',
    color: colors.text,
    ...(Platform.OS === 'ios' && {
      letterSpacing: 0.5,
      textShadowColor: 'rgba(255, 255, 255, 0.1)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    }),
  },
  modeBadge: {
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  modeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  summaryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.text,
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
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.card,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.primary,
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
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

