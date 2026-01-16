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

// Theme colors
const colors = {
  primary: '#00D4FF', // Blue Neon
  profit: '#00C853',
  loss: '#FF5252',
  background: '#000000',
  backgroundSecondary: '#0A0A0A',
  card: '#1A1A1A',
  border: '#2A2A2A',
  text: '#FFFFFF',
  textMuted: '#666666',
  textSecondary: '#999999',
};

export default function ProfileScreen() {
  const router = useRouter();
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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Animated.View style={{ transform: [{ scale: logoScale }] }}>
              <Image
                source={require('../../assets/images/Wealth.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </Animated.View>
            <Text style={styles.headerTitle}>Hey {getUserName()}!</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.profileSection}>
          <Animated.View style={[styles.avatar, { transform: [{ scale: avatarScale }] }]}>
            <Text style={styles.avatarText}>
              {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </Text>
          </Animated.View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.displayName || 'User'}
            </Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>
      </View>

      {/* Top Indices Carousel */}
      <TopIndicesCarousel />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trading</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={handleModeToggle}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="swap-horizontal" size={24} color={colors.primary} />
            <View style={styles.menuItemText}>
              <Text style={styles.menuItemTitle}>Trading Mode</Text>
              <Text style={styles.menuItemSubtitle}>
                {mode === 'PAPER' ? 'Paper Trading' : 'Live Trading'}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        {mode === 'PAPER' && (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleResetPaperTrading}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="refresh" size={24} color={colors.loss} />
              <View style={styles.menuItemText}>
                <Text style={styles.menuItemTitle}>Reset Paper Trading</Text>
                <Text style={styles.menuItemSubtitle}>
                  Clear all paper trading data
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Funds</Text>
        
        <View style={styles.fundsCard}>
          <View style={styles.fundsRow}>
            <Text style={styles.fundsLabel}>Available</Text>
            <Text style={styles.fundsValue}>
              ₹{funds.available.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.fundsRow}>
            <Text style={styles.fundsLabel}>Used</Text>
            <Text style={styles.fundsValue}>
              ₹{funds.used.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={[styles.fundsRow, styles.fundsRowTotal]}>
            <Text style={styles.fundsLabel}>Total</Text>
            <Text style={[styles.fundsValue, { color: colors.primary }]}>
              ₹{funds.total.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/settings')}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons name="settings" size={24} color={colors.text} />
            <Text style={styles.menuItemTitle}>Settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/transaction-history')}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons name="receipt" size={24} color={colors.text} />
            <Text style={styles.menuItemTitle}>Transaction History</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={20} color={colors.loss} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  header: {
    backgroundColor: colors.backgroundSecondary,
    paddingTop: Platform.OS === 'ios' ? 55 : 45,
    paddingBottom: 20,
    paddingHorizontal: 16,
    ...(Platform.OS === 'ios' && {
      shadowColor: colors.primary,
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
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    }),
  },
  headerTitle: {
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
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    ...(Platform.OS === 'ios' && {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      borderWidth: 2,
      borderColor: 'rgba(0, 212, 255, 0.3)',
    }),
  },
  avatarText: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.text,
    marginBottom: 2,
    marginLeft: 16,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  fundsCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fundsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  fundsRowTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 4,
  },
  fundsLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  fundsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.loss,
  },
  logoutText: {
    color: colors.loss,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

