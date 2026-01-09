import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMarketStore } from '../store/useMarketStore';

export default function FloatingTradeButton() {
  const router = useRouter();
  const { selectedSymbol } = useMarketStore();

  const handlePress = () => {
    if (selectedSymbol) {
      router.push({
        pathname: '/order',
        params: { symbol: selectedSymbol },
      });
    } else {
      router.push('/order' as any);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.button} 
      onPress={handlePress} 
      activeOpacity={0.8}
    >
      <Ionicons name="trending-up" size={24} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 75, // Closer to bottom navigation (typical tab bar is ~60-70px)
    right: 20,
    backgroundColor: '#2962FF',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#2962FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    zIndex: 1000,
  },
});

