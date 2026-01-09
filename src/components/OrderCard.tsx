import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Order } from '../types';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

interface OrderCardProps {
  order: Order;
  onCancel: (orderId: string) => void;
}

export default function OrderCard({ order, onCancel }: OrderCardProps) {
  const isBuy = order.side === 'BUY';
  const sideColor = isBuy ? '#00C853' : '#FF5252';
  const statusColors: Record<string, string> = {
    OPEN: '#2962FF',
    EXECUTED: '#00C853',
    CANCELLED: '#FF9800',
    REJECTED: '#FF5252',
    TRIGGER_PENDING: '#FFC107',
  };

  const canCancel = order.status === 'OPEN' || order.status === 'TRIGGER_PENDING';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.symbolContainer}>
          <Text style={styles.symbol}>{order.symbol}</Text>
          <Text style={styles.exchange}>{order.exchange}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[order.status] }]}>
          <Text style={styles.statusText}>{order.status.replace('_', ' ')}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.row}>
          <Text style={styles.label}>Side:</Text>
          <Text style={[styles.value, { color: sideColor }]}>
            {order.side}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Type:</Text>
          <Text style={styles.value}>{order.type}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Product:</Text>
          <Text style={styles.value}>{order.product}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Quantity:</Text>
          <Text style={styles.value}>{order.quantity}</Text>
        </View>
        {order.price && (
          <View style={styles.row}>
            <Text style={styles.label}>Price:</Text>
            <Text style={styles.value}>₹{order.price.toFixed(2)}</Text>
          </View>
        )}
        {order.averagePrice && (
          <View style={styles.row}>
            <Text style={styles.label}>Avg Price:</Text>
            <Text style={styles.value}>₹{order.averagePrice.toFixed(2)}</Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={styles.label}>Filled:</Text>
          <Text style={styles.value}>
            {order.filledQuantity} / {order.quantity}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Placed:</Text>
          <Text style={styles.value}>
            {format(new Date(order.placedAt), 'dd MMM, HH:mm')}
          </Text>
        </View>
      </View>

      {canCancel && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => onCancel(order.id)}
        >
          <Ionicons name="close-circle" size={20} color="#FF5252" />
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  symbolContainer: {
    flex: 1,
  },
  symbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  exchange: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#999',
  },
  value: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 12,
  },
  cancelText: {
    color: '#FF5252',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

