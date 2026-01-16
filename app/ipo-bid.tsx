import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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

export default function IPOBidScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { ipoName, symbol } = params;
  
  const [quantity, setQuantity] = useState('');
  const [bidPrice, setBidPrice] = useState('');
  const [category, setCategory] = useState<'RETAIL' | 'HNI' | 'QIB'>('RETAIL');
  
  const handlePlaceBid = () => {
    if (!quantity || parseInt(quantity) <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }
    
    if (!bidPrice || parseFloat(bidPrice) <= 0) {
      Alert.alert('Error', 'Please enter a valid bid price');
      return;
    }
    
    Alert.alert(
      'Bid Placed',
      `Your bid for ${quantity} shares of ${ipoName} at ₹${bidPrice} has been placed successfully`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{ipoName}</Text>
          <Text style={styles.headerSubtitle}>{symbol}</Text>
        </View>
        <View style={{ width: 28 }} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={colors.primary} />
          <Text style={styles.infoText}>
            IPO bids are subject to allotment. You will be notified once the allotment is finalized.
          </Text>
        </View>
        
        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Investor Category</Text>
          <View style={styles.chipContainer}>
            {(['RETAIL', 'HNI', 'QIB'] as const).map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, category === cat && styles.chipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.helperText}>
            {category === 'RETAIL' && 'For investments up to ₹2 lakhs'}
            {category === 'HNI' && 'For investments above ₹2 lakhs'}
            {category === 'QIB' && 'Qualified Institutional Buyers'}
          </Text>
        </View>
        
        {/* Quantity */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Number of Shares (Lot Size: 100)</Text>
          <View style={styles.inputRow}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(0, parseInt(quantity || '0') - 100).toString())}
            >
              <Ionicons name="remove" size={20} color={colors.text} />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              placeholder="Enter quantity"
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity((parseInt(quantity || '0') + 100).toString())}
            >
              <Ionicons name="add" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Bid Price */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Bid Price (₹)</Text>
          <TextInput
            style={styles.input}
            value={bidPrice}
            onChangeText={setBidPrice}
            keyboardType="decimal-pad"
            placeholder="Enter bid price"
            placeholderTextColor={colors.textMuted}
          />
          <Text style={styles.helperText}>
            Price should be within the IPO price band
          </Text>
        </View>
        
        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Bid Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Quantity</Text>
            <Text style={styles.summaryValue}>{quantity || '0'} shares</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Bid Price</Text>
            <Text style={styles.summaryValue}>₹{bidPrice || '0'}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryRowTotal]}>
            <Text style={styles.summaryLabel}>Total Amount</Text>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>
              ₹{((parseInt(quantity || '0') * parseFloat(bidPrice || '0'))).toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
        
        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Important Notes:</Text>
          <Text style={styles.noteText}>• Minimum bid quantity is 1 lot (100 shares)</Text>
          <Text style={styles.noteText}>• Funds will be blocked until allotment</Text>
          <Text style={styles.noteText}>• Allotment is subject to availability</Text>
          <Text style={styles.noteText}>• Refund for unallotted shares within 7 days</Text>
        </View>
      </ScrollView>
      
      {/* Place Bid Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.placeBidButton}
          onPress={handlePlaceBid}
        >
          <Text style={styles.placeBidText}>Place Bid</Text>
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
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
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
  helperText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
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
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryRowTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 4,
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
  noteCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  noteText: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
    lineHeight: 18,
  },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  placeBidButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeBidText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
});
