import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMarketStore } from '../store/useMarketStore';
import { LinearGradient } from 'expo-linear-gradient';

export default function FloatingTradeButton() {
  const router = useRouter();
  const { selectedSymbol } = useMarketStore();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    // Continuous glow animation for iOS
    if (Platform.OS === 'ios') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.6,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

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
    <Animated.View style={[
      styles.container,
      {
        transform: [{ scale: scaleAnim }],
        ...(Platform.OS === 'ios' && {
          shadowOpacity: glowAnim,
        }),
      }
    ]}>
      <TouchableOpacity 
        style={styles.button} 
        onPress={handlePress} 
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={['#00D4FF', '#0099CC', '#006699']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Ionicons 
            name="trending-up" 
            size={Platform.OS === 'ios' ? 24 : 25} 
            color="#FFFFFF" 
            style={Platform.OS === 'ios' ? styles.iconShadow : {}}
          />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 85,
    right: 16,
    width: Platform.OS === 'ios' ? 52 : 48,
    height: Platform.OS === 'ios' ? 52 : 48,
    borderRadius: Platform.OS === 'ios' ? 26 : 24,
    elevation: 10,
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: Platform.OS === 'ios' ? 8 : 4 },
    shadowOpacity: Platform.OS === 'ios' ? 0.8 : 0.6,
    shadowRadius: Platform.OS === 'ios' ? 20 : 12,
    zIndex: 1000,
  },
  button: {
    width: '100%',
    height: '100%',
    borderRadius: Platform.OS === 'ios' ? 26 : 24,
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: Platform.OS === 'ios' ? 26 : 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'ios' && {
      borderWidth: 1,
      borderColor: 'rgba(0, 212, 255, 0.3)',
    }),
  },
  iconShadow: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});

