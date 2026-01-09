import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useMarketStore } from '../../src/store/useMarketStore';
import { useTradingStore } from '../../src/store/useTradingStore';
import { Stock } from '../../src/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import StockCard from '../../src/components/StockCard';
import FloatingTradeButton from '../../src/components/FloatingTradeButton';

export default function WatchlistScreen() {
  const router = useRouter();
  const { watchlists, currentWatchlist, stocks, initializeMarketData } = useMarketStore();
  const { mode } = useTradingStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initializeMarketData();
  }, []);

  const currentWatchlistData = watchlists.find((w) => w.id === currentWatchlist);
  const watchlistStocks = currentWatchlistData?.symbols
    .map((symbol) => stocks[symbol])
    .filter(Boolean) as Stock[] || [];

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Watchlist</Text>
        <View style={styles.modeBadge}>
          <Text style={styles.modeText}>{mode === 'PAPER' ? '📝 Paper' : '💰 Live'}</Text>
        </View>
      </View>

      {watchlistStocks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="list-outline" size={64} color="#666" />
          <Text style={styles.emptyText}>No stocks in watchlist</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/search')}
          >
            <Text style={styles.addButtonText}>Add Stocks</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#0A0A0A',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modeBadge: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  modeText: {
    color: '#2962FF',
    fontSize: 12,
    fontWeight: '600',
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

