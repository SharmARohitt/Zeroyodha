import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lightTheme as colors } from '../theme/colors';

interface AppHeaderProps {
  title?: string;
  showLogo?: boolean;
  showNotification?: boolean;
  rightElement?: React.ReactNode;
}

export default function AppHeader({ 
  title, 
  showLogo = true, 
  showNotification = true,
  rightElement 
}: AppHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        {showLogo && (
          <Image
            source={require('../../assets/images/Wealth.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        )}
        {title && <Text style={styles.title}>{title}</Text>}
      </View>
      
      <View style={styles.rightSection}>
        {rightElement}
        {showNotification && (
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: colors.surface,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  notificationButton: {
    position: 'relative',
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
});
