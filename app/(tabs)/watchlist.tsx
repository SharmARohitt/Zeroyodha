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
import { useAuthStore } from '../../src/store/useAuthStore';
import { Stock } from '../../src/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import StockCard from '../../src/components/StockCard';
import FloatingTradeButton from '../../src/components/FloatingTradeButton';
import TopIndicesCarousel from '../../src/components/TopIndicesCarousel';
import WatchlistTabs from '../../src/components/WatchlistTabs';
import Toast from '../../src/components/Toast';
import NotificationsModal from '../../src/components/NotificationsModal';
import { notificationService } from '../../src/services/notificationService';
import { useTheme } from '../../src/contexts/ThemeContext';
import { responsive, getHeaderPadding, getLogoSize, getTitleFontSize, getIconSize } from '../../src/utils/responsive';

export default function WatchlistScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { 
    watchlists, 
    currentWatchlist, 
    stocks, 
    initializeMarketData,
    setCurrentWatchlist,
    createWatchlist,
  } = useMarketStore();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'gainers' | 'losers'>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({ visible: false, message: '', type: 'success' });
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [alerts, setAlerts] = useState(notificationService.getAlerts());
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    initializeMarketData();
    
    // Subscribe to notifications
    const unsubscribe = notificationService.subscribe((updatedAlerts) => {
      setAlerts(updatedAlerts);
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

  // Filter by type (gainers/losers)
  if (filterType === 'gainers') {
    watchlistStocks = watchlistStocks.filter(stock => stock.change > 0);
    watchlistStocks.sort((a, b) => b.changePercent - a.changePercent);
  } else if (filterType === 'losers') {
    watchlistStocks = watchlistStocks.filter(stock => stock.change < 0);
    watchlistStocks.sort((a, b) => a.changePercent - b.changePercent);
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

  const handleAddWatchlist = () => {
    const watchlistNumber = watchlists.length + 1;
    const newName = `Watchlist ${watchlistNumber}`;
    createWatchlist(newName);
    setToast({
      visible: true,
      message: `Created ${newName}`,
      type: 'success',
    });
  };

  const handleFilterPress = () => {
    setShowFilterMenu(!showFilterMenu);
  };

  const handleFilterSelect = (type: 'all' | 'gainers' | 'losers') => {
    setFilterType(type);
    setShowFilterMenu(false);
  };

  const handleNotificationPress = () => {
    setNotificationsVisible(true);
  };

  const handleMarkAsRead = (alertId: string) => {
    notificationService.markAsRead(alertId);
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
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
    <View style={createStyles(theme).container}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
      
      <NotificationsModal
        visible={notificationsVisible}
        onClose={() => setNotificationsVisible(false)}
        alerts={alerts}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
      
      {/* Header with Logo */}
      <Animated.View style={[createStyles(theme).header, { opacity: headerOpacity }]}>
        <View style={createStyles(theme).headerLeft}>
          <Animated.View style={{ transform: [{ scale: logoScale }] }}>
            <Image
              source={require('../../assets/images/Wealth.png')}
              style={createStyles(theme).logo}
              resizeMode="contain"
            />
          </Animated.View>
          <Text style={createStyles(theme).headerTitle}>Hey {getUserName()}!</Text>
        </View>
        <View style={createStyles(theme).headerRight}>
          <TouchableOpacity 
            style={createStyles(theme).headerButton} 
            onPress={handleNotificationPress}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="notifications-outline" 
              size={Platform.OS === 'ios' ? 26 : 24} 
              color={theme.text} 
            />
            {unreadNotifications > 0 && (
              <View style={createStyles(theme).notificationBadge}>
                <Text style={createStyles(theme).notificationBadgeText}>{unreadNotifications}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={createStyles(theme).headerButton} 
            onPress={handleAddStock}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="add-circle-outline" 
              size={Platform.OS === 'ios' ? 26 : 24} 
              color={theme.primary} 
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
        onAddWatchlist={handleAddWatchlist}
      />

      {/* Search and Filter Bar */}
      <View style={createStyles(theme).searchContainer}>
        <View style={createStyles(theme).searchBar}>
          <Ionicons name="search" size={20} color={theme.textMuted} style={createStyles(theme).searchIcon} />
          <TextInput
            style={createStyles(theme).searchInput}
            placeholder="Search & add"
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={createStyles(theme).searchMeta}>
          <Text style={createStyles(theme).searchMetaText}>
            {watchlistStocks.length}/{currentWatchlistData?.symbols.length || 0}
          </Text>
          <TouchableOpacity style={createStyles(theme).filterButton} onPress={handleFilterPress}>
            <Ionicons 
              name="options" 
              size={20} 
              color={filterType !== 'all' ? theme.primary : theme.textMuted} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Menu */}
      {showFilterMenu && (
        <View style={createStyles(theme).filterMenu}>
          <TouchableOpacity
            style={[createStyles(theme).filterOption, filterType === 'all' && createStyles(theme).filterOptionActive]}
            onPress={() => handleFilterSelect('all')}
          >
            <Text style={[createStyles(theme).filterOptionText, filterType === 'all' && createStyles(theme).filterOptionTextActive]}>
              All Stocks
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[createStyles(theme).filterOption, filterType === 'gainers' && createStyles(theme).filterOptionActive]}
            onPress={() => handleFilterSelect('gainers')}
          >
            <Ionicons name="trending-up" size={16} color={theme.profit} />
            <Text style={[createStyles(theme).filterOptionText, filterType === 'gainers' && createStyles(theme).filterOptionTextActive]}>
              Gainers
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[createStyles(theme).filterOption, filterType === 'losers' && createStyles(theme).filterOptionActive]}
            onPress={() => handleFilterSelect('losers')}
          >
            <Ionicons name="trending-down" size={16} color={theme.loss} />
            <Text style={[createStyles(theme).filterOptionText, filterType === 'losers' && createStyles(theme).filterOptionTextActive]}>
              Losers
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Watchlist Content */}
      {watchlistStocks.length === 0 ? (
        <View style={createStyles(theme).emptyContainer}>
          <Ionicons name="list-outline" size={64} color={theme.textMuted} />
          <Text style={createStyles(theme).emptyText}>
            {searchQuery ? 'No stocks found' : 'No stocks in watchlist'}
          </Text>
          {!searchQuery && (
            <TouchableOpacity
              style={createStyles(theme).addButton}
              onPress={() => router.push('/search')}
            >
              <Text style={createStyles(theme).addButtonText}>Add Stocks</Text>
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
              tintColor={theme.primary}
            />
          }
          contentContainerStyle={createStyles(theme).listContent}
        />
      )}

      <FloatingTradeButton />
    </View>
  );
}

const createStyles = (theme: any) => {
  const headerPadding = getHeaderPadding();
  const logoSize = getLogoSize();
  const titleFontSize = getTitleFontSize();
  
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...headerPadding,
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
    gap: responsive.scaleWidth(10),
  },
  logo: {
    width: logoSize,
    height: logoSize,
    borderRadius: logoSize / 4,
    ...(Platform.OS === 'ios' && {
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    }),
  },
  headerTitle: {
    fontSize: titleFontSize,
    fontWeight: Platform.OS === 'ios' ? '800' : 'bold',
    color: theme.primary,
    ...(Platform.OS === 'ios' && {
      letterSpacing: 0.5,
      textShadowColor: theme.primary + '4D',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    }),
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsive.scaleWidth(12),
  },
  headerButton: {
    padding: responsive.scaleWidth(Platform.OS === 'ios' ? 8 : 6),
    position: 'relative',
    borderRadius: responsive.scaleWidth(Platform.OS === 'ios' ? 12 : 8),
    ...(Platform.OS === 'ios' && {
      backgroundColor: theme.card + 'CC',
    }),
  },
  notificationBadge: {
    position: 'absolute',
    top: responsive.scaleHeight(Platform.OS === 'ios' ? 4 : 2),
    right: responsive.scaleWidth(Platform.OS === 'ios' ? 4 : 2),
    backgroundColor: theme.primary,
    borderRadius: responsive.scaleWidth(12),
    minWidth: responsive.scaleWidth(Platform.OS === 'ios' ? 22 : 20),
    height: responsive.scaleHeight(Platform.OS === 'ios' ? 22 : 20),
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'ios' && {
      borderWidth: 2,
      borderColor: theme.surface,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.8,
      shadowRadius: 3,
    }),
  },
  notificationBadgeText: {
    color: theme.text,
    fontSize: responsive.scaleFontSize(Platform.OS === 'ios' ? 11 : 10),
    fontWeight: Platform.OS === 'ios' ? '800' : 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsive.scaleWidth(16),
    paddingVertical: responsive.scaleHeight(Platform.OS === 'ios' ? 16 : 12),
    backgroundColor: theme.surface,
    borderBottomWidth: Platform.OS === 'ios' ? 0.5 : 1,
    borderBottomColor: Platform.OS === 'ios' ? theme.primary + '33' : theme.card,
    gap: responsive.scaleWidth(12),
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: responsive.scaleWidth(Platform.OS === 'ios' ? 12 : 10),
    paddingHorizontal: responsive.scaleWidth(12),
    height: Platform.OS === 'ios' ? 44 : 42,
    borderWidth: Platform.OS === 'ios' ? 0.5 : 1,
    borderColor: Platform.OS === 'ios' ? theme.primary + '4D' : theme.border,
    ...(Platform.OS === 'ios' && {
      shadowColor: theme.primary,
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
    color: theme.text,
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    fontWeight: Platform.OS === 'ios' ? '500' : 'normal',
  },
  searchMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchMetaText: {
    color: theme.textMuted,
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
    color: theme.textMuted,
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  addButtonText: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '600',
  },
  filterMenu: {
    backgroundColor: theme.card,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: theme.border,
    ...(Platform.OS === 'ios' && {
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    }),
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 8,
  },
  filterOptionActive: {
    backgroundColor: theme.surface,
  },
  filterOptionText: {
    color: theme.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: theme.primary,
    fontWeight: '600',
  },
});
};
