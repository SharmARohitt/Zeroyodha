import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMarketStore } from '../src/store/useMarketStore';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency, formatPercent } from '../src/utils/formatters';
import { marketDataService } from '../src/services/marketDataService';
import { Candle } from '../src/types';
import { getStockLogo } from '../src/utils/stockLogos';
import { benzingaService } from '../src/services/benzingaService';
import CandlestickChart from '../src/components/CandlestickChart';
import { useTheme } from '../src/contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function StockDetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const { stocks, setSelectedSymbol } = useMarketStore();
  const stock = symbol ? stocks[symbol] : null;
  const [chartType, setChartType] = useState<'1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'>('1M');
  const [logoInfo, setLogoInfo] = useState(stock ? getStockLogo(stock.symbol) : null);

  // Memoize candle data to prevent regeneration on every render
  const candleData = useMemo(() => {
    if (symbol) {
      return marketDataService.generateCandleData(symbol, chartType);
    }
    return [];
  }, [symbol, chartType]);

  useEffect(() => {
    if (symbol && stock) {
      setSelectedSymbol(symbol);
      
      // Try to fetch real logo
      const fetchLogo = async () => {
        try {
          const realLogo = await benzingaService.getStockLogo(stock.symbol);
          if (realLogo) {
            setLogoInfo(prev => prev ? { ...prev, imageUrl: realLogo } : null);
          }
        } catch (error) {
          console.warn('Failed to fetch logo:', error);
        }
      };
      fetchLogo();
    }
  }, [symbol, stock]);

  if (!stock) {
    return (
      <View style={createStyles(theme).container}>
        <Text style={createStyles(theme).errorText}>Stock not found</Text>
      </View>
    );
  }

  const isPositive = stock.change >= 0;
  const changeColor = isPositive ? theme.profit : theme.loss;

  return (
    <ScrollView style={createStyles(theme).container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={createStyles(theme).header}>
        <TouchableOpacity onPress={() => router.back()} style={createStyles(theme).backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={createStyles(theme).headerTitle}>{stock.symbol}</Text>
        <TouchableOpacity style={createStyles(theme).watchlistButton}>
          <Ionicons name="star-outline" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {/* Stock Header with Logo */}
      <View style={createStyles(theme).stockHeader}>
        <View style={[createStyles(theme).logoContainer, { backgroundColor: logoInfo?.imageUrl ? '#FFFFFF' : logoInfo?.color || theme.primary }]}>
          {logoInfo?.imageUrl ? (
            <Image
              source={{ uri: logoInfo.imageUrl }}
              style={createStyles(theme).logoImage}
              resizeMode="contain"
            />
          ) : (
            <Text style={createStyles(theme).logoText}>
              {stock.symbol.substring(0, 2).toUpperCase()}
            </Text>
          )}
        </View>
        <View style={createStyles(theme).stockInfo}>
          <Text style={createStyles(theme).stockName}>{stock.name}</Text>
          <Text style={createStyles(theme).stockExchange}>{stock.exchange} • {stock.instrumentType}</Text>
        </View>
      </View>

      {/* Price Section */}
      <View style={createStyles(theme).priceSection}>
        <Text style={createStyles(theme).price}>{formatCurrency(stock.lastPrice)}</Text>
        <View style={[createStyles(theme).changeContainer, { backgroundColor: changeColor + '20' }]}>
          <Ionicons 
            name={isPositive ? 'trending-up' : 'trending-down'} 
            size={16} 
            color={changeColor} 
          />
          <Text style={[createStyles(theme).change, { color: changeColor }]}>
            {isPositive ? '+' : ''}
            {formatCurrency(stock.change)} ({formatPercent(stock.changePercent)})
          </Text>
        </View>
      </View>

      {/* Time Frame Selector */}
      <View style={createStyles(theme).timeFrameContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(['1D', '1W', '1M', '3M', '1Y', 'ALL'] as const).map((tf) => (
            <TouchableOpacity
              key={tf}
              style={[
                createStyles(theme).timeFrameButton,
                chartType === tf && createStyles(theme).timeFrameButtonActive,
              ]}
              onPress={() => setChartType(tf)}
            >
              <Text
                style={[
                  createStyles(theme).timeFrameText,
                  chartType === tf && createStyles(theme).timeFrameTextActive,
                ]}
              >
                {tf}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Candlestick Chart */}
      <View style={createStyles(theme).chartContainer}>
        <CandlestickChart data={candleData} />
      </View>

      {/* Stats Grid */}
      <View style={createStyles(theme).statsGrid}>
        <View style={createStyles(theme).statCard}>
          <Text style={createStyles(theme).statLabel}>Open</Text>
          <Text style={createStyles(theme).statValue}>{formatCurrency(stock.open)}</Text>
        </View>
        <View style={createStyles(theme).statCard}>
          <Text style={createStyles(theme).statLabel}>High</Text>
          <Text style={[createStyles(theme).statValue, { color: theme.profit }]}>{formatCurrency(stock.high)}</Text>
        </View>
        <View style={createStyles(theme).statCard}>
          <Text style={createStyles(theme).statLabel}>Low</Text>
          <Text style={[createStyles(theme).statValue, { color: theme.loss }]}>{formatCurrency(stock.low)}</Text>
        </View>
        <View style={createStyles(theme).statCard}>
          <Text style={createStyles(theme).statLabel}>Prev Close</Text>
          <Text style={createStyles(theme).statValue}>{formatCurrency(stock.prevClose)}</Text>
        </View>
        <View style={createStyles(theme).statCard}>
          <Text style={createStyles(theme).statLabel}>Volume</Text>
          <Text style={createStyles(theme).statValue}>
            {(stock.volume / 1000000).toFixed(1)}M
          </Text>
        </View>
        <View style={createStyles(theme).statCard}>
          <Text style={createStyles(theme).statLabel}>Avg Vol</Text>
          <Text style={createStyles(theme).statValue}>
            {(stock.volume / 1000000 * 1.2).toFixed(1)}M
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={createStyles(theme).actionSection}>
        <TouchableOpacity
          style={[createStyles(theme).actionButton, createStyles(theme).buyButton]}
          onPress={() => router.push({
            pathname: '/order',
            params: { symbol: stock.symbol, side: 'BUY' },
          })}
        >
          <Text style={createStyles(theme).buyButtonText}>BUY</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[createStyles(theme).actionButton, createStyles(theme).sellButton]}
          onPress={() => router.push({
            pathname: '/order',
            params: { symbol: stock.symbol, side: 'SELL' },
          })}
        >
          <Text style={createStyles(theme).sellButtonText}>SELL</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Padding */}
      <View style={{ height: 40 }} />
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
    paddingBottom: 16,
    backgroundColor: theme.surface,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
  },
  watchlistButton: {
    padding: 4,
  },
  stockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.surface,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  stockInfo: {
    flex: 1,
  },
  stockName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 6,
  },
  stockExchange: {
    fontSize: 14,
    color: theme.textMuted,
    textTransform: 'uppercase',
  },
  priceSection: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  price: {
    fontSize: 42,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 12,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  change: {
    fontSize: 16,
    fontWeight: '600',
  },
  timeFrameContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: theme.background,
  },
  timeFrameButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
  },
  timeFrameButtonActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  timeFrameText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textMuted,
  },
  timeFrameTextActive: {
    color: theme.text,
  },
  chartContainer: {
    backgroundColor: theme.surface,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 20,
  },
  statCard: {
    width: (SCREEN_WIDTH - 48) / 3,
    backgroundColor: theme.card,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  statLabel: {
    fontSize: 10,
    color: theme.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.text,
  },
  actionSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buyButton: {
    backgroundColor: theme.profit,
  },
  sellButton: {
    backgroundColor: theme.loss,
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  sellButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  errorText: {
    color: theme.error,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
});

