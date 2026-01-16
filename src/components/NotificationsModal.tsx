import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StockAlert } from '../services/notificationService';
import { useTheme } from '../contexts/ThemeContext';

// Simple time ago function to replace date-fns
function timeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  alerts: StockAlert[];
  onMarkAsRead: (alertId: string) => void;
  onMarkAllAsRead: () => void;
}

export default function NotificationsModal({
  visible,
  onClose,
  alerts,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationsModalProps) {
  const { theme } = useTheme();
  
  const getAlertIcon = (type: StockAlert['type']) => {
    switch (type) {
      case 'urgent_news':
        return 'megaphone';
      case 'news_alert':
        return 'newspaper';
      case 'price_increase':
        return 'trending-up';
      case 'price_decrease':
        return 'trending-down';
      case 'volume_spike':
        return 'pulse';
      default:
        return 'notifications';
    }
  };

  const getAlertColor = (type: StockAlert['type']) => {
    switch (type) {
      case 'urgent_news':
        return theme.loss;
      case 'news_alert':
        return theme.primary;
      case 'price_increase':
        return theme.profit;
      case 'price_decrease':
        return theme.loss;
      case 'volume_spike':
        return theme.warning;
      default:
        return theme.primary;
    }
  };

  const renderAlert = ({ item }: { item: StockAlert }) => {
    const alertColor = getAlertColor(item.type);
    const icon = getAlertIcon(item.type);

    return (
      <TouchableOpacity
        style={[createStyles(theme).alertCard, !item.read && createStyles(theme).alertCardUnread]}
        onPress={() => onMarkAsRead(item.id)}
        activeOpacity={0.7}
      >
        <View style={[createStyles(theme).alertIcon, { backgroundColor: alertColor + '20' }]}>
          <Ionicons name={icon} size={20} color={alertColor} />
        </View>
        <View style={createStyles(theme).alertContent}>
          <View style={createStyles(theme).alertHeader}>
            <Text style={createStyles(theme).alertSymbol}>{item.symbol}</Text>
            <Text style={createStyles(theme).alertTime}>
              {timeAgo(item.timestamp)}
            </Text>
          </View>
          <Text style={createStyles(theme).alertMessage}>{item.message}</Text>
          {item.urgent && (
            <View style={createStyles(theme).urgentBadge}>
              <Text style={createStyles(theme).urgentText}>URGENT</Text>
            </View>
          )}
        </View>
        {!item.read && <View style={createStyles(theme).unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={createStyles(theme).container}>
        <View style={createStyles(theme).header}>
          <View style={createStyles(theme).headerLeft}>
            <Ionicons name="notifications" size={24} color={theme.primary} />
            <Text style={createStyles(theme).headerTitle}>Notifications</Text>
          </View>
          <View style={createStyles(theme).headerRight}>
            {alerts.some(a => !a.read) && (
              <TouchableOpacity
                style={createStyles(theme).markAllButton}
                onPress={onMarkAllAsRead}
              >
                <Text style={createStyles(theme).markAllText}>Mark all read</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose} style={createStyles(theme).closeButton}>
              <Ionicons name="close" size={28} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>

        {alerts.length === 0 ? (
          <View style={createStyles(theme).emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color={theme.textMuted} />
            <Text style={createStyles(theme).emptyText}>No notifications</Text>
            <Text style={createStyles(theme).emptySubtext}>
              You'll see urgent market news and alerts here
            </Text>
          </View>
        ) : (
          <FlatList
            data={alerts}
            keyExtractor={(item) => item.id}
            renderItem={renderAlert}
            contentContainerStyle={createStyles(theme).listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Modal>
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
    paddingBottom: 16,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: theme.card,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.primary,
  },
  closeButton: {
    padding: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
    position: 'relative',
  },
  alertCardUnread: {
    borderColor: theme.primary,
    borderWidth: 1.5,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  alertSymbol: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.primary,
    textTransform: 'uppercase',
  },
  alertTime: {
    fontSize: 11,
    color: theme.textMuted,
  },
  alertMessage: {
    fontSize: 14,
    color: theme.text,
    lineHeight: 20,
  },
  urgentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.loss,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
  },
  urgentText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.text,
  },
  unreadDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
});
