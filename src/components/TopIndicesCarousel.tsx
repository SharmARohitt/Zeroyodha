import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useMarketStore } from '../store/useMarketStore';
import { formatCurrency, formatPercent } from '../utils/formatters';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.45; // Much smaller cards
const CARD_SPACING = 8;

export default function TopIndicesCarousel() {
  const { stocks } = useMarketStore();
  const scrollViewRef = useRef<ScrollView>(null);

  // Get major indices
  const indices = [
    stocks['NIFTY'],
    stocks['BANKNIFTY'],
    stocks['SENSEX'],
    stocks['INDIAVIX'],
    stocks['FINNIFTY'],
  ].filter(Boolean);

  if (indices.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
        pagingEnabled={false}
        snapToAlignment="start"
      >
        {indices.map((index) => {
          if (!index) return null;
          const isPositive = index.change >= 0;
          const changeColor = isPositive ? '#00C853' : '#FF5252';

          return (
            <TouchableOpacity
              key={index.symbol}
              style={styles.card}
              activeOpacity={0.9}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.indexName}>{index.name}</Text>
                <View style={[styles.badge, { backgroundColor: changeColor + '20' }]}>
                  <Text style={[styles.badgeText, { color: changeColor }]}>
                    {index.instrumentType}
                  </Text>
                </View>
              </View>
              
              <View style={styles.cardBody}>
                <Text style={styles.indexValue}>
                  {formatCurrency(index.lastPrice)}
                </Text>
                <View style={styles.changeRow}>
                  <Text style={[styles.changeText, { color: changeColor }]}>
                    {isPositive ? '+' : ''}
                    {formatCurrency(index.change)}
                  </Text>
                  <Text style={[styles.changePercent, { color: changeColor }]}>
                    ({formatPercent(index.changePercent)})
                  </Text>
                </View>
              </View>
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
    paddingVertical: 10,
    paddingTop: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingRight: 4,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 10,
    marginRight: CARD_SPACING,
    borderWidth: 0.5,
    borderColor: '#2A2A2A',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  indexName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cardBody: {
    marginTop: 2,
  },
  indexValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  changePercent: {
    fontSize: 12,
    fontWeight: '600',
  },
});

