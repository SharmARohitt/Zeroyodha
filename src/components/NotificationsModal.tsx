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

// Simple time ago function to replace date-fns
function timeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

const colors = {
  primary: '#00D4FF',
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
        return colors.loss;
      case 'news_alert':
        return colors.primary;
      case 'price_increase':
        return colors.profit;
      case 'price_decrease':
        return colors.loss;
      case 'volume_spike':
        return colors.warning;
      default:
        return colors.primary;
    }
  };

  const renderAlert = ({ item }: { item: StockAlert }) => {
    const alertColor = getAlertColor(item.type);
    const icon = getAlertIcon(item.type);

    return (
      <TouchableOpacity
        style={[styles.alertCard, !item.read && styles.alertCardUnread]}
        onPress={() => onMarkAsRead(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.alertIcon, { backgroundColor: alertColor + '20' }]}>
          <Ionicons name={icon} size={20} color={alertColor} />
        </View>
        <View style={styles.alertContent}>
          <View style={styles.alertHeader}>
            <Text style={styles.alertSymbol}>{item.symbol}</Text>
            <Text style={styles.alertTime}>
              {timeAgo(item.timestamp)}
            </Text>
          </View>
          <Text style={styles.alertMessage}>{item.message}</Text>
          {item.urgent && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentText}>URGENT</Text>
            </View>
          )}
        </View>
        {!item.read && <View style={styles.unreadDot} />}
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
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="notifications" size={24} color={colors.primary} />
            <Text style={styles.headerTitle}>Notifications</Text>
          </View>
          <View style={styles.headerRight}>
            {alerts.some(a => !a.read) && (
              <TouchableOpacity
                style={styles.markAllButton}
                onPress={onMarkAllAsRead}
              >
                <Text style={styles.markAllText}>Mark all read</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {alerts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyText}>No notifications</Text>
            <Text style={styles.emptySubtext}>
              You'll see urgent market news and alerts here
            </Text>
          </View>
        ) : (
          <FlatList
            data={alerts}
            keyExtractor={(item) => item.id}
            renderItem={renderAlert}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Modal>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
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
    backgroundColor: colors.card,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
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
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  alertCardUnread: {
    borderColor: colors.primary,
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
    color: colors.primary,
    textTransform: 'uppercase',
  },
  alertTime: {
    fontSize: 11,
    color: colors.textMuted,
  },
  alertMessage: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  urgentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.loss,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
  },
  urgentText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.text,
  },
  unreadDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
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
    color: colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
});
