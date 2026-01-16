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
import TopIndicesCarousel from '../../src/components/TopIndicesCarousel';
import { useTheme } from '../../src/contexts/ThemeContext';

const orderTabs: { key: OrderStatus | 'ALL' | 'GTT' | 'BASKETS'; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'OPEN', label: 'Open' },
  { key: 'EXECUTED', label: 'Executed' },
  { key: 'GTT', label: 'GTT' },
  { key: 'BASKETS', label: 'Baskets' },
];

export default function OrdersScreen() {
  const { theme } = useTheme();
  const { orders, mode, cancelOrder } = useTradingStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<OrderStatus | 'ALL' | 'GTT' | 'BASKETS'>('ALL');
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
    if (activeTab === 'GTT') {
      // Filter orders with GTT (Good Till Triggered)
      return order.gtt !== undefined;
    }
    if (activeTab === 'BASKETS') {
      // Filter basket orders (placeholder for future implementation)
      return false; // No basket orders yet
    }
    return order.status === activeTab;
  });

  const handleCancel = async (orderId: string) => {
    try {
      await cancelOrder(orderId);
    } catch (error: any) {
      console.error('Cancel error:', error);
    }
  };

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
    <View style={createStyles(theme).container}>
      <View style={createStyles(theme).header}>
        <View style={createStyles(theme).headerLeft}>
          <Animated.View style={{ transform: [{ scale: logoScale }] }}>
            <Image
              source={require('../../assets/images/Wealth.png')}
              style={createStyles(theme).logo}
              resizeMode="contain"
            />
          </Animated.View>
          <Text style={createStyles(theme).title}>Hey {getUserName()}!</Text>
        </View>
        <View style={createStyles(theme).modeBadge}>
          <Text style={createStyles(theme).modeText}>{mode === 'PAPER' ? '📝 Paper' : '💰 Live'}</Text>
        </View>
      </View>

      {/* Top Indices Carousel */}
      <TopIndicesCarousel />

      <View style={createStyles(theme).tabs}>
        {orderTabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              createStyles(theme).tab,
              activeTab === tab.key && createStyles(theme).activeTab,
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                createStyles(theme).tabText,
                activeTab === tab.key && createStyles(theme).activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredOrders.length === 0 ? (
        <View style={createStyles(theme).emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color={theme.textMuted} />
          <Text style={createStyles(theme).emptyText}>
            {activeTab === 'GTT' ? 'No GTT orders' : 
             activeTab === 'BASKETS' ? 'No basket orders' : 
             'No orders found'}
          </Text>
          <Text style={createStyles(theme).emptySubtext}>
            {activeTab === 'GTT' ? 'Your Good Till Triggered orders will appear here' :
             activeTab === 'BASKETS' ? 'Create basket orders to see them here' :
             `Your ${activeTab.toLowerCase()} orders will appear here`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OrderCard order={item} onCancel={handleCancel} />
          )}
          contentContainerStyle={createStyles(theme).listContent}
        />
      )}
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
    paddingBottom: 12,
    backgroundColor: theme.surface,
    ...(Platform.OS === 'ios' && {
      shadowColor: theme.primary,
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
    width: Platform.OS === 'ios' ? 56 : 52,
    height: Platform.OS === 'ios' ? 56 : 52,
    borderRadius: Platform.OS === 'ios' ? 14 : 12,
    ...(Platform.OS === 'ios' && {
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    }),
  },
  title: {
    fontSize: Platform.OS === 'ios' ? 24 : 22,
    fontWeight: Platform.OS === 'ios' ? '800' : 'bold',
    color: theme.text,
    ...(Platform.OS === 'ios' && {
      letterSpacing: 0.5,
      textShadowColor: theme.text + '1A',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    }),
  },
  modeBadge: {
    backgroundColor: theme.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.primary,
  },
  modeText: {
    color: theme.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.card,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: theme.primary,
  },
  tabText: {
    color: theme.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: theme.primary,
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
    color: theme.text,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    color: theme.textMuted,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
