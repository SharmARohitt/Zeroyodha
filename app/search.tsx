import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMarketStore } from '../src/store/useMarketStore';
import StockCard from '../src/components/StockCard';
import { Ionicons } from '@expo/vector-icons';

export default function SearchScreen() {
  const router = useRouter();
  const { stocks, searchStocks, addToWatchlist } = useMarketStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(Object.values(stocks).slice(0, 20));

  const handleSearch = (text: string) => {
    setQuery(text);
    if (text.trim()) {
      const searchResults = searchStocks(text);
      setResults(searchResults);
    } else {
      setResults(Object.values(stocks).slice(0, 20));
    }
  };

  const handleStockPress = (symbol: string) => {
    router.push({
      pathname: '/stock-detail',
      params: { symbol },
    });
  };

  const handleAddToWatchlist = (symbol: string) => {
    addToWatchlist(symbol);
    // Show feedback
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stocks..."
            placeholderTextColor="#666"
            value={query}
            onChangeText={handleSearch}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.symbol}
        renderItem={({ item }) => (
          <View style={styles.stockRow}>
            <TouchableOpacity
              style={styles.stockCardWrapper}
              onPress={() => handleStockPress(item.symbol)}
            >
              <StockCard stock={item} onPress={() => {}} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddToWatchlist(item.symbol)}
            >
              <Ionicons name="add" size={24} color="#2962FF" />
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#0A0A0A',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  listContent: {
    padding: 16,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stockCardWrapper: {
    flex: 1,
  },
  addButton: {
    marginLeft: 12,
    padding: 8,
  },
});

