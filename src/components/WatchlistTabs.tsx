import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Watchlist } from '../types';

interface WatchlistTabsProps {
  watchlists: Watchlist[];
  currentWatchlist: string | null;
  onTabPress: (watchlistId: string) => void;
}

export default function WatchlistTabs({
  watchlists,
  currentWatchlist,
  onTabPress,
}: WatchlistTabsProps) {
  if (watchlists.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {watchlists.map((watchlist) => {
          const isActive = watchlist.id === currentWatchlist;
          return (
            <TouchableOpacity
              key={watchlist.id}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => onTabPress(watchlist.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.tabText, isActive && styles.tabTextActive]}
              >
                {watchlist.name}
              </Text>
              {isActive && <View style={styles.indicator} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A0A0A',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
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
    color: '#666',
  },
  tabTextActive: {
    color: '#2962FF',
    fontWeight: '600',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 2,
    backgroundColor: '#2962FF',
    borderRadius: 1,
  },
});

