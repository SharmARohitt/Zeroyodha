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
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.28;
const CARD_SPACING = 6;

export default function TopIndicesCarousel() {
  const { stocks } = useMarketStore();
  const { theme } = useTheme();
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
    <View style={createStyles(theme).container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        contentContainerStyle={createStyles(theme).scrollContent}
        pagingEnabled={false}
        snapToAlignment="start"
      >
        {indices.map((index) => {
          if (!index) return null;
          const isPositive = index.change >= 0;
          const changeColor = isPositive ? theme.profit : theme.loss;

          return (
            <TouchableOpacity
              key={index.symbol}
              style={createStyles(theme).card}
              activeOpacity={0.9}
            >
              <View style={createStyles(theme).cardHeader}>
                <Text style={createStyles(theme).indexName} numberOfLines={1}>{index.name}</Text>
              </View>
              
              <View style={createStyles(theme).cardBody}>
                <Text style={createStyles(theme).indexValue}>
                  {formatCurrency(index.lastPrice)}
                </Text>
                <View style={[createStyles(theme).changeContainer, { backgroundColor: changeColor + '15' }]}>
                  <Text style={[createStyles(theme).changeText, { color: changeColor }]}>
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

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: theme.surface,
    paddingVertical: 6,
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: theme.card,
    borderRadius: 8,
    padding: 8,
    marginRight: CARD_SPACING,
    borderWidth: 0.5,
    borderColor: theme.border,
  },
  cardHeader: {
    marginBottom: 4,
  },
  indexName: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.textSecondary,
    textTransform: 'uppercase',
  },
  cardBody: {
    gap: 3,
  },
  indexValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.text,
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

