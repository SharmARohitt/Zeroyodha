import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMarketStore } from '../src/store/useMarketStore';
import { Stock } from '../src/types';

const colors = {
  primary: '#00D4FF',
  profit: '#00C853',
  loss: '#FF5252',
  background: '#000000',
  backgroundSecondary: '#0A0A0A',
  card: '#1A1A1A',
  border: '#2A2A2A',
  text: '#FFFFFF',
  textMuted: '#666666',
};

export default function SearchScreen() {
  const router = useRouter();
  const { stocks, addToWatchlist, currentWatchlist, watchlists } = useMarketStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const currentWatchlistData = watchlists.find(w => w.id === currentWatchlist);
  const watchlistSymbols = currentWatchlistData?.symbols || [];
  
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const results = Object.values(stocks).filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(query) ||
          stock.name.toLowerCase().includes(query) ||
          stock.exchange.toLowerCase().includes(query)
      );
      setFilteredStocks(results.slice(0, 50)); // Limit to 50 results
    } else {
      setFilteredStocks([]);
    }
  }, [searchQuery, stocks]);
  
  const handleAddToWatchlist = (symbol: string) => {
    if (!symbol) return;
    addToWatchlist(symbol, currentWatchlist || undefined);
    
    // Add to recent searches
    setRecentSearches(prev => {
      const updated = [symbol, ...prev.filter(s => s !== symbol)].slice(0, 10);
      return updated;
    });
    
    router.back();
  };
  
  const handleStockPress = (symbol: string) => {
    useMarketStore.getState().setSelectedSymbol(symbol);
    router.push({
      pathname: '/stock-detail',
      params: { symbol },
    });
  };
  
  const isInWatchlist = (symbol: string) => {
    return watchlistSymbols.includes(symbol);
  };
  
  const renderStockItem = ({ item }: { item: Stock }) => {
    const inWatchlist = isInWatchlist(item.symbol);
    const changePercent = ((item.lastPrice - item.prevClose) / item.prevClose) * 100;
    const isPositive = changePercent >= 0;
    
    return (
      <TouchableOpacity
        style={styles.stockItem}
        onPress={() => handleStockPress(item.symbol)}
      >
        <View style={styles.stockLeft}>
          <Text style={styles.stockSymbol}>{item.symbol}</Text>
          <Text style={styles.stockName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.stockExchange}>{item.exchange}</Text>
        </View>
        
        <View style={styles.stockCenter}>
          <Text style={styles.stockPrice}>₹{item.lastPrice.toFixed(2)}</Text>
          <Text style={[styles.stockChange, { color: isPositive ? colors.profit : colors.loss }]}>
            {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.addButton, inWatchlist && styles.addButtonActive]}
          onPress={() => !inWatchlist && handleAddToWatchlist(item.symbol)}
        >
          <Ionicons
            name={inWatchlist ? 'checkmark' : 'add'}
            size={20}
            color={inWatchlist ? colors.profit : colors.primary}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };
  
  const renderRecentSearch = (symbol: string) => {
    const stock = stocks[symbol];
    if (!stock) return null;
    
    return (
      <TouchableOpacity
        key={symbol}
        style={styles.recentItem}
        onPress={() => handleStockPress(symbol)}
      >
        <Ionicons name="time-outline" size={20} color={colors.textMuted} />
        <View style={styles.recentInfo}>
          <Text style={styles.recentSymbol}>{stock.symbol}</Text>
          <Text style={styles.recentName} numberOfLines={1}>{stock.name}</Text>
        </View>
        <Text style={styles.recentPrice}>₹{stock.lastPrice.toFixed(2)}</Text>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search stocks, derivatives..."
            placeholderTextColor={colors.textMuted}
            autoFocus
            autoCapitalize="characters"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {searchQuery.trim() === '' ? (
        <View style={styles.content}>
          {recentSearches.length > 0 && (
            <View style={styles.recentSection}>
              <View style={styles.recentHeader}>
                <Text style={styles.sectionTitle}>Recent Searches</Text>
                <TouchableOpacity onPress={() => setRecentSearches([])}>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              </View>
              {recentSearches.map(renderRecentSearch)}
            </View>
          )}
          
          <View style={styles.tipsSection}>
            <Text style={styles.sectionTitle}>Search Tips</Text>
            <View style={styles.tipItem}>
              <Ionicons name="bulb-outline" size={20} color={colors.primary} />
              <Text style={styles.tipText}>Search by stock symbol (e.g., RELIANCE, TCS)</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="bulb-outline" size={20} color={colors.primary} />
              <Text style={styles.tipText}>Search by company name (e.g., Tata Motors)</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="bulb-outline" size={20} color={colors.primary} />
              <Text style={styles.tipText}>Search derivatives (e.g., NIFTY 17000 CE)</Text>
            </View>
          </View>
        </View>
      ) : (
        <FlatList
          data={filteredStocks}
          keyExtractor={(item) => item.symbol}
          renderItem={renderStockItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color={colors.textMuted} />
              <Text style={styles.emptyText}>No stocks found</Text>
              <Text style={styles.emptySubtext}>Try searching with different keywords</Text>
            </View>
          }
        />
      )}
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 55 : 45,
    paddingBottom: 12,
    backgroundColor: colors.backgroundSecondary,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  recentSection: {
    marginBottom: 24,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  clearText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 10,
    marginBottom: 8,
    gap: 12,
  },
  recentInfo: {
    flex: 1,
  },
  recentSymbol: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  recentName: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  recentPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  tipsSection: {
    marginTop: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  listContent: {
    padding: 16,
  },
  stockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stockLeft: {
    flex: 1,
  },
  stockSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  stockName: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  stockExchange: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  stockCenter: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  stockPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  stockChange: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  addButtonActive: {
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.profit,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 8,
  },
});
