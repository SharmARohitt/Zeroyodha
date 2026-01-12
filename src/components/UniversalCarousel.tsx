import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.26;
const CARD_SPACING = 8;

// Theme colors
const colors = {
  primary: '#00D4FF', // Blue Neon
  background: '#0A0A0A',
  card: '#1A1A1A',
  border: '#2A2A2A',
  text: '#FFFFFF',
  textMuted: '#999999',
};

interface CarouselItem {
  title: string;
  value: string;
  subtitle?: string;
  color?: string;
}

interface UniversalCarouselProps {
  items: CarouselItem[];
}

export default function UniversalCarousel({ items }: UniversalCarouselProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((item, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={[styles.value, { color: item.color || colors.text }]}>
              {item.value}
            </Text>
            {item.subtitle && (
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            )}
          </View>
        ))}
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
    paddingHorizontal: 16,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 10,
    marginRight: CARD_SPACING,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 65,
    justifyContent: 'center',
  },
  title: {
    fontSize: 9,
    color: colors.textMuted,
    marginBottom: 4,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 8,
    color: '#666',
    textAlign: 'center',
  },
});