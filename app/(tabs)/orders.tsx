import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Platform,
  Animated,
} from 'react-native';
import { useTradingStore } from '../../src/store/useTradingStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import { Order, OrderStatus } from '../../src/types';
import { Ionicons } from '@expo/vector-icons';
import OrderCard from '../../src/components/OrderCard';
import UniversalCarousel from '../../src/components/UniversalCarousel';
import TopIndicesCarousel from '../../src/components/TopIndicesCarousel';

// Theme colors
const colors = {
  primary: '#00D4FF', // Blue Neon
  profit: '#00C853',
  loss: '#FF5252',
  warning: '#FFC107',
  background: '#000000',
  backgroundSecondary: '#0A0A0A',
  card: '#1A1A1A',
  border: '#2A2A2A',
  text: '#FFFFFF',
  textMuted: '#666666',
};

const orderTabs: { key: OrderStatus | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'OPEN', label: 'Open' },
  { key: 'EXECUTED', label: 'Executed' },
  { key: 'CANCELLED', label: 'Cancelled' },
  { key: 'REJECTED', label: 'Rejected' },
];

export default function OrdersScreen() {
  const { orders, mode, cancelOrder } = useTradingStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<OrderStatus | 'ALL'>('ALL');
  const logoScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // iOS-specific logo animation
    if (Platform.OS === 'ios') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(logoScale, {
            toValue: 1.05,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(logoScale, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'ALL') return true;
    return order.status === activeTab;
  });

  const handleCancel = async (orderId: string) => {
    try {
      await cancelOrder(orderId);
    } catch (error: any) {
      console.error('Cancel error:', error);
    }
  };

  // Calculate order statistics
  const openOrders = orders.filter(order => order.status === 'OPEN').length;
  const executedOrders = orders.filter(order => order.status === 'EXECUTED').length;
  const cancelledOrders = orders.filter(order => order.status === 'CANCELLED').length;
  const totalOrderValue = orders
    .filter(order => order.status === 'EXECUTED')
    .reduce((sum, order) => sum + (order.quantity * order.price), 0);

  const carouselItems = [
    {
      title: 'Executed',
      value: executedOrders.toString(),
      color: '#00C853',
      subtitle: 'Completed',
    },
    {
      title: 'Cancelled',
      value: cancelledOrders.toString(),
      color: '#FF5252',
      subtitle: 'Rejected',
    },
    {
      title: 'Order Value',
      value: `₹${totalOrderValue.toLocaleString('en-IN')}`,
      subtitle: 'Executed',
    },
    {
      title: 'Success Rate',
      value: `${orders.length > 0 ? Math.round((executedOrders / orders.length) * 100) : 0}%`,
      color: colors.primary,
      subtitle: 'Completion',
    },
  ];

  // Get user's first name for greeting
  const getUserName = () => {
    if (user?.displayName) {
      return user.displayName.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Animated.View style={{ transform: [{ scale: logoScale }] }}>
            <Image
              source={require('../../assets/images/Wealth.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
          <Text style={styles.title}>Hey {getUserName()}!</Text>
        </View>
        <View style={styles.modeBadge}>
          <Text style={styles.modeText}>{mode === 'PAPER' ? '📝 Paper' : '💰 Live'}</Text>
        </View>
      </View>

      {/* Top Indices Carousel */}
      <TopIndicesCarousel />

      {/* Universal Carousel */}
      <UniversalCarousel items={carouselItems} />

      <View style={styles.tabs}>
        {orderTabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color="#666" />
          <Text style={styles.emptyText}>No orders found</Text>
          <Text style={styles.emptySubtext}>Your {activeTab.toLowerCase()} orders will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OrderCard order={item} onCancel={handleCancel} />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
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
    paddingBottom: 12,
    backgroundColor: colors.backgroundSecondary,
    ...(Platform.OS === 'ios' && {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    }),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: Platform.OS === 'ios' ? 48 : 44,
    height: Platform.OS === 'ios' ? 48 : 44,
    borderRadius: Platform.OS === 'ios' ? 12 : 10,
    ...(Platform.OS === 'ios' && {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    }),
  },
  title: {
    fontSize: Platform.OS === 'ios' ? 24 : 22,
    fontWeight: Platform.OS === 'ios' ? '800' : 'bold',
    color: colors.text,
    ...(Platform.OS === 'ios' && {
      letterSpacing: 0.5,
      textShadowColor: 'rgba(255, 255, 255, 0.1)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    }),
  },
  modeBadge: {
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  modeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.card,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeTab: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.text,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

