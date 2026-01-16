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
import { useTheme } from '../src/contexts/ThemeContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, updateUser, logout } = useAuthStore();
  const { mode, setMode, resetPaperTrading } = useTradingStore();
  const { theme, themeMode, setThemeMode } = useTheme();
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.displayName || 'User');
  const [pushNotifications, setPushNotifications] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [newsAlerts, setNewsAlerts] = useState(true);

  const styles = createStyles(theme);

  const handleSaveName = () => {
    if (editedName.trim() && user) {
      updateUser({ ...user, displayName: editedName.trim() });
      setIsEditingName(false);
      Alert.alert('Success', 'Name updated successfully');
    }
  };

  const handleToggleTradingMode = () => {
    const newMode = mode === 'PAPER' ? 'REAL' : 'PAPER';
    Alert.alert(
      'Change Trading Mode',
      `Switch to ${newMode} trading mode?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            setMode(newMode);
            Alert.alert('Success', `Switched to ${newMode} trading mode`);
          },
        },
      ]
    );
  };

  const handleResetPaperTrading = () => {
    Alert.alert(
      'Reset Paper Trading',
      'This will reset all your paper trading data including positions, orders, and funds. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetPaperTrading();
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
        onPress: () => {
          logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const renderThemeOption = (label: string, value: 'light' | 'dark' | 'auto', icon: string) => (
    <TouchableOpacity
      style={[
        styles.themeOption,
        { 
          backgroundColor: themeMode === value ? theme.primary + '20' : theme.card,
          borderColor: themeMode === value ? theme.primary : theme.border,
        }
      ]}
      onPress={() => setThemeMode(value)}
    >
      <Ionicons 
        name={icon as any} 
        size={24} 
        color={themeMode === value ? theme.primary : theme.textSecondary} 
      />
      <Text style={[
        styles.themeOptionText,
        { color: themeMode === value ? theme.primary : theme.text }
      ]}>
        {label}
      </Text>
      {themeMode === value && (
        <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Profile</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="person-outline" size={20} color={theme.textSecondary} />
              <Text style={[styles.settingLabel, { color: theme.text }]}>Name</Text>
            </View>
            {isEditingName ? (
              <View style={styles.nameEditContainer}>
                <TextInput
                  style={[styles.nameInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
                  value={editedName}
                  onChangeText={setEditedName}
                  autoFocus
                  placeholderTextColor={theme.textMuted}
                />
                <TouchableOpacity onPress={handleSaveName} style={[styles.saveButton, { backgroundColor: theme.primary }]}>
                  <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => setIsEditingName(true)} style={styles.nameDisplay}>
                <Text style={[styles.settingValue, { color: theme.textSecondary }]}>{user?.displayName || 'User'}</Text>
                <Ionicons name="pencil" size={16} color={theme.primary} />
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="mail-outline" size={20} color={theme.textSecondary} />
              <Text style={[styles.settingLabel, { color: theme.text }]}>Email</Text>
            </View>
            <Text style={[styles.settingValue, { color: theme.textSecondary }]}>{user?.email}</Text>
          </View>
        </View>

        {/* Theme Section */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>Choose your preferred theme</Text>
          
          <View style={styles.themeContainer}>
            {renderThemeOption('Light', 'light', 'sunny')}
            {renderThemeOption('Dark', 'dark', 'moon')}
            {renderThemeOption('Auto', 'auto', 'phone-portrait')}
          </View>
        </View>

        {/* Trading Section */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Trading</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="swap-horizontal-outline" size={20} color={theme.textSecondary} />
              <View>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Trading Mode</Text>
                <Text style={[styles.settingSubtext, { color: theme.textMuted }]}>
                  {mode === 'PAPER' ? 'Practice with virtual funds' : 'Trade with real money'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.modeChip, { backgroundColor: mode === 'PAPER' ? theme.info + '20' : theme.success + '20' }]}
              onPress={handleToggleTradingMode}
            >
              <Text style={[styles.modeChipText, { color: mode === 'PAPER' ? theme.info : theme.success }]}>
                {mode}
              </Text>
            </TouchableOpacity>
          </View>

          {mode === 'PAPER' && (
            <>
              <View style={[styles.divider, { backgroundColor: theme.divider }]} />
              <TouchableOpacity style={styles.settingRow} onPress={handleResetPaperTrading}>
                <View style={styles.settingLeft}>
                  <Ionicons name="refresh-outline" size={20} color={theme.error} />
                  <Text style={[styles.settingLabel, { color: theme.error }]}>Reset Paper Trading</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Notifications Section */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Notifications</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={20} color={theme.textSecondary} />
              <Text style={[styles.settingLabel, { color: theme.text }]}>Push Notifications</Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="pricetag-outline" size={20} color={theme.textSecondary} />
              <Text style={[styles.settingLabel, { color: theme.text }]}>Price Alerts</Text>
            </View>
            <Switch
              value={priceAlerts}
              onValueChange={setPriceAlerts}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="newspaper-outline" size={20} color={theme.textSecondary} />
              <Text style={[styles.settingLabel, { color: theme.text }]}>News Alerts</Text>
            </View>
            <Switch
              value={newsAlerts}
              onValueChange={setNewsAlerts}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Legal Section */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Legal</Text>
          
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => router.push('/legal/about')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="information-circle-outline" size={20} color={theme.textSecondary} />
              <Text style={[styles.settingLabel, { color: theme.text }]}>About</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => router.push('/legal/terms')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="document-text-outline" size={20} color={theme.textSecondary} />
              <Text style={[styles.settingLabel, { color: theme.text }]}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => router.push('/legal/privacy')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="shield-checkmark-outline" size={20} color={theme.textSecondary} />
              <Text style={[styles.settingLabel, { color: theme.text }]}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.error }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

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
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 14,
  },
  settingSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  nameEditContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  nameInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  saveButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeContainer: {
    gap: 12,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
  },
  themeOptionText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  modeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modeChipText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
