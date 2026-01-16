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
import { useTheme } from '../src/contexts/ThemeContext';

export default function SearchScreen() {
  const { theme } = useTheme();
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
        style={createStyles(theme).stockItem}
        onPress={() => handleStockPress(item.symbol)}
      >
        <View style={createStyles(theme).stockLeft}>
          <Text style={createStyles(theme).stockSymbol}>{item.symbol}</Text>
          <Text style={createStyles(theme).stockName} numberOfLines={1}>{item.name}</Text>
          <Text style={createStyles(theme).stockExchange}>{item.exchange}</Text>
        </View>
        
        <View style={createStyles(theme).stockCenter}>
          <Text style={createStyles(theme).stockPrice}>₹{item.lastPrice.toFixed(2)}</Text>
          <Text style={[createStyles(theme).stockChange, { color: isPositive ? theme.profit : theme.loss }]}>
            {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
          </Text>
        </View>
        
        <TouchableOpacity
          style={[createStyles(theme).addButton, inWatchlist && createStyles(theme).addButtonActive]}
          onPress={() => !inWatchlist && handleAddToWatchlist(item.symbol)}
        >
          <Ionicons
            name={inWatchlist ? 'checkmark' : 'add'}
            size={20}
            color={inWatchlist ? theme.profit : theme.primary}
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
        style={createStyles(theme).recentItem}
        onPress={() => handleStockPress(symbol)}
      >
        <Ionicons name="time-outline" size={20} color={theme.textMuted} />
        <View style={createStyles(theme).recentInfo}>
          <Text style={createStyles(theme).recentSymbol}>{stock.symbol}</Text>
          <Text style={createStyles(theme).recentName} numberOfLines={1}>{stock.name}</Text>
        </View>
        <Text style={createStyles(theme).recentPrice}>₹{stock.lastPrice.toFixed(2)}</Text>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={createStyles(theme).container}>
      <View style={createStyles(theme).header}>
        <TouchableOpacity onPress={() => router.back()} style={createStyles(theme).backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={createStyles(theme).searchBar}>
          <Ionicons name="search" size={20} color={theme.textMuted} />
          <TextInput
            style={createStyles(theme).searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search stocks, derivatives..."
            placeholderTextColor={theme.textMuted}
            autoFocus
            autoCapitalize="characters"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {searchQuery.trim() === '' ? (
        <View style={createStyles(theme).content}>
          {recentSearches.length > 0 && (
            <View style={createStyles(theme).recentSection}>
              <View style={createStyles(theme).recentHeader}>
                <Text style={createStyles(theme).sectionTitle}>Recent Searches</Text>
                <TouchableOpacity onPress={() => setRecentSearches([])}>
                  <Text style={createStyles(theme).clearText}>Clear</Text>
                </TouchableOpacity>
              </View>
              {recentSearches.map(renderRecentSearch)}
            </View>
          )}
          
          <View style={createStyles(theme).tipsSection}>
            <Text style={createStyles(theme).sectionTitle}>Search Tips</Text>
            <View style={createStyles(theme).tipItem}>
              <Ionicons name="bulb-outline" size={20} color={theme.primary} />
              <Text style={createStyles(theme).tipText}>Search by stock symbol (e.g., RELIANCE, TCS)</Text>
            </View>
            <View style={createStyles(theme).tipItem}>
              <Ionicons name="bulb-outline" size={20} color={theme.primary} />
              <Text style={createStyles(theme).tipText}>Search by company name (e.g., Tata Motors)</Text>
            </View>
            <View style={createStyles(theme).tipItem}>
              <Ionicons name="bulb-outline" size={20} color={theme.primary} />
              <Text style={createStyles(theme).tipText}>Search derivatives (e.g., NIFTY 17000 CE)</Text>
            </View>
          </View>
        </View>
      ) : (
        <FlatList
          data={filteredStocks}
          keyExtractor={(item) => item.symbol}
          renderItem={renderStockItem}
          contentContainerStyle={createStyles(theme).listContent}
          ListEmptyComponent={
            <View style={createStyles(theme).emptyContainer}>
              <Ionicons name="search-outline" size={64} color={theme.textMuted} />
              <Text style={createStyles(theme).emptyText}>No stocks found</Text>
              <Text style={createStyles(theme).emptySubtext}>Try searching with different keywords</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 55 : 45,
    paddingBottom: 12,
    backgroundColor: theme.surface,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  searchInput: {
    flex: 1,
    color: theme.text,
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
    color: theme.text,
  },
  clearText: {
    fontSize: 14,
    color: theme.primary,
    fontWeight: '600',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.card,
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
    color: theme.text,
  },
  recentName: {
    fontSize: 12,
    color: theme.textMuted,
    marginTop: 2,
  },
  recentPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
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
    color: theme.textMuted,
    lineHeight: 20,
  },
  listContent: {
    padding: 16,
  },
  stockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.card,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  stockLeft: {
    flex: 1,
  },
  stockSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
  },
  stockName: {
    fontSize: 12,
    color: theme.textMuted,
    marginTop: 2,
  },
  stockExchange: {
    fontSize: 10,
    color: theme.textMuted,
    marginTop: 2,
  },
  stockCenter: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  stockPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
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
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.primary,
  },
  addButtonActive: {
    backgroundColor: theme.surface,
    borderColor: theme.profit,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.textMuted,
    marginTop: 8,
  },
});
