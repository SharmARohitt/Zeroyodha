import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Watchlist } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface WatchlistTabsProps {
  watchlists: Watchlist[];
  currentWatchlist: string | null;
  onTabPress: (watchlistId: string) => void;
  onAddWatchlist?: () => void;
}

export default function WatchlistTabs({
  watchlists,
  currentWatchlist,
  onTabPress,
  onAddWatchlist,
}: WatchlistTabsProps) {
  const { theme } = useTheme();
  
  if (watchlists.length === 0) {
    return null;
  }

  return (
    <View style={createStyles(theme).container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={createStyles(theme).scrollContent}
      >
        {watchlists.map((watchlist) => {
          const isActive = watchlist.id === currentWatchlist;
          return (
            <TouchableOpacity
              key={watchlist.id}
              style={[createStyles(theme).tab, isActive && createStyles(theme).tabActive]}
              onPress={() => onTabPress(watchlist.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[createStyles(theme).tabText, isActive && createStyles(theme).tabTextActive]}
              >
                {watchlist.name}
              </Text>
              {isActive && <View style={createStyles(theme).indicator} />}
            </TouchableOpacity>
          );
        })}
        
        {/* Add Watchlist Button */}
        {onAddWatchlist && (
          <TouchableOpacity
            style={createStyles(theme).addButton}
            onPress={onAddWatchlist}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle" size={20} color={theme.primary} />
            <Text style={createStyles(theme).addButtonText}>New</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    position: 'relative',
  },
  tabActive: {
    // Active styling handled by text and indicator
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textMuted,
  },
  tabTextActive: {
    color: theme.primary,
    fontWeight: '600',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 2,
    backgroundColor: theme.primary,
    borderRadius: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 4,
    gap: 4,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.primary,
  },
});

