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
import { getStockLogo } from '../utils/stockLogos';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.28; // Smaller cards
const CARD_SPACING = 6;

// Theme colors
const colors = {
  primary: '#00D4FF', // Blue Neon
  profit: '#00C853',
  loss: '#FF5252',
  background: '#0A0A0A',
  card: '#1A1A1A',
  border: '#2A2A2A',
  text: '#FFFFFF',
};

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
          const changeColor = isPositive ? colors.profit : colors.loss;
          const logoInfo = getStockLogo(index.symbol);

          return (
            <TouchableOpacity
              key={index.symbol}
              style={styles.card}
              activeOpacity={0.9}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.indexName} numberOfLines={1}>{index.name}</Text>
              </View>
              
              <View style={styles.cardBody}>
                <Text style={styles.indexValue}>
                  {formatCurrency(index.lastPrice)}
                </Text>
                <View style={[styles.changeContainer, { backgroundColor: changeColor + '15' }]}>
                  <Text style={[styles.changeText, { color: changeColor }]}>
                    {isPositive ? '▲' : '▼'} {formatPercent(Math.abs(index.changePercent))}
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
    backgroundColor: colors.background,
    paddingVertical: 6,
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 8,
    marginRight: CARD_SPACING,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  cardHeader: {
    marginBottom: 4,
  },
  indexName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
  },
  cardBody: {
    gap: 3,
  },
  indexValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.text,
  },
  changeContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  changeText: {
    fontSize: 9,
    fontWeight: '700',
  },
});

