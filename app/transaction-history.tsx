import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTradingStore } from '../src/store/useTradingStore';
import { useTheme } from '../src/contexts/ThemeContext';

export default function TransactionHistoryScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { orders } = useTradingStore();
  const [filter, setFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');

  const styles = createStyles(theme);

  // Filter orders
  const filteredOrders = orders.filter(order => {
    if (filter === 'ALL') return true;
    return order.side === filter;
  });

  // Sort by date (newest first)
  const sortedOrders = [...filteredOrders].sort((a, b) => 
    new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()
  );

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EXECUTED':
        return theme.success;
      case 'CANCELLED':
      case 'REJECTED':
        return theme.error;
      case 'OPEN':
      case 'TRIGGER_PENDING':
        return theme.warning;
      default:
        return theme.textMuted;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Transaction History</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Filter Tabs */}
      <View style={[styles.filterContainer, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        {(['ALL', 'BUY', 'SELL'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterTab,
              filter === f && { borderBottomColor: theme.primary, borderBottomWidth: 2 }
            ]}
            onPress={() => setFilter(f)}
          >
            <Text style={[
              styles.filterText,
              { color: filter === f ? theme.primary : theme.textMuted }
            ]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {sortedOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color={theme.textMuted} />
            <Text style={[styles.emptyText, { color: theme.text }]}>No Transactions</Text>
            <Text style={[styles.emptySubtext, { color: theme.textMuted }]}>
              Your transaction history will appear here
            </Text>
          </View>
        ) : (
          sortedOrders.map((order) => (
            <View key={order.id} style={[styles.transactionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.transactionHeader}>
                <View style={styles.transactionLeft}>
                  <View style={[
                    styles.sideIndicator,
                    { backgroundColor: order.side === 'BUY' ? theme.success + '20' : theme.error + '20' }
                  ]}>
                    <Text style={[
                      styles.sideText,
                      { color: order.side === 'BUY' ? theme.success : theme.error }
                    ]}>
                      {order.side}
                    </Text>
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={[styles.symbol, { color: theme.text }]}>{order.symbol}</Text>
                    <Text style={[styles.exchange, { color: theme.textMuted }]}>{order.exchange}</Text>
                  </View>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(order.status) + '20' }
                ]}>
                  <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                    {order.status}
                  </Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.divider }]} />

              <View style={styles.transactionDetails}>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Quantity</Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {order.filledQuantity || 0} / {order.quantity}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Price</Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    ₹{(order.price || order.averagePrice || 0).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Type</Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {order.type} • {order.product}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Date</Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {formatDate(order.placedAt)}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 55 : 45,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  transactionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sideIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 12,
  },
  sideText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  transactionInfo: {
    flex: 1,
  },
  symbol: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  exchange: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  transactionDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
});
