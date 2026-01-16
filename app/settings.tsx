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
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../src/store/useAuthStore';
import { useTradingStore } from '../src/store/useTradingStore';

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

export default function SettingsScreen() {
  const router = useRouter();
  const { user, updateUser, logout } = useAuthStore();
  const { mode, setMode, resetPaperTrading } = useTradingStore();
  
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [newsAlerts, setNewsAlerts] = useState(true);

  const handleSaveName = () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    if (user) {
      updateUser({ ...user, displayName: displayName.trim() });
      setIsEditingName(false);
      Alert.alert('Success', 'Name updated successfully');
    }
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          
          <View style={styles.card}>
            <View style={styles.profileRow}>
              <Text style={styles.label}>Display Name</Text>
              {isEditingName ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.input}
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="Enter your name"
                    placeholderTextColor={colors.textMuted}
                    autoFocus
                  />
                  <TouchableOpacity onPress={handleSaveName} style={styles.saveButton}>
                    <Ionicons name="checkmark" size={20} color={colors.profit} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setDisplayName(user?.displayName || '');
                      setIsEditingName(false);
                    }}
                    style={styles.cancelButton}
                  >
                    <Ionicons name="close" size={20} color={colors.loss} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.valueContainer}>
                  <Text style={styles.value}>{user?.displayName || 'User'}</Text>
                  <TouchableOpacity onPress={() => setIsEditingName(true)}>
                    <Ionicons name="pencil" size={18} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.profileRow}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{user?.email}</Text>
            </View>
          </View>
        </View>

        {/* Trading Section */}
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
            <TouchableOpacity style={styles.menuItem} onPress={handleResetPaperTrading}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="refresh" size={24} color={colors.loss} />
                <View style={styles.menuItemText}>
                  <Text style={styles.menuItemTitle}>Reset Paper Trading</Text>
                  <Text style={styles.menuItemSubtitle}>Clear all paper trading data</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="notifications" size={22} color={colors.primary} />
                <Text style={styles.settingLabel}>Push Notifications</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.text}
              />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="trending-up" size={22} color={colors.profit} />
                <Text style={styles.settingLabel}>Price Alerts</Text>
              </View>
              <Switch
                value={priceAlerts}
                onValueChange={setPriceAlerts}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.text}
              />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="newspaper" size={22} color={colors.primary} />
                <Text style={styles.settingLabel}>News Alerts</Text>
              </View>
              <Switch
                value={newsAlerts}
                onValueChange={setNewsAlerts}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.text}
              />
            </View>
          </View>
        </View>

        {/* App Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="information-circle" size={24} color={colors.text} />
              <Text style={styles.menuItemTitle}>About</Text>
            </View>
            <View style={styles.versionContainer}>
              <Text style={styles.versionText}>v1.0.0</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="document-text" size={24} color={colors.text} />
              <Text style={styles.menuItemTitle}>Terms & Conditions</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="shield-checkmark" size={24} color={colors.text} />
              <Text style={styles.menuItemTitle}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={24} color={colors.loss} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileRow: {
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  saveButton: {
    padding: 8,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.profit,
  },
  cancelButton: {
    padding: 8,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.loss,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  versionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  versionText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 32,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.loss,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.loss,
  },
});
