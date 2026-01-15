import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Image,
  Platform,
  Animated,
} from 'react-native';
import { useMarketStore } from '../../src/store/useMarketStore';
import { useTradingStore } from '../../src/store/useTradingStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import { Stock } from '../../src/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import StockCard from '../../src/components/StockCard';
import FloatingTradeButton from '../../src/components/FloatingTradeButton';
import TopIndicesCarousel from '../../src/components/TopIndicesCarousel';
import WatchlistTabs from '../../src/components/WatchlistTabs';
import Toast from '../../src/components/Toast';
import { notificationService } from '../../src/services/notificationService';

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
};

export default function WatchlistScreen() {
  const router = useRouter();
  const { 
    watchlists, 
    currentWatchlist, 
    stocks, 
    initializeMarketData,
    setCurrentWatchlist,
  } = useMarketStore();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({ visible: false, message: '', type: 'success' });
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    initializeMarketData();
    
    // Subscribe to notifications
    const unsubscribe = notificationService.subscribe(() => {
      setUnreadNotifications(notificationService.getUnreadCount());
    });

    // Start mock alerts for demo
    notificationService.startMockAlerts();

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

    return unsubscribe;
  }, []);

  // Watchlists are initialized in initializeMarketData

  const currentWatchlistData = watchlists.find((w) => w.id === currentWatchlist);
  let watchlistStocks = currentWatchlistData?.symbols
    .map((symbol) => stocks[symbol])
    .filter(Boolean) as Stock[] || [];

  // Filter by search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    watchlistStocks = watchlistStocks.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(query) ||
        stock.name.toLowerCase().includes(query)
    );
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await initializeMarketData();
    setRefreshing(false);
  };

  const handleStockPress = (symbol: string) => {
    useMarketStore.getState().setSelectedSymbol(symbol);
    router.push({
      pathname: '/stock-detail',
      params: { symbol },
    });
  };

  const handleTabPress = (watchlistId: string) => {
    setCurrentWatchlist(watchlistId);
  };

  const handleAddStock = () => {
    router.push('/search');
  };

  const handleNotificationPress = () => {
    // Navigate to notifications screen or show notifications modal
    console.log('Show notifications');
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
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
    <View style={styles.container}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
      
      {/* Header with Logo */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <View style={styles.headerLeft}>
          <Animated.View style={{ transform: [{ scale: logoScale }] }}>
            <Image
              source={require('../../assets/images/Wealth.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
          <Text style={styles.headerTitle}>Hey {getUserName()}!</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={handleNotificationPress}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="notifications-outline" 
              size={Platform.OS === 'ios' ? 26 : 24} 
              color={colors.text} 
            />
            {unreadNotifications > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{unreadNotifications}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={handleAddStock}
            activeOpacity={1.9}
          >
            <Ionicons 
              name="add-circle-outline" 
              size={Platform.OS === 'ios' ? 26 : 24} 
              color={colors.primary} 
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Top Indices Carousel */}
      <TopIndicesCarousel />

      {/* Watchlist Tabs */}
      <WatchlistTabs
        watchlists={watchlists}
        currentWatchlist={currentWatchlist}
        onTabPress={handleTabPress}
      />

      {/* Search and Filter Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search & add"
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.searchMeta}>
          <Text style={styles.searchMetaText}>
            {watchlistStocks.length}/{currentWatchlistData?.symbols.length || 0}
          </Text>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Watchlist Content */}
      {watchlistStocks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="list-outline" size={64} color="#666" />
          <Text style={styles.emptyText}>
            {searchQuery ? 'No stocks found' : 'No stocks in watchlist'}
          </Text>
          {!searchQuery && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/search')}
            >
              <Text style={styles.addButtonText}>Add Stocks</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={watchlistStocks}
          keyExtractor={(item) => item.symbol}
          renderItem={({ item }) => (
            <StockCard
              stock={item}
              onPress={() => handleStockPress(item.symbol)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#2962FF"
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      <FloatingTradeButton />
    </View>
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
  headerTitle: {
    fontSize: Platform.OS === 'ios' ? 24 : 22,
    fontWeight: Platform.OS === 'ios' ? '800' : 'bold',
    color: colors.primary,
    ...(Platform.OS === 'ios' && {
      letterSpacing: 0.5,
      textShadowColor: 'rgba(0, 212, 255, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    }),
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    padding: Platform.OS === 'ios' ? 8 : 6,
    position: 'relative',
    borderRadius: Platform.OS === 'ios' ? 12 : 8,
    ...(Platform.OS === 'ios' && {
      backgroundColor: 'rgba(26, 26, 26, 0.8)',
    }),
  },
  notificationBadge: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 4 : 2,
    right: Platform.OS === 'ios' ? 4 : 2,
    backgroundColor: colors.primary,
    borderRadius: 12,
    minWidth: Platform.OS === 'ios' ? 22 : 20,
    height: Platform.OS === 'ios' ? 22 : 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'ios' && {
      borderWidth: 2,
      borderColor: colors.backgroundSecondary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.8,
      shadowRadius: 3,
    }),
  },
  notificationBadgeText: {
    color: colors.text,
    fontSize: Platform.OS === 'ios' ? 11 : 10,
    fontWeight: Platform.OS === 'ios' ? '800' : 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 16 : 12,
    backgroundColor: colors.backgroundSecondary,
    borderBottomWidth: Platform.OS === 'ios' ? 0.5 : 1,
    borderBottomColor: Platform.OS === 'ios' ? 'rgba(0, 212, 255, 0.2)' : colors.card,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: Platform.OS === 'ios' ? 12 : 10,
    paddingHorizontal: 12,
    height: Platform.OS === 'ios' ? 44 : 42,
    borderWidth: Platform.OS === 'ios' ? 0.5 : 1,
    borderColor: Platform.OS === 'ios' ? 'rgba(0, 212, 255, 0.3)' : colors.border,
    ...(Platform.OS === 'ios' && {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    }),
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    fontWeight: Platform.OS === 'ios' ? '500' : 'normal',
  },
  searchMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchMetaText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  filterButton: {
    padding: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 120,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  addButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

