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
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/contexts/ThemeContext';
import { ipoService } from '../src/services/ipoService';
import { IPO } from '../src/types';
import { format } from 'date-fns';

export default function IPOBidScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { ipoId } = params;
  const { theme } = useTheme();
  
  const [ipo, setIpo] = useState<IPO | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState('');
  const [bidPrice, setBidPrice] = useState('');
  const [category, setCategory] = useState<'RETAIL' | 'HNI' | 'QIB'>('RETAIL');
  
  useEffect(() => {
    loadIPODetails();
  }, [ipoId]);
  
  const loadIPODetails = async () => {
    try {
      setLoading(true);
      const ipoData = await ipoService.getIPODetails(ipoId as string);
      setIpo(ipoData);
      // Set default bid price to max price
      setBidPrice(ipoData.priceRange.max.toString());
    } catch (error) {
      console.error('Error loading IPO details:', error);
      Alert.alert('Error', 'Failed to load IPO details');
      router.back();
    } finally {
      setLoading(false);
    }
  };
  
  const handlePlaceBid = () => {
    if (!ipo) return;
    
    if (!quantity || parseInt(quantity) <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }
    
    const qty = parseInt(quantity);
    if (qty % ipo.lotSize !== 0) {
      Alert.alert('Error', `Quantity must be in multiples of lot size (${ipo.lotSize})`);
      return;
    }
    
    if (!bidPrice || parseFloat(bidPrice) <= 0) {
      Alert.alert('Error', 'Please enter a valid bid price');
      return;
    }
    
    const price = parseFloat(bidPrice);
    if (price < ipo.priceRange.min || price > ipo.priceRange.max) {
      Alert.alert('Error', `Bid price must be between ₹${ipo.priceRange.min} and ₹${ipo.priceRange.max}`);
      return;
    }
    
    Alert.alert(
      'Bid Placed',
      `Your bid for ${quantity} shares of ${ipo.name} at ₹${bidPrice} has been placed successfully`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };
  
  if (loading || !ipo) {
    return (
      <View style={[createStyles(theme).container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
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
          <Text style={createStyles(theme).headerTitle}>{ipo.name}</Text>
          <Text style={createStyles(theme).headerSubtitle}>{ipo.symbol} • {ipo.exchange}</Text>
        </View>
        <View style={{ width: 28 }} />
      </View>
      
      <ScrollView style={createStyles(theme).content} showsVerticalScrollIndicator={false}>
        {/* IPO Info Card */}
        <View style={createStyles(theme).ipoInfoCard}>
          <View style={createStyles(theme).ipoInfoRow}>
            <Text style={createStyles(theme).ipoInfoLabel}>Price Range</Text>
            <Text style={createStyles(theme).ipoInfoValue}>
              ₹{ipo.priceRange.min} - ₹{ipo.priceRange.max}
            </Text>
          </View>
          <View style={createStyles(theme).ipoInfoRow}>
            <Text style={createStyles(theme).ipoInfoLabel}>Lot Size</Text>
            <Text style={createStyles(theme).ipoInfoValue}>{ipo.lotSize} shares</Text>
          </View>
          <View style={createStyles(theme).ipoInfoRow}>
            <Text style={createStyles(theme).ipoInfoLabel}>Min Investment</Text>
            <Text style={createStyles(theme).ipoInfoValue}>
              ₹{ipo.companyInfo.minInvestment.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={createStyles(theme).ipoInfoRow}>
            <Text style={createStyles(theme).ipoInfoLabel}>Close Date</Text>
            <Text style={createStyles(theme).ipoInfoValue}>
              {format(ipo.closeDate, 'dd MMM yyyy')}
            </Text>
          </View>
          {ipo.gmp && ipo.gmp.gmp > 0 && (
            <View style={[createStyles(theme).ipoInfoRow, { borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 12, marginTop: 8 }]}>
              <Text style={createStyles(theme).ipoInfoLabel}>GMP (Grey Market)</Text>
              <Text style={[createStyles(theme).ipoInfoValue, { color: theme.success }]}>
                ₹{ipo.gmp.gmp} (+{ipo.gmp.gmpPercent.toFixed(2)}%)
              </Text>
            </View>
          )}
        </View>
        
        <View style={createStyles(theme).infoCard}>
          <Ionicons name="information-circle" size={24} color={theme.primary} />
          <Text style={createStyles(theme).infoText}>
            IPO bids are subject to allotment. You will be notified once the allotment is finalized.
          </Text>
        </View>
        
        {/* Category Selection */}
        <View style={createStyles(theme).section}>
          <Text style={createStyles(theme).sectionLabel}>Investor Category</Text>
          <View style={createStyles(theme).chipContainer}>
            {(['RETAIL', 'HNI', 'QIB'] as const).map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[createStyles(theme).chip, category === cat && createStyles(theme).chipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[createStyles(theme).chipText, category === cat && createStyles(theme).chipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={createStyles(theme).helperText}>
            {category === 'RETAIL' && 'For investments up to ₹2 lakhs'}
            {category === 'HNI' && 'For investments above ₹2 lakhs'}
            {category === 'QIB' && 'Qualified Institutional Buyers'}
          </Text>
        </View>
        
        {/* Quantity */}
        <View style={createStyles(theme).section}>
          <Text style={createStyles(theme).sectionLabel}>
            Number of Shares (Lot Size: {ipo.lotSize})
          </Text>
          <View style={createStyles(theme).inputRow}>
            <TouchableOpacity
              style={createStyles(theme).quantityButton}
              onPress={() => setQuantity(Math.max(0, parseInt(quantity || '0') - ipo.lotSize).toString())}
            >
              <Ionicons name="remove" size={20} color={theme.text} />
            </TouchableOpacity>
            <TextInput
              style={createStyles(theme).input}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              placeholder={`Enter quantity (multiples of ${ipo.lotSize})`}
              placeholderTextColor={theme.textMuted}
            />
            <TouchableOpacity
              style={createStyles(theme).quantityButton}
              onPress={() => setQuantity((parseInt(quantity || '0') + ipo.lotSize).toString())}
            >
              <Ionicons name="add" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Bid Price */}
        <View style={createStyles(theme).section}>
          <Text style={createStyles(theme).sectionLabel}>Bid Price (₹)</Text>
          <TextInput
            style={createStyles(theme).input}
            value={bidPrice}
            onChangeText={setBidPrice}
            keyboardType="decimal-pad"
            placeholder={`Enter bid price (₹${ipo.priceRange.min} - ₹${ipo.priceRange.max})`}
            placeholderTextColor={theme.textMuted}
          />
          <Text style={createStyles(theme).helperText}>
            Price should be within ₹{ipo.priceRange.min} - ₹{ipo.priceRange.max}
          </Text>
        </View>
        
        {/* Summary */}
        <View style={createStyles(theme).summaryCard}>
          <Text style={createStyles(theme).summaryTitle}>Bid Summary</Text>
          <View style={createStyles(theme).summaryRow}>
            <Text style={createStyles(theme).summaryLabel}>Quantity</Text>
            <Text style={createStyles(theme).summaryValue}>{quantity || '0'} shares</Text>
          </View>
          <View style={createStyles(theme).summaryRow}>
            <Text style={createStyles(theme).summaryLabel}>Bid Price</Text>
            <Text style={createStyles(theme).summaryValue}>₹{bidPrice || '0'}</Text>
          </View>
          <View style={[createStyles(theme).summaryRow, createStyles(theme).summaryRowTotal]}>
            <Text style={createStyles(theme).summaryLabel}>Total Amount</Text>
            <Text style={[createStyles(theme).summaryValue, { color: theme.primary }]}>
              ₹{((parseInt(quantity || '0') * parseFloat(bidPrice || '0'))).toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
        
        <View style={createStyles(theme).noteCard}>
          <Text style={createStyles(theme).noteTitle}>Important Notes:</Text>
          <Text style={createStyles(theme).noteText}>• Minimum bid quantity is 1 lot ({ipo.lotSize} shares)</Text>
          <Text style={createStyles(theme).noteText}>• Funds will be blocked until allotment</Text>
          <Text style={createStyles(theme).noteText}>• Allotment is subject to availability</Text>
          <Text style={createStyles(theme).noteText}>• Refund for unallotted shares within 7 days</Text>
          {ipo.listingDate && (
            <Text style={createStyles(theme).noteText}>
              • Expected listing: {format(ipo.listingDate, 'dd MMM yyyy')}
            </Text>
          )}
        </View>
      </ScrollView>
      
      {/* Place Bid Button */}
      <View style={createStyles(theme).footer}>
        <TouchableOpacity
          style={createStyles(theme).placeBidButton}
          onPress={handlePlaceBid}
        >
          <Text style={createStyles(theme).placeBidText}>Place Bid</Text>
        </TouchableOpacity>
      </View>
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
  ipoInfoCard: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.primary,
  },
  ipoInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ipoInfoLabel: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  ipoInfoValue: {
    fontSize: 14,
    color: theme.text,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.primary,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: theme.text,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textMuted,
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
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
    fontSize: 14,
    fontWeight: '600',
    color: theme.textMuted,
  },
  chipTextActive: {
    color: theme.text,
  },
  helperText: {
    fontSize: 12,
    color: theme.textMuted,
    marginTop: 4,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: theme.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: theme.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  summaryCard: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryRowTotal: {
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 12,
    marginTop: 4,
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
  noteCard: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 8,
  },
  noteText: {
    fontSize: 12,
    color: theme.textMuted,
    marginBottom: 4,
    lineHeight: 18,
  },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: theme.surface,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  placeBidButton: {
    backgroundColor: theme.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeBidText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
  },
});
