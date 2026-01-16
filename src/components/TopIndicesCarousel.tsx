import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { useMarketStore } from '../store/useMarketStore';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.28;
const CARD_SPACING = 6;
const CUSTOM_STOCKS_KEY = '@custom_carousel_stocks';

export default function TopIndicesCarousel() {
  const { stocks } = useMarketStore();
  const { theme } = useTheme();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [customStocks, setCustomStocks] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCustomStocks();
  }, []);

  const loadCustomStocks = async () => {
    try {
      const saved = await AsyncStorage.getItem(CUSTOM_STOCKS_KEY);
      if (saved) {
        setCustomStocks(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading custom stocks:', error);
    }
  };

  const saveCustomStocks = async (symbols: string[]) => {
    try {
      await AsyncStorage.setItem(CUSTOM_STOCKS_KEY, JSON.stringify(symbols));
      setCustomStocks(symbols);
    } catch (error) {
      console.error('Error saving custom stocks:', error);
    }
  };

  const handleAddStock = (symbol: string) => {
    if (customStocks.length >= 5) {
      Alert.alert('Limit Reached', 'You can add up to 5 custom stocks');
      return;
    }
    if (customStocks.includes(symbol)) {
      Alert.alert('Already Added', 'This stock is already in your custom list');
      return;
    }
    const updated = [...customStocks, symbol];
    saveCustomStocks(updated);
    setShowAddModal(false);
    setSearchQuery('');
  };

  const handleRemoveStock = (symbol: string) => {
    Alert.alert(
      'Remove Stock',
      `Remove ${symbol} from your custom list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updated = customStocks.filter(s => s !== symbol);
            saveCustomStocks(updated);
          },
        },
      ]
    );
  };

  // Get major indices
  const indices = [
    stocks['NIFTY'],
    stocks['BANKNIFTY'],
    stocks['SENSEX'],
    stocks['INDIAVIX'],
    stocks['FINNIFTY'],
  ].filter(Boolean);

  // Get custom stocks data
  const customStocksData = customStocks
    .map(symbol => stocks[symbol])
    .filter(Boolean);

  // Filter stocks for search
  const filteredStocks = Object.values(stocks).filter(stock => {
    if (!searchQuery.trim()) return false;
    const query = searchQuery.toLowerCase();
    return (
      stock.symbol.toLowerCase().includes(query) ||
      stock.name.toLowerCase().includes(query)
    );
  }).slice(0, 20); // Limit to 20 results

  if (indices.length === 0) {
    return null;
  }

  return (
    <View style={createStyles(theme).container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        contentContainerStyle={createStyles(theme).scrollContent}
        pagingEnabled={false}
        snapToAlignment="start"
      >
        {/* Indices Cards */}
        {indices.map((index) => {
          if (!index) return null;
          const isPositive = index.change >= 0;
          const changeColor = isPositive ? theme.profit : theme.loss;

          return (
            <TouchableOpacity
              key={index.symbol}
              style={createStyles(theme).card}
              activeOpacity={0.9}
              onPress={() => router.push({
                pathname: '/stock-detail',
                params: { symbol: index.symbol },
              })}
            >
              <View style={createStyles(theme).cardHeader}>
                <Text style={createStyles(theme).indexName} numberOfLines={1}>{index.name}</Text>
              </View>
              
              <View style={createStyles(theme).cardBody}>
                <Text style={createStyles(theme).indexValue}>
                  {formatCurrency(index.lastPrice)}
                </Text>
                <View style={[createStyles(theme).changeContainer, { backgroundColor: changeColor + '15' }]}>
                  <Text style={[createStyles(theme).changeText, { color: changeColor }]}>
                    {isPositive ? '▲' : '▼'} {formatPercent(Math.abs(index.changePercent))}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Custom Stocks Cards */}
        {customStocksData.map((stock) => {
          const isPositive = stock.change >= 0;
          const changeColor = isPositive ? theme.profit : theme.loss;

          return (
            <TouchableOpacity
              key={`custom-${stock.symbol}`}
              style={[createStyles(theme).card, createStyles(theme).customCard]}
              activeOpacity={0.9}
              onPress={() => router.push({
                pathname: '/stock-detail',
                params: { symbol: stock.symbol },
              })}
              onLongPress={() => handleRemoveStock(stock.symbol)}
            >
              <View style={createStyles(theme).cardHeader}>
                <Text style={createStyles(theme).indexName} numberOfLines={1}>{stock.symbol}</Text>
                <TouchableOpacity 
                  style={createStyles(theme).removeButton}
                  onPress={() => handleRemoveStock(stock.symbol)}
                >
                  <Ionicons name="close-circle" size={14} color={theme.textMuted} />
                </TouchableOpacity>
              </View>
              
              <View style={createStyles(theme).cardBody}>
                <Text style={createStyles(theme).indexValue}>
                  {formatCurrency(stock.lastPrice)}
                </Text>
                <View style={[createStyles(theme).changeContainer, { backgroundColor: changeColor + '15' }]}>
                  <Text style={[createStyles(theme).changeText, { color: changeColor }]}>
                    {isPositive ? '▲' : '▼'} {formatPercent(Math.abs(stock.changePercent))}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Add Custom Stock Card */}
        {customStocks.length < 5 && (
          <TouchableOpacity
            style={[createStyles(theme).card, createStyles(theme).addCard]}
            activeOpacity={0.7}
            onPress={() => setShowAddModal(true)}
          >
            <View style={createStyles(theme).addCardContent}>
              <Ionicons name="add-circle-outline" size={32} color={theme.primary} />
              <Text style={createStyles(theme).addCardText}>Add Stock</Text>
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Add Stock Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={createStyles(theme).modalOverlay}>
          <View style={createStyles(theme).modalContent}>
            <View style={createStyles(theme).modalHeader}>
              <Text style={createStyles(theme).modalTitle}>Add Custom Stock</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={createStyles(theme).searchContainer}>
              <Ionicons name="search" size={20} color={theme.textMuted} />
              <TextInput
                style={createStyles(theme).searchInput}
                placeholder="Search stocks..."
                placeholderTextColor={theme.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
            </View>

            <FlatList
              data={filteredStocks}
              keyExtractor={(item) => item.symbol}
              renderItem={({ item }) => {
                const isPositive = item.change >= 0;
                const changeColor = isPositive ? theme.profit : theme.loss;
                
                return (
                  <TouchableOpacity
                    style={createStyles(theme).stockItem}
                    onPress={() => handleAddStock(item.symbol)}
                  >
                    <View style={createStyles(theme).stockItemLeft}>
                      <Text style={createStyles(theme).stockSymbol}>{item.symbol}</Text>
                      <Text style={createStyles(theme).stockName} numberOfLines={1}>
                        {item.name}
                      </Text>
                    </View>
                    <View style={createStyles(theme).stockItemRight}>
                      <Text style={createStyles(theme).stockPrice}>
                        ₹{item.lastPrice.toFixed(2)}
                      </Text>
                      <Text style={[createStyles(theme).stockChange, { color: changeColor }]}>
                        {isPositive ? '+' : ''}{item.changePercent.toFixed(2)}%
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={createStyles(theme).emptyContainer}>
                  <Ionicons name="search-outline" size={48} color={theme.textMuted} />
                  <Text style={createStyles(theme).emptyText}>
                    {searchQuery ? 'No stocks found' : 'Search for stocks to add'}
                  </Text>
                </View>
              }
              style={createStyles(theme).stockList}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: theme.surface,
    paddingVertical: 6,
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: theme.card,
    borderRadius: 8,
    padding: 8,
    marginRight: CARD_SPACING,
    borderWidth: 0.5,
    borderColor: theme.border,
  },
  cardHeader: {
    marginBottom: 4,
  },
  indexName: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.textSecondary,
    textTransform: 'uppercase',
  },
  cardBody: {
    gap: 3,
  },
  indexValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.text,
  },
  changeContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  changeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  customCard: {
    borderColor: theme.primary + '40',
    borderWidth: 1,
  },
  removeButton: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  addCard: {
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: theme.primary,
    backgroundColor: theme.primary + '10',
  },
  addCardContent: {
    alignItems: 'center',
    gap: 4,
  },
  addCardText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    color: theme.text,
    fontSize: 16,
  },
  stockList: {
    paddingHorizontal: 20,
  },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.card,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  stockItemLeft: {
    flex: 1,
  },
  stockSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 2,
  },
  stockName: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  stockItemRight: {
    alignItems: 'flex-end',
  },
  stockPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  stockChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: theme.textMuted,
    marginTop: 12,
  },
});

