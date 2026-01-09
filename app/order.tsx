import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTradingStore } from '../src/store/useTradingStore';
import { useMarketStore } from '../src/store/useMarketStore';
import { OrderType, OrderSide, ProductType } from '../src/types';
import { Ionicons } from '@expo/vector-icons';

export default function OrderScreen() {
  const router = useRouter();
  const { symbol, side: initialSide } = useLocalSearchParams<{ symbol?: string; side?: string }>();
  const { stocks } = useMarketStore();
  const { mode, placeOrder } = useTradingStore();
  
  const [selectedSymbol, setSelectedSymbol] = useState(symbol || '');
  const [side, setSide] = useState<OrderSide>((initialSide as OrderSide) || 'BUY');
  const [type, setType] = useState<OrderType>('MARKET');
  const [product, setProduct] = useState<ProductType>('MIS');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [triggerPrice, setTriggerPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const stock = selectedSymbol ? stocks[selectedSymbol] : null;
  const currentPrice = stock?.lastPrice || 0;

  useEffect(() => {
    if (stock && type === 'MARKET') {
      setPrice('');
    } else if (stock && type === 'LIMIT') {
      setPrice(currentPrice.toFixed(2));
    }
  }, [type, stock]);

  const handlePlaceOrder = async () => {
    if (!selectedSymbol) {
      Alert.alert('Error', 'Please select a stock');
      return;
    }

    if (!quantity || parseInt(quantity) <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    if ((type === 'LIMIT' || type === 'SL') && !price) {
      Alert.alert('Error', 'Please enter a price');
      return;
    }

    if ((type === 'SL' || type === 'SL-M') && !triggerPrice) {
      Alert.alert('Error', 'Please enter a trigger price');
      return;
    }

    setLoading(true);
    try {
      await placeOrder({
        symbol: selectedSymbol,
        exchange: stock?.exchange || 'NSE',
        side,
        type,
        product,
        quantity: parseInt(quantity),
        price: price ? parseFloat(price) : undefined,
        triggerPrice: triggerPrice ? parseFloat(triggerPrice) : undefined,
        mode,
      });

      Alert.alert('Success', 'Order placed successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Place Order</Text>
        <View style={{ width: 24 }} />
      </View>

      {stock && (
        <View style={styles.stockInfo}>
          <Text style={styles.stockSymbol}>{stock.symbol}</Text>
          <Text style={styles.stockName}>{stock.name}</Text>
          <Text style={styles.stockPrice}>₹{currentPrice.toFixed(2)}</Text>
        </View>
      )}

      {!stock && (
        <TouchableOpacity
          style={styles.selectStockButton}
          onPress={() => router.push('/search')}
        >
          <Text style={styles.selectStockText}>Select Stock</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Side</Text>
        <View style={styles.sideButtons}>
          <TouchableOpacity
            style={[
              styles.sideButton,
              side === 'BUY' && {
                borderColor: '#00C853',
                backgroundColor: '#1B5E20',
              },
            ]}
            onPress={() => setSide('BUY')}
          >
            <Text
              style={[
                styles.sideButtonText,
                side === 'BUY' && styles.sideButtonTextActive,
              ]}
            >
              BUY
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sideButton,
              side === 'SELL' && {
                borderColor: '#FF5252',
                backgroundColor: '#B71C1C',
              },
            ]}
            onPress={() => setSide('SELL')}
          >
            <Text
              style={[
                styles.sideButtonText,
                side === 'SELL' && styles.sideButtonTextActive,
              ]}
            >
              SELL
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Product</Text>
        <View style={styles.productButtons}>
          <TouchableOpacity
            style={[styles.productButton, product === 'MIS' && styles.productButtonActive]}
            onPress={() => setProduct('MIS')}
          >
            <Text
              style={[
                styles.productButtonText,
                product === 'MIS' && styles.productButtonTextActive,
              ]}
            >
              MIS
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.productButton, product === 'CNC' && styles.productButtonActive]}
            onPress={() => setProduct('CNC')}
          >
            <Text
              style={[
                styles.productButtonText,
                product === 'CNC' && styles.productButtonTextActive,
              ]}
            >
              CNC
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Type</Text>
        <View style={styles.typeButtons}>
          {(['MARKET', 'LIMIT', 'SL', 'SL-M'] as OrderType[]).map((orderType) => (
            <TouchableOpacity
              key={orderType}
              style={[styles.typeButton, type === orderType && styles.typeButtonActive]}
              onPress={() => setType(orderType)}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  type === orderType && styles.typeButtonTextActive,
                ]}
              >
                {orderType}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quantity</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter quantity"
          placeholderTextColor="#666"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
        />
      </View>

      {(type === 'LIMIT' || type === 'SL' || type === 'SL-M') && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter price"
            placeholderTextColor="#666"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />
        </View>
      )}

      {(type === 'SL' || type === 'SL-M') && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trigger Price</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter trigger price"
            placeholderTextColor="#666"
            value={triggerPrice}
            onChangeText={setTriggerPrice}
            keyboardType="decimal-pad"
          />
        </View>
      )}

      <TouchableOpacity
        style={[styles.placeButton, loading && styles.placeButtonDisabled]}
        onPress={handlePlaceOrder}
        disabled={loading}
      >
        <Text style={styles.placeButtonText}>
          {loading ? 'Placing Order...' : 'Place Order'}
        </Text>
      </TouchableOpacity>
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
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#0A0A0A',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stockInfo: {
    backgroundColor: '#1A1A1A',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  stockSymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  stockName: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  stockPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2962FF',
  },
  selectStockButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  selectStockText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  sideButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  sideButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sideButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
  },
  sideButtonTextActive: {
    color: '#FFFFFF',
  },
  productButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  productButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  productButtonActive: {
    borderColor: '#2962FF',
    backgroundColor: '#1A237E',
  },
  productButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
  },
  productButtonTextActive: {
    color: '#FFFFFF',
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonActive: {
    borderColor: '#2962FF',
    backgroundColor: '#1A237E',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  placeButton: {
    backgroundColor: '#2962FF',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  placeButtonDisabled: {
    opacity: 0.6,
  },
  placeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

