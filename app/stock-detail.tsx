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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function StockDetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const router = useRouter();
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
      <View style={styles.container}>
        <Text style={styles.errorText}>Stock not found</Text>
      </View>
    );
  }

  const isPositive = stock.change >= 0;
  const changeColor = isPositive ? '#00C853' : '#FF5252';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{stock.symbol}</Text>
        <TouchableOpacity style={styles.watchlistButton}>
          <Ionicons name="star-outline" size={24} color="#00D4FF" />
        </TouchableOpacity>
      </View>

      {/* Stock Header with Logo */}
      <View style={styles.stockHeader}>
        <View style={[styles.logoContainer, { backgroundColor: logoInfo?.imageUrl ? '#FFFFFF' : logoInfo?.color || '#2962FF' }]}>
          {logoInfo?.imageUrl ? (
            <Image
              source={{ uri: logoInfo.imageUrl }}
              style={styles.logoImage}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.logoText}>
              {stock.symbol.substring(0, 2).toUpperCase()}
            </Text>
          )}
        </View>
        <View style={styles.stockInfo}>
          <Text style={styles.stockName}>{stock.name}</Text>
          <Text style={styles.stockExchange}>{stock.exchange} • {stock.instrumentType}</Text>
        </View>
      </View>

      {/* Price Section */}
      <View style={styles.priceSection}>
        <Text style={styles.price}>{formatCurrency(stock.lastPrice)}</Text>
        <View style={[styles.changeContainer, { backgroundColor: changeColor + '20' }]}>
          <Ionicons 
            name={isPositive ? 'trending-up' : 'trending-down'} 
            size={16} 
            color={changeColor} 
          />
          <Text style={[styles.change, { color: changeColor }]}>
            {isPositive ? '+' : ''}
            {formatCurrency(stock.change)} ({formatPercent(stock.changePercent)})
          </Text>
        </View>
      </View>

      {/* Time Frame Selector */}
      <View style={styles.timeFrameContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(['1D', '1W', '1M', '3M', '1Y', 'ALL'] as const).map((tf) => (
            <TouchableOpacity
              key={tf}
              style={[
                styles.timeFrameButton,
                chartType === tf && styles.timeFrameButtonActive,
              ]}
              onPress={() => setChartType(tf)}
            >
              <Text
                style={[
                  styles.timeFrameText,
                  chartType === tf && styles.timeFrameTextActive,
                ]}
              >
                {tf}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Candlestick Chart */}
      <View style={styles.chartContainer}>
        <CandlestickChart data={candleData} />
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Open</Text>
          <Text style={styles.statValue}>{formatCurrency(stock.open)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>High</Text>
          <Text style={[styles.statValue, { color: '#00C853' }]}>{formatCurrency(stock.high)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Low</Text>
          <Text style={[styles.statValue, { color: '#FF5252' }]}>{formatCurrency(stock.low)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Prev Close</Text>
          <Text style={styles.statValue}>{formatCurrency(stock.prevClose)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Volume</Text>
          <Text style={styles.statValue}>
            {(stock.volume / 1000000).toFixed(1)}M
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Avg Vol</Text>
          <Text style={styles.statValue}>
            {(stock.volume / 1000000 * 1.2).toFixed(1)}M
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity
          style={[styles.actionButton, styles.buyButton]}
          onPress={() => router.push({
            pathname: '/order',
            params: { symbol: stock.symbol, side: 'BUY' },
          })}
        >
          <Text style={styles.buyButtonText}>BUY</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.sellButton]}
          onPress={() => router.push({
            pathname: '/order',
            params: { symbol: stock.symbol, side: 'SELL' },
          })}
        >
          <Text style={styles.sellButtonText}>SELL</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Padding */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 55 : 45,
    paddingBottom: 16,
    backgroundColor: '#0A0A0A',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  watchlistButton: {
    padding: 4,
  },
  stockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0A0A0A',
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2962FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#00D4FF',
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
    color: '#FFFFFF',
    marginBottom: 6,
  },
  stockExchange: {
    fontSize: 14,
    color: '#999',
    textTransform: 'uppercase',
  },
  priceSection: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  price: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    backgroundColor: '#000000',
  },
  timeFrameButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  timeFrameButtonActive: {
    backgroundColor: '#00D4FF',
    borderColor: '#00D4FF',
  },
  timeFrameText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  timeFrameTextActive: {
    color: '#000000',
  },
  chartContainer: {
    backgroundColor: '#0A0A0A',
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
    backgroundColor: '#1A1A1A',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  statLabel: {
    fontSize: 10,
    color: '#999',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    backgroundColor: '#00C853',
  },
  sellButton: {
    backgroundColor: '#FF5252',
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
    color: '#FF5252',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
});

