import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useTradingStore } from '../../src/store/useTradingStore';
import { Ionicons } from '@expo/vector-icons';
import TopIndicesCarousel from '../../src/components/TopIndicesCarousel';
import { useTheme } from '../../src/contexts/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import FloatingTradeButton from '../../src/components/FloatingTradeButton';

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

  const handleChangeProfilePhoto = async () => {
    Alert.alert(
      'Change Profile Photo',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission needed', 'Camera permission is required to take photos');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled) {
              // TODO: Upload photo to server and update user profile
              Alert.alert('Success', 'Profile photo updated!');
            }
          },
        },
        {
          text: 'Choose from Library',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission needed', 'Photo library permission is required');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled) {
              // TODO: Upload photo to server and update user profile
              Alert.alert('Success', 'Profile photo updated!');
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

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
    
    if (newMode === 'REAL') {
      Alert.alert(
        'Switch to Live Trading',
        'To start live trading, you need to complete KYC verification and link your bank account.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Continue',
            onPress: () => {
              setMode(newMode);
              Alert.alert(
                'Live Trading Activated',
                'Please complete KYC verification to start trading.',
                [{ text: 'OK' }]
              );
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Switch to Paper Trading',
        'Switch back to paper trading mode?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Switch',
            onPress: () => setMode(newMode),
          },
        ]
      );
    }
  };

  const handleKYC = () => {
    Alert.alert(
      'KYC Verification',
      'Complete your KYC to start live trading',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start KYC', onPress: () => {
          // TODO: Navigate to KYC screen
          Alert.alert('Coming Soon', 'KYC verification will be available soon');
        }},
      ]
    );
  };

  const handleBankAccount = () => {
    Alert.alert(
      'Link Bank Account',
      'Add your bank account for seamless fund transfers',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Add Account', onPress: () => {
          // TODO: Navigate to bank account linking screen
          Alert.alert('Coming Soon', 'Bank account linking will be available soon');
        }},
      ]
    );
  };

  const handleUPI = () => {
    Alert.alert(
      'Link UPI',
      'Link your UPI ID for instant payments',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Link UPI', onPress: () => {
          // TODO: Navigate to UPI linking screen
          Alert.alert('Coming Soon', 'UPI linking will be available soon');
        }},
      ]
    );
  };

  const handlePaymentHistory = () => {
    // TODO: Navigate to payment history screen
    Alert.alert('Coming Soon', 'Payment history will be available soon');
  };

  // Get user's first name for greeting
  const getUserName = () => {
    if (user?.displayName) {
      return user.displayName.split(' ')[0];
    }
    if (user?.email) {
      // Extract name before @ and capitalize first letter
      const emailName = user.email.split('@')[0];
      // Remove numbers and special characters, capitalize first letter
      const cleanName = emailName.replace(/[0-9._-]/g, '');
      return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    }
    return 'User';
  };

  return (
    <ScrollView style={createStyles(theme).container} contentContainerStyle={createStyles(theme).contentContainer}>
      <View style={createStyles(theme).header}>
        <View style={createStyles(theme).profileSection}>
          <TouchableOpacity onPress={handleChangeProfilePhoto} activeOpacity={0.8}>
            <Animated.View style={[createStyles(theme).avatar, { transform: [{ scale: avatarScale }] }]}>
              <Text style={createStyles(theme).avatarText}>
                {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </Text>
              <View style={createStyles(theme).cameraIcon}>
                <Ionicons name="camera" size={16} color={theme.text} />
              </View>
            </Animated.View>
          </TouchableOpacity>
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

      {/* Live Trading Options - Only show when in REAL mode */}
      {mode === 'REAL' && (
        <View style={createStyles(theme).section}>
          <Text style={createStyles(theme).sectionTitle}>Live Trading Setup</Text>
          
          <TouchableOpacity
            style={createStyles(theme).menuItem}
            onPress={handleKYC}
          >
            <View style={createStyles(theme).menuItemLeft}>
              <Ionicons name="shield-checkmark" size={24} color={theme.primary} />
              <View style={createStyles(theme).menuItemText}>
                <Text style={createStyles(theme).menuItemTitle}>KYC Verification</Text>
                <Text style={createStyles(theme).menuItemSubtitle}>
                  Complete your identity verification
                </Text>
              </View>
            </View>
            <View style={createStyles(theme).statusBadge}>
              <Text style={createStyles(theme).statusText}>Pending</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={createStyles(theme).menuItem}
            onPress={handleBankAccount}
          >
            <View style={createStyles(theme).menuItemLeft}>
              <Ionicons name="business" size={24} color={theme.primary} />
              <View style={createStyles(theme).menuItemText}>
                <Text style={createStyles(theme).menuItemTitle}>Bank Account</Text>
                <Text style={createStyles(theme).menuItemSubtitle}>
                  Link your bank account
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={createStyles(theme).menuItem}
            onPress={handleUPI}
          >
            <View style={createStyles(theme).menuItemLeft}>
              <Ionicons name="flash" size={24} color={theme.primary} />
              <View style={createStyles(theme).menuItemText}>
                <Text style={createStyles(theme).menuItemTitle}>UPI Linking</Text>
                <Text style={createStyles(theme).menuItemSubtitle}>
                  Link UPI for instant payments
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={createStyles(theme).menuItem}
            onPress={handlePaymentHistory}
          >
            <View style={createStyles(theme).menuItemLeft}>
              <Ionicons name="card" size={24} color={theme.text} />
              <View style={createStyles(theme).menuItemText}>
                <Text style={createStyles(theme).menuItemTitle}>Payment History</Text>
                <Text style={createStyles(theme).menuItemSubtitle}>
                  View all transactions
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
          </TouchableOpacity>
        </View>
      )}

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
      
      <FloatingTradeButton />
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
    position: 'relative',
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
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.surface,
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: theme.warning + '20',
    borderWidth: 1,
    borderColor: theme.warning,
  },
  statusText: {
    color: theme.warning,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
