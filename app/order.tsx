import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Switch,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMarketStore } from '../src/store/useMarketStore';
import { useTradingStore } from '../src/store/useTradingStore';
import { OrderType, ProductType, OrderSide } from '../src/types';

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

type GTTCondition = 'SINGLE' | 'OCO';

export default function OrderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const symbol = params.symbol as string;
  
  const { stocks } = useMarketStore();
  const { placeOrder, funds, mode } = useTradingStore();
  
  const stock = symbol ? stocks[symbol] : null;
  
  // Order State
  const [orderSide, setOrderSide] = useState<OrderSide>('BUY');
  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const [productType, setProductType] = useState<ProductType>('CNC');
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('');
  const [triggerPrice, setTriggerPrice] = useState('');
  
  // Advanced Options
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGTT, setIsGTT] = useState(false);
  const [gttCondition, setGttCondition] = useState<GTTCondition>('SINGLE');
  const [gttTriggerPrice, setGttTriggerPrice] = useState('');
  const [gttLimitPrice, setGttLimitPrice] = useState('');
  const [isIceberg, setIsIceberg] = useState(false);
  const [icebergQuantity, setIcebergQuantity] = useState('');
  const [icebergLegs, setIcebergLegs] = useState('');
  const [isAMO, setIsAMO] = useState(false);
  const [validity, setValidity] = useState<'DAY' | 'IOC'>('DAY');
  
  useEffect(() => {
    if (stock && orderType === 'LIMIT' && !price) {
      setPrice(stock.lastPrice.toString());
    }
    if (stock && (orderType === 'SL' || orderType === 'SL-M') && !triggerPrice) {
      setTriggerPrice(stock.lastPrice.toString());
    }
  }, [stock, orderType]);
  
  const calculateTotal = () => {
    const qty = parseInt(quantity) || 0;
    let pricePerShare = 0;
    
    if (orderType === 'MARKET' && stock) {
      pricePerShare = stock.lastPrice;
    } else if (orderType === 'LIMIT') {
      pricePerShare = parseFloat(price) || 0;
    } else if (orderType === 'SL') {
      pricePerShare = parseFloat(price) || 0;
    } else if (orderType === 'SL-M' && stock) {
      pricePerShare = stock.lastPrice;
    }
    
    return qty * pricePerShare;
  };
  
  const calculateMargin = () => {
    const total = calculateTotal();
    if (productType === 'MIS') {
      return total * 0.2; // 5x leverage = 20% margin
    }
    return total;
  };
  
  const validateOrder = (): string | null => {
    const qty = parseInt(quantity);
    if (!qty || qty <= 0) {
      return 'Please enter a valid quantity';
    }
    
    if (orderType === 'LIMIT' && (!price || parseFloat(price) <= 0)) {
      return 'Please enter a valid limit price';
    }
    
    if ((orderType === 'SL' || orderType === 'SL-M') && (!triggerPrice || parseFloat(triggerPrice) <= 0)) {
      return 'Please enter a valid trigger price';
    }
    
    if (orderType === 'SL' && (!price || parseFloat(price) <= 0)) {
      return 'Please enter a valid limit price for stop-loss order';
    }
    
    const requiredMargin = calculateMargin();
    if (orderSide === 'BUY' && requiredMargin > funds.available) {
      return `Insufficient funds. Required: ₹${requiredMargin.toFixed(2)}, Available: ₹${funds.available.toFixed(2)}`;
    }
    
    if (isIceberg) {
      const iceQty = parseInt(icebergQuantity);
      const legs = parseInt(icebergLegs);
      if (!iceQty || iceQty <= 0 || !legs || legs <= 0) {
        return 'Please enter valid iceberg parameters';
      }
      if (iceQty * legs !== qty) {
        return 'Iceberg quantity × legs must equal total quantity';
      }
    }
    
    if (isGTT) {
      if (!gttTriggerPrice || parseFloat(gttTriggerPrice) <= 0) {
        return 'Please enter a valid GTT trigger price';
      }
      if (gttCondition === 'OCO' && (!gttLimitPrice || parseFloat(gttLimitPrice) <= 0)) {
        return 'Please enter a valid GTT limit price for OCO';
      }
    }
    
    return null;
  };
  
  const handlePlaceOrder = async () => {
    if (!stock) {
      Alert.alert('Error', 'Stock not found');
      return;
    }
    
    const error = validateOrder();
    if (error) {
      Alert.alert('Validation Error', error);
      return;
    }
    
    const orderPrice = orderType === 'MARKET' || orderType === 'SL-M' 
      ? stock.lastPrice 
      : parseFloat(price);
    
    const order = {
      symbol: stock.symbol,
      exchange: stock.exchange,
      side: orderSide,
      type: orderType,
      product: productType,
      quantity: parseInt(quantity),
      price: orderPrice,
      triggerPrice: (orderType === 'SL' || orderType === 'SL-M') ? parseFloat(triggerPrice) : undefined,
      validity,
      isAMO,
      filledQuantity: 0,
      gtt: isGTT ? {
        condition: gttCondition,
        triggerPrice: parseFloat(gttTriggerPrice),
        limitPrice: gttCondition === 'OCO' ? parseFloat(gttLimitPrice) : undefined,
      } : undefined,
      iceberg: isIceberg ? {
        quantity: parseInt(icebergQuantity),
        legs: parseInt(icebergLegs),
      } : undefined,
    };
    
    try {
      await placeOrder(order);
      Alert.alert(
        'Order Placed',
        `${orderSide} order for ${quantity} ${stock.symbol} placed successfully`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Order Failed', error.message);
    }
  };
  
  if (!stock) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Place Order</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Stock not found</Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{stock.symbol}</Text>
          <Text style={styles.headerSubtitle}>₹{stock.lastPrice.toFixed(2)}</Text>
        </View>
        <TouchableOpacity onPress={() => setShowAdvanced(!showAdvanced)}>
          <Ionicons name="settings-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Buy/Sell Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, orderSide === 'BUY' && styles.toggleButtonBuy]}
            onPress={() => setOrderSide('BUY')}
          >
            <Text style={[styles.toggleText, orderSide === 'BUY' && styles.toggleTextActive]}>
              BUY
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, orderSide === 'SELL' && styles.toggleButtonSell]}
            onPress={() => setOrderSide('SELL')}
          >
            <Text style={[styles.toggleText, orderSide === 'SELL' && styles.toggleTextActive]}>
              SELL
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Order Type */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Order Type</Text>
          <View style={styles.chipContainer}>
            {(['MARKET', 'LIMIT', 'SL', 'SL-M'] as OrderType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.chip, orderType === type && styles.chipActive]}
                onPress={() => setOrderType(type)}
              >
                <Text style={[styles.chipText, orderType === type && styles.chipTextActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Product Type */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Product</Text>
          <View style={styles.chipContainer}>
            {(['CNC', 'MIS', 'NRML'] as ProductType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.chip, productType === type && styles.chipActive]}
                onPress={() => setProductType(type)}
              >
                <Text style={[styles.chipText, productType === type && styles.chipTextActive]}>
                  {type}
                </Text>
                {type === 'MIS' && (
                  <Text style={styles.chipSubtext}>5x</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Quantity */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Quantity</Text>
          <View style={styles.inputRow}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, parseInt(quantity) - 1).toString())}
            >
              <Ionicons name="remove" size={20} color={colors.text} />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              placeholder="Qty"
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity((parseInt(quantity) + 1).toString())}
            >
              <Ionicons name="add" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Price (for LIMIT and SL orders) */}
        {(orderType === 'LIMIT' || orderType === 'SL') && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Price</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              placeholder="Enter price"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        )}
        
        {/* Trigger Price (for SL and SL-M orders) */}
        {(orderType === 'SL' || orderType === 'SL-M') && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Trigger Price</Text>
            <TextInput
              style={styles.input}
              value={triggerPrice}
              onChangeText={setTriggerPrice}
              keyboardType="decimal-pad"
              placeholder="Enter trigger price"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        )}
        
        {/* Advanced Options */}
        {showAdvanced && (
          <View style={styles.advancedSection}>
            <Text style={styles.sectionTitle}>Advanced Options</Text>
            
            {/* Validity */}
            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Validity</Text>
              <View style={styles.chipContainer}>
                <TouchableOpacity
                  style={[styles.chipSmall, validity === 'DAY' && styles.chipActive]}
                  onPress={() => setValidity('DAY')}
                >
                  <Text style={[styles.chipText, validity === 'DAY' && styles.chipTextActive]}>
                    DAY
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.chipSmall, validity === 'IOC' && styles.chipActive]}
                  onPress={() => setValidity('IOC')}
                >
                  <Text style={[styles.chipText, validity === 'IOC' && styles.chipTextActive]}>
                    IOC
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* AMO */}
            <View style={styles.optionRow}>
              <View>
                <Text style={styles.optionLabel}>After Market Order (AMO)</Text>
                <Text style={styles.optionSubtext}>Place order after market hours</Text>
              </View>
              <Switch
                value={isAMO}
                onValueChange={setIsAMO}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.text}
              />
            </View>
            
            {/* GTT */}
            <View style={styles.optionRow}>
              <View>
                <Text style={styles.optionLabel}>Good Till Triggered (GTT)</Text>
                <Text style={styles.optionSubtext}>Trigger order at future price</Text>
              </View>
              <Switch
                value={isGTT}
                onValueChange={setIsGTT}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.text}
              />
            </View>
            
            {isGTT && (
              <View style={styles.gttContainer}>
                <View style={styles.chipContainer}>
                  <TouchableOpacity
                    style={[styles.chip, gttCondition === 'SINGLE' && styles.chipActive]}
                    onPress={() => setGttCondition('SINGLE')}
                  >
                    <Text style={[styles.chipText, gttCondition === 'SINGLE' && styles.chipTextActive]}>
                      Single
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.chip, gttCondition === 'OCO' && styles.chipActive]}
                    onPress={() => setGttCondition('OCO')}
                  >
                    <Text style={[styles.chipText, gttCondition === 'OCO' && styles.chipTextActive]}>
                      OCO
                    </Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.input}
                  value={gttTriggerPrice}
                  onChangeText={setGttTriggerPrice}
                  keyboardType="decimal-pad"
                  placeholder="GTT Trigger Price"
                  placeholderTextColor={colors.textMuted}
                />
                {gttCondition === 'OCO' && (
                  <TextInput
                    style={styles.input}
                    value={gttLimitPrice}
                    onChangeText={setGttLimitPrice}
                    keyboardType="decimal-pad"
                    placeholder="GTT Limit Price"
                    placeholderTextColor={colors.textMuted}
                  />
                )}
              </View>
            )}
            
            {/* Iceberg Order */}
            <View style={styles.optionRow}>
              <View>
                <Text style={styles.optionLabel}>Iceberg Order</Text>
                <Text style={styles.optionSubtext}>Split order into smaller parts</Text>
              </View>
              <Switch
                value={isIceberg}
                onValueChange={setIsIceberg}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.text}
              />
            </View>
            
            {isIceberg && (
              <View style={styles.icebergContainer}>
                <TextInput
                  style={styles.input}
                  value={icebergQuantity}
                  onChangeText={setIcebergQuantity}
                  keyboardType="numeric"
                  placeholder="Quantity per leg"
                  placeholderTextColor={colors.textMuted}
                />
                <TextInput
                  style={styles.input}
                  value={icebergLegs}
                  onChangeText={setIcebergLegs}
                  keyboardType="numeric"
                  placeholder="Number of legs"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            )}
          </View>
        )}
        
        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Value</Text>
            <Text style={styles.summaryValue}>₹{calculateTotal().toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Required Margin</Text>
            <Text style={styles.summaryValue}>₹{calculateMargin().toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Available Funds</Text>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>
              ₹{funds.available.toFixed(2)}
            </Text>
          </View>
          {mode === 'PAPER' && (
            <View style={styles.paperBadge}>
              <Text style={styles.paperText}>📝 Paper Trading Mode</Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Place Order Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            { backgroundColor: orderSide === 'BUY' ? colors.profit : colors.loss }
          ]}
          onPress={handlePlaceOrder}
        >
          <Text style={styles.placeOrderText}>
            {orderSide} {quantity} @ {orderType === 'MARKET' || orderType === 'SL-M' ? 'Market' : `₹${price}`}
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 16,
    backgroundColor: colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  toggleButtonBuy: {
    backgroundColor: colors.profit,
  },
  toggleButtonSell: {
    backgroundColor: colors.loss,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMuted,
  },
  toggleTextActive: {
    color: colors.text,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSmall: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  chipTextActive: {
    color: colors.text,
  },
  chipSubtext: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  advancedSection: {
    marginTop: 8,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  optionSubtext: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  gttContainer: {
    marginTop: 8,
    gap: 12,
  },
  icebergContainer: {
    marginTop: 8,
    gap: 12,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  paperBadge: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    alignItems: 'center',
  },
  paperText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  placeOrderButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeOrderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMuted,
  },
});
