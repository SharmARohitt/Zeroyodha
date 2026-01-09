import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useMarketStore } from '../../src/store/useMarketStore';
import { useTradingStore } from '../../src/store/useTradingStore';
import { Stock } from '../../src/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import StockCard from '../../src/components/StockCard';
import FloatingTradeButton from '../../src/components/FloatingTradeButton';
import TopIndicesCarousel from '../../src/components/TopIndicesCarousel';
import WatchlistTabs from '../../src/components/WatchlistTabs';

export default function WatchlistScreen() {
  const router = useRouter();
  const { 
    watchlists, 
    currentWatchlist, 
    stocks, 
    initializeMarketData,
    setCurrentWatchlist,
  } = useMarketStore();
  const { mode } = useTradingStore();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    initializeMarketData();
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

  return (
    <View style={styles.container}>
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
    backgroundColor: '#000000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0A0A0A',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
  searchMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchMetaText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  filterButton: {
    padding: 4,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#2962FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

