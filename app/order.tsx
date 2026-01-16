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
import { useTheme } from '../src/contexts/ThemeContext';
import FloatingTradeButton from '../src/components/FloatingTradeButton';

type GTTCondition = 'SINGLE' | 'OCO';

export default function OrderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const symbol = params.symbol as string;
  const { theme } = useTheme();
  
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
      <View style={createStyles(theme).container}>
        <View style={createStyles(theme).header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={28} color={theme.text} />
          </TouchableOpacity>
          <Text style={createStyles(theme).headerTitle}>Place Order</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={createStyles(theme).emptyContainer}>
          <Text style={createStyles(theme).emptyText}>Stock not found</Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={createStyles(theme).container}>
      <View style={createStyles(theme).header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={theme.text} />
        </TouchableOpacity>
        <View style={createStyles(theme).headerCenter}>
          <Text style={createStyles(theme).headerTitle}>{stock.symbol}</Text>
          <Text style={createStyles(theme).headerSubtitle}>₹{stock.lastPrice.toFixed(2)}</Text>
        </View>
        <TouchableOpacity onPress={() => setShowAdvanced(!showAdvanced)}>
          <Ionicons name="settings-outline" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={createStyles(theme).content} showsVerticalScrollIndicator={false}>
        {/* Buy/Sell Toggle */}
        <View style={createStyles(theme).toggleContainer}>
          <TouchableOpacity
            style={[createStyles(theme).toggleButton, orderSide === 'BUY' && createStyles(theme).toggleButtonBuy]}
            onPress={() => setOrderSide('BUY')}
          >
            <Text style={[createStyles(theme).toggleText, orderSide === 'BUY' && createStyles(theme).toggleTextActive]}>
              BUY
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[createStyles(theme).toggleButton, orderSide === 'SELL' && createStyles(theme).toggleButtonSell]}
            onPress={() => setOrderSide('SELL')}
          >
            <Text style={[createStyles(theme).toggleText, orderSide === 'SELL' && createStyles(theme).toggleTextActive]}>
              SELL
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Order Type */}
        <View style={createStyles(theme).section}>
          <Text style={createStyles(theme).sectionLabel}>Order Type</Text>
          <View style={createStyles(theme).chipContainer}>
            {(['MARKET', 'LIMIT', 'SL', 'SL-M'] as OrderType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[createStyles(theme).chip, orderType === type && createStyles(theme).chipActive]}
                onPress={() => setOrderType(type)}
              >
                <Text style={[createStyles(theme).chipText, orderType === type && createStyles(theme).chipTextActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Product Type */}
        <View style={createStyles(theme).section}>
          <Text style={createStyles(theme).sectionLabel}>Product</Text>
          <View style={createStyles(theme).chipContainer}>
            {(['CNC', 'MIS', 'NRML'] as ProductType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[createStyles(theme).chip, productType === type && createStyles(theme).chipActive]}
                onPress={() => setProductType(type)}
              >
                <Text style={[createStyles(theme).chipText, productType === type && createStyles(theme).chipTextActive]}>
                  {type}
                </Text>
                {type === 'MIS' && (
                  <Text style={createStyles(theme).chipSubtext}>5x</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Quantity */}
        <View style={createStyles(theme).section}>
          <Text style={createStyles(theme).sectionLabel}>Quantity</Text>
          <View style={createStyles(theme).inputRow}>
            <TouchableOpacity
              style={createStyles(theme).quantityButton}
              onPress={() => setQuantity(Math.max(1, parseInt(quantity) - 1).toString())}
            >
              <Ionicons name="remove" size={20} color={theme.text} />
            </TouchableOpacity>
            <TextInput
              style={createStyles(theme).input}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              placeholder="Qty"
              placeholderTextColor={theme.textMuted}
            />
            <TouchableOpacity
              style={createStyles(theme).quantityButton}
              onPress={() => setQuantity((parseInt(quantity) + 1).toString())}
            >
              <Ionicons name="add" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Price (for LIMIT and SL orders) */}
        {(orderType === 'LIMIT' || orderType === 'SL') && (
          <View style={createStyles(theme).section}>
            <Text style={createStyles(theme).sectionLabel}>Price</Text>
            <TextInput
              style={createStyles(theme).input}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              placeholder="Enter price"
              placeholderTextColor={theme.textMuted}
            />
          </View>
        )}
        
        {/* Trigger Price (for SL and SL-M orders) */}
        {(orderType === 'SL' || orderType === 'SL-M') && (
          <View style={createStyles(theme).section}>
            <Text style={createStyles(theme).sectionLabel}>Trigger Price</Text>
            <TextInput
              style={createStyles(theme).input}
              value={triggerPrice}
              onChangeText={setTriggerPrice}
              keyboardType="decimal-pad"
              placeholder="Enter trigger price"
              placeholderTextColor={theme.textMuted}
            />
          </View>
        )}
        
        {/* Advanced Options */}
        {showAdvanced && (
          <View style={createStyles(theme).advancedSection}>
            <Text style={createStyles(theme).sectionTitle}>Advanced Options</Text>
            
            {/* Validity */}
            <View style={createStyles(theme).optionRow}>
              <Text style={createStyles(theme).optionLabel}>Validity</Text>
              <View style={createStyles(theme).chipContainer}>
                <TouchableOpacity
                  style={[createStyles(theme).chipSmall, validity === 'DAY' && createStyles(theme).chipActive]}
                  onPress={() => setValidity('DAY')}
                >
                  <Text style={[createStyles(theme).chipText, validity === 'DAY' && createStyles(theme).chipTextActive]}>
                    DAY
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[createStyles(theme).chipSmall, validity === 'IOC' && createStyles(theme).chipActive]}
                  onPress={() => setValidity('IOC')}
                >
                  <Text style={[createStyles(theme).chipText, validity === 'IOC' && createStyles(theme).chipTextActive]}>
                    IOC
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* AMO */}
            <View style={createStyles(theme).optionRow}>
              <View>
                <Text style={createStyles(theme).optionLabel}>After Market Order (AMO)</Text>
                <Text style={createStyles(theme).optionSubtext}>Place order after market hours</Text>
              </View>
              <Switch
                value={isAMO}
                onValueChange={setIsAMO}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={theme.text}
              />
            </View>
            
            {/* GTT */}
            <View style={createStyles(theme).optionRow}>
              <View>
                <Text style={createStyles(theme).optionLabel}>Good Till Triggered (GTT)</Text>
                <Text style={createStyles(theme).optionSubtext}>Trigger order at future price</Text>
              </View>
              <Switch
                value={isGTT}
                onValueChange={setIsGTT}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={theme.text}
              />
            </View>
            
            {isGTT && (
              <View style={createStyles(theme).gttContainer}>
                <View style={createStyles(theme).chipContainer}>
                  <TouchableOpacity
                    style={[createStyles(theme).chip, gttCondition === 'SINGLE' && createStyles(theme).chipActive]}
                    onPress={() => setGttCondition('SINGLE')}
                  >
                    <Text style={[createStyles(theme).chipText, gttCondition === 'SINGLE' && createStyles(theme).chipTextActive]}>
                      Single
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[createStyles(theme).chip, gttCondition === 'OCO' && createStyles(theme).chipActive]}
                    onPress={() => setGttCondition('OCO')}
                  >
                    <Text style={[createStyles(theme).chipText, gttCondition === 'OCO' && createStyles(theme).chipTextActive]}>
                      OCO
                    </Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={createStyles(theme).input}
                  value={gttTriggerPrice}
                  onChangeText={setGttTriggerPrice}
                  keyboardType="decimal-pad"
                  placeholder="GTT Trigger Price"
                  placeholderTextColor={theme.textMuted}
                />
                {gttCondition === 'OCO' && (
                  <TextInput
                    style={createStyles(theme).input}
                    value={gttLimitPrice}
                    onChangeText={setGttLimitPrice}
                    keyboardType="decimal-pad"
                    placeholder="GTT Limit Price"
                    placeholderTextColor={theme.textMuted}
                  />
                )}
              </View>
            )}
            
            {/* Iceberg Order */}
            <View style={createStyles(theme).optionRow}>
              <View>
                <Text style={createStyles(theme).optionLabel}>Iceberg Order</Text>
                <Text style={createStyles(theme).optionSubtext}>Split order into smaller parts</Text>
              </View>
              <Switch
                value={isIceberg}
                onValueChange={setIsIceberg}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={theme.text}
              />
            </View>
            
            {isIceberg && (
              <View style={createStyles(theme).icebergContainer}>
                <TextInput
                  style={createStyles(theme).input}
                  value={icebergQuantity}
                  onChangeText={setIcebergQuantity}
                  keyboardType="numeric"
                  placeholder="Quantity per leg"
                  placeholderTextColor={theme.textMuted}
                />
                <TextInput
                  style={createStyles(theme).input}
                  value={icebergLegs}
                  onChangeText={setIcebergLegs}
                  keyboardType="numeric"
                  placeholder="Number of legs"
                  placeholderTextColor={theme.textMuted}
                />
              </View>
            )}
          </View>
        )}
        
        {/* Order Summary */}
        <View style={createStyles(theme).summaryCard}>
          <View style={createStyles(theme).summaryRow}>
            <Text style={createStyles(theme).summaryLabel}>Total Value</Text>
            <Text style={createStyles(theme).summaryValue}>₹{calculateTotal().toFixed(2)}</Text>
          </View>
          <View style={createStyles(theme).summaryRow}>
            <Text style={createStyles(theme).summaryLabel}>Required Margin</Text>
            <Text style={createStyles(theme).summaryValue}>₹{calculateMargin().toFixed(2)}</Text>
          </View>
          <View style={createStyles(theme).summaryRow}>
            <Text style={createStyles(theme).summaryLabel}>Available Funds</Text>
            <Text style={[createStyles(theme).summaryValue, { color: theme.primary }]}>
              ₹{funds.available.toFixed(2)}
            </Text>
          </View>
          {mode === 'PAPER' && (
            <View style={createStyles(theme).paperBadge}>
              <Text style={createStyles(theme).paperText}>📝 Paper Trading Mode</Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Place Order Button */}
      <View style={createStyles(theme).footer}>
        <TouchableOpacity
          style={[
            createStyles(theme).placeOrderButton,
            { backgroundColor: orderSide === 'BUY' ? theme.profit : theme.loss }
          ]}
          onPress={handlePlaceOrder}
        >
          <Text style={createStyles(theme).placeOrderText}>
            {orderSide} {quantity} @ {orderType === 'MARKET' || orderType === 'SL-M' ? 'Market' : `₹${price}`}
          </Text>
        </TouchableOpacity>
      </View>
      
      <FloatingTradeButton />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 55 : 45,
    paddingBottom: 16,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.textMuted,
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
    borderColor: theme.border,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: theme.card,
  },
  toggleButtonBuy: {
    backgroundColor: theme.profit,
  },
  toggleButtonSell: {
    backgroundColor: theme.loss,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textMuted,
  },
  toggleTextActive: {
    color: theme.text,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textMuted,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
  },
  chipSmall: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
  },
  chipActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textMuted,
  },
  chipTextActive: {
    color: theme.text,
  },
  chipSubtext: {
    fontSize: 10,
    color: theme.textMuted,
    marginTop: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: theme.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: theme.border,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: theme.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  advancedSection: {
    marginTop: 8,
    padding: 16,
    backgroundColor: theme.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
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
    color: theme.text,
  },
  optionSubtext: {
    fontSize: 12,
    color: theme.textMuted,
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
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.textMuted,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
  },
  paperBadge: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.surface,
    borderRadius: 8,
    alignItems: 'center',
  },
  paperText: {
    fontSize: 12,
    color: theme.primary,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: theme.surface,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  placeOrderButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeOrderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.textMuted,
  },
});
