import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
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
    <TouchableOpacity style={styles.button} onPress={handlePress} activeOpacity={0.8}>
      <Ionicons name="add" size={24} color="#FFFFFF" />
      <Text style={styles.text}>Trade</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#2962FF',
    width: 120,
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#2962FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

