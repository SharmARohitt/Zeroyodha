import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useTradingStore } from '../../src/store/useTradingStore';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { mode, setMode, funds, resetPaperTrading } = useTradingStore();

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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.displayName || 'User'}
            </Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trading</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={handleModeToggle}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="swap-horizontal" size={24} color="#2962FF" />
            <View style={styles.menuItemText}>
              <Text style={styles.menuItemTitle}>Trading Mode</Text>
              <Text style={styles.menuItemSubtitle}>
                {mode === 'PAPER' ? 'Paper Trading' : 'Live Trading'}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        {mode === 'PAPER' && (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleResetPaperTrading}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="refresh" size={24} color="#FF5252" />
              <View style={styles.menuItemText}>
                <Text style={styles.menuItemTitle}>Reset Paper Trading</Text>
                <Text style={styles.menuItemSubtitle}>
                  Clear all paper trading data
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
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
            <Text style={styles.fundsValue}>
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
            <Ionicons name="settings" size={24} color="#FFFFFF" />
            <Text style={styles.menuItemTitle}>Settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/transaction-history')}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons name="receipt" size={24} color="#FFFFFF" />
            <Text style={styles.menuItemTitle}>Transaction History</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={20} color="#FF5252" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    backgroundColor: '#0A0A0A',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2962FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#999',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
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
    color: '#FFFFFF',
    marginBottom: 4,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  fundsCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
  },
  fundsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  fundsRowTotal: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 12,
    marginTop: 4,
  },
  fundsLabel: {
    fontSize: 14,
    color: '#999',
  },
  fundsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 32,
    borderRadius: 12,
  },
  logoutText: {
    color: '#FF5252',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

