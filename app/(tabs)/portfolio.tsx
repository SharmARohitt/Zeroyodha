import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useTradingStore } from '../../src/store/useTradingStore';
import { useMarketStore } from '../../src/store/useMarketStore';
import { Position, Holding } from '../../src/types';
import { Ionicons } from '@expo/vector-icons';
import PositionCard from '../../src/components/PositionCard';
import HoldingCard from '../../src/components/HoldingCard';

type TabType = 'HOLDINGS' | 'POSITIONS';

export default function PortfolioScreen() {
  const { holdings, positions, mode, funds } = useTradingStore();
  const { stocks, updateMarketData } = useMarketStore();
  const [activeTab, setActiveTab] = useState<TabType>('HOLDINGS');

  // Update P&L based on current market prices
  useEffect(() => {
    // This would be called when market data updates
  }, [stocks]);

  const totalPnl = [...holdings, ...positions].reduce((sum, item) => {
    return sum + (item.pnl || 0);
  }, 0);

  const totalValue = funds.total + totalPnl;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Portfolio</Text>
        <View style={styles.modeBadge}>
          <Text style={styles.modeText}>{mode === 'PAPER' ? '📝 Paper' : '💰 Live'}</Text>
        </View>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Value</Text>
          <Text style={styles.summaryValue}>₹{totalValue.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Available</Text>
          <Text style={styles.summaryValue}>₹{funds.available.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>P&L</Text>
          <Text
            style={[
              styles.summaryValue,
              { color: totalPnl >= 0 ? '#00C853' : '#FF5252' },
            ]}
          >
            {totalPnl >= 0 ? '+' : ''}₹{totalPnl.toLocaleString('en-IN')}
          </Text>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'HOLDINGS' && styles.activeTab]}
          onPress={() => setActiveTab('HOLDINGS')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'HOLDINGS' && styles.activeTabText,
            ]}
          >
            Holdings ({holdings.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'POSITIONS' && styles.activeTab]}
          onPress={() => setActiveTab('POSITIONS')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'POSITIONS' && styles.activeTabText,
            ]}
          >
            Positions ({positions.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'HOLDINGS' ? (
        holdings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="pie-chart-outline" size={64} color="#666" />
            <Text style={styles.emptyText}>No holdings</Text>
          </View>
        ) : (
          <FlatList
            data={holdings}
            keyExtractor={(item) => `${item.symbol}-${item.mode}`}
            renderItem={({ item }) => <HoldingCard holding={item} />}
            contentContainerStyle={styles.listContent}
          />
        )
      ) : (
        positions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="trending-up-outline" size={64} color="#666" />
            <Text style={styles.emptyText}>No positions</Text>
          </View>
        ) : (
          <FlatList
            data={positions}
            keyExtractor={(item) => `${item.symbol}-${item.product}-${item.mode}`}
            renderItem={({ item }) => <PositionCard position={item} />}
            contentContainerStyle={styles.listContent}
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#0A0A0A',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modeBadge: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  modeText: {
    color: '#2962FF',
    fontSize: 12,
    fontWeight: '600',
  },
  summary: {
    backgroundColor: '#1A1A1A',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#999',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0A0A0A',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#2962FF',
  },
  tabText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#2962FF',
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 16,
  },
});

