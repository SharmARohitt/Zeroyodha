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
import Toast from '../src/components/Toast';
import { Ionicons } from '@expo/vector-icons';

// Theme colors
const colors = {
  primary: '#00D4FF', // Blue Neon
  background: '#000000',
  backgroundSecondary: '#0A0A0A',
  card: '#1A1A1A',
  border: '#2A2A2A',
  text: '#FFFFFF',
  textMuted: '#666666',
};

export default function SearchScreen() {
  const router = useRouter();
  const { stocks, searchStocks, addToWatchlist } = useMarketStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(Object.values(stocks).slice(0, 20));
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({ visible: false, message: '', type: 'success' });

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
    showToast(`${symbol} added to watchlist successfully!`, 'success');
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  return (
    <View style={styles.container}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stocks..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={handleSearch}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
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
              <Ionicons name="add-circle" size={28} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.backgroundSecondary,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
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

