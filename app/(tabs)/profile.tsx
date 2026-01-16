import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useTradingStore } from '../../src/store/useTradingStore';
import { Ionicons } from '@expo/vector-icons';
import TopIndicesCarousel from '../../src/components/TopIndicesCarousel';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user, logout } = useAuthStore();
  const { mode, setMode, funds, resetPaperTrading, holdings, positions } = useTradingStore();
  const logoScale = useRef(new Animated.Value(1)).current;
  const avatarScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // iOS-specific animations
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

      Animated.loop(
        Animated.sequence([
          Animated.timing(avatarScale, {
            toValue: 1.02,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(avatarScale, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleResetPaperTrading = () => {
    Alert.alert(
      'Reset Paper Trading',
      'This will clear all your paper trading data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetPaperTrading();
            Alert.alert('Success', 'Paper trading data has been reset');
          },
        },
      ]
    );
  };

  const handleModeToggle = () => {
    const newMode = mode === 'PAPER' ? 'REAL' : 'PAPER';
    Alert.alert(
      'Switch Trading Mode',
      `Switch to ${newMode === 'PAPER' ? 'Paper Trading' : 'Live Trading'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch',
          onPress: () => setMode(newMode),
        },
      ]
    );
  };

  // Calculate profile statistics
  const totalHoldings = holdings.length;
  const totalPositions = positions.length;

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
    <ScrollView style={createStyles(theme).container} contentContainerStyle={createStyles(theme).contentContainer}>
      <View style={createStyles(theme).header}>
        <View style={createStyles(theme).headerTop}>
          <View style={createStyles(theme).headerLeft}>
            <Animated.View style={{ transform: [{ scale: logoScale }] }}>
              <Image
                source={require('../../assets/images/Wealth.png')}
                style={createStyles(theme).logo}
                resizeMode="contain"
              />
            </Animated.View>
            <Text style={createStyles(theme).headerTitle}>Hey {getUserName()}!</Text>
          </View>
        </View>
        <View style={createStyles(theme).profileSection}>
          <Animated.View style={[createStyles(theme).avatar, { transform: [{ scale: avatarScale }] }]}>
            <Text style={createStyles(theme).avatarText}>
              {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </Text>
          </Animated.View>
          <View style={createStyles(theme).userInfo}>
            <Text style={createStyles(theme).userName}>
              {user?.displayName || 'User'}
            </Text>
            <Text style={createStyles(theme).userEmail}>{user?.email}</Text>
          </View>
        </View>
      </View>

      {/* Top Indices Carousel */}
      <TopIndicesCarousel />

      <View style={createStyles(theme).section}>
        <Text style={createStyles(theme).sectionTitle}>Trading</Text>
        
        <TouchableOpacity style={createStyles(theme).menuItem} onPress={handleModeToggle}>
          <View style={createStyles(theme).menuItemLeft}>
            <Ionicons name="swap-horizontal" size={24} color={theme.primary} />
            <View style={createStyles(theme).menuItemText}>
              <Text style={createStyles(theme).menuItemTitle}>Trading Mode</Text>
              <Text style={createStyles(theme).menuItemSubtitle}>
                {mode === 'PAPER' ? 'Paper Trading' : 'Live Trading'}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
        </TouchableOpacity>

        {mode === 'PAPER' && (
          <TouchableOpacity
            style={createStyles(theme).menuItem}
            onPress={handleResetPaperTrading}
          >
            <View style={createStyles(theme).menuItemLeft}>
              <Ionicons name="refresh" size={24} color={theme.loss} />
              <View style={createStyles(theme).menuItemText}>
                <Text style={createStyles(theme).menuItemTitle}>Reset Paper Trading</Text>
                <Text style={createStyles(theme).menuItemSubtitle}>
                  Clear all paper trading data
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <View style={createStyles(theme).section}>
        <Text style={createStyles(theme).sectionTitle}>Funds</Text>
        
        <View style={createStyles(theme).fundsCard}>
          <View style={createStyles(theme).fundsRow}>
            <Text style={createStyles(theme).fundsLabel}>Available</Text>
            <Text style={createStyles(theme).fundsValue}>
              ₹{funds.available.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={createStyles(theme).fundsRow}>
            <Text style={createStyles(theme).fundsLabel}>Used</Text>
            <Text style={createStyles(theme).fundsValue}>
              ₹{funds.used.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={[createStyles(theme).fundsRow, createStyles(theme).fundsRowTotal]}>
            <Text style={createStyles(theme).fundsLabel}>Total</Text>
            <Text style={[createStyles(theme).fundsValue, { color: theme.primary }]}>
              ₹{funds.total.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
      </View>

      <View style={createStyles(theme).section}>
        <Text style={createStyles(theme).sectionTitle}>Account</Text>
        
        <TouchableOpacity
          style={createStyles(theme).menuItem}
          onPress={() => router.push('/settings')}
        >
          <View style={createStyles(theme).menuItemLeft}>
            <Ionicons name="settings" size={24} color={theme.text} />
            <Text style={createStyles(theme).menuItemTitle}>Settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={createStyles(theme).menuItem}
          onPress={() => router.push('/transaction-history')}
        >
          <View style={createStyles(theme).menuItemLeft}>
            <Ionicons name="receipt" size={24} color={theme.text} />
            <Text style={createStyles(theme).menuItemTitle}>Transaction History</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={createStyles(theme).logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={20} color={theme.loss} />
        <Text style={createStyles(theme).logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  header: {
    backgroundColor: theme.surface,
    paddingTop: Platform.OS === 'ios' ? 55 : 45,
    paddingBottom: 20,
    paddingHorizontal: 16,
    ...(Platform.OS === 'ios' && {
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    }),
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
  headerTitle: {
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
  settingsButton: {
    padding: 6,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: Platform.OS === 'ios' ? 64 : 60,
    height: Platform.OS === 'ios' ? 64 : 60,
    borderRadius: Platform.OS === 'ios' ? 32 : 30,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    ...(Platform.OS === 'ios' && {
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      borderWidth: 2,
      borderColor: theme.primary + '4D',
    }),
  },
  avatarText: {
    color: theme.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textMuted,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    marginLeft: 16,
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
    marginLeft: 16,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  fundsCard: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  fundsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  fundsRowTotal: {
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 12,
    marginTop: 4,
  },
  fundsLabel: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  fundsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.card,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.loss,
  },
  logoutText: {
    color: theme.loss,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
