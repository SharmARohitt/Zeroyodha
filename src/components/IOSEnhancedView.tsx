import React, { useRef, useEffect } from 'react';
import { View, Animated, Platform, ViewStyle } from 'react-native';
import { iosEnhancements } from '../utils/iosEnhancements';

interface IOSEnhancedViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  animated?: boolean;
  animationType?: 'pulse' | 'glow' | 'none';
  shadow?: boolean;
  shadowColor?: string;
  shadowOpacity?: number;
  shadowRadius?: number;
  border?: boolean;
  borderColor?: string;
  borderWidth?: number;
}

export default function IOSEnhancedView({
  children,
  style,
  animated = false,
  animationType = 'pulse',
  shadow = false,
  shadowColor = '#00D4FF',
  shadowOpacity = 0.3,
  shadowRadius = 8,
  border = false,
  borderColor = 'rgba(0, 212, 255, 0.3)',
  borderWidth = 0.5,
}: IOSEnhancedViewProps) {
  const animatedValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (Platform.OS === 'ios' && animated) {
      let animation: Animated.CompositeAnimation | undefined;

      if (animationType === 'pulse') {
        animation = iosEnhancements.createPulseAnimation(animatedValue);
      } else if (animationType === 'glow') {
        animation = iosEnhancements.createGlowAnimation(animatedValue);
      }

      if (animation) {
        animation.start();
      }

      return () => {
        if (animation) {
          animation.stop();
        }
      };
    }
  }, [animated, animationType]);

  const enhancedStyle: ViewStyle = {
    ...style,
    ...(Platform.OS === 'ios' && shadow && iosEnhancements.getShadowStyle(shadowColor, shadowOpacity, shadowRadius)),
    ...(Platform.OS === 'ios' && border && iosEnhancements.getBorderStyle(borderColor, borderWidth)),
  };

  const animatedStyle = animated && Platform.OS === 'ios' ? {
    transform: animationType === 'pulse' ? [{ scale: animatedValue }] : [],
    opacity: animationType === 'glow' ? animatedValue : 1,
  } : {};

  if (animated && Platform.OS === 'ios') {
    return (
      <Animated.View style={[enhancedStyle, animatedStyle]}>
        {children}
      </Animated.View>
    );
  }

  return (
    <View style={enhancedStyle}>
      {children}
    </View>
  );
}