import React from 'react';
import { Text, TextStyle, StyleProp, Platform, StyleSheet } from 'react-native';
import { iosEnhancements } from '../utils/iosEnhancements';

interface IOSEnhancedTextProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  variant?: 'title' | 'subtitle' | 'body' | 'caption';
  color?: string;
  textShadow?: boolean;
  textShadowColor?: string;
  glowing?: boolean;
  numberOfLines?: number;
}

export default function IOSEnhancedText({
  children,
  style,
  variant = 'body',
  color,
  textShadow = false,
  textShadowColor = 'rgba(255, 255, 255, 0.1)',
  glowing = false,
  numberOfLines,
}: IOSEnhancedTextProps) {
  const flattenedStyle = StyleSheet.flatten(style) || {};

  const enhancedStyle: StyleProp<TextStyle> = [
    iosEnhancements.getTypographyStyle(variant) as TextStyle,
    flattenedStyle,
    color ? ({ color } as TextStyle) : undefined,
    Platform.OS === 'ios' && textShadow
      ? (iosEnhancements.getTextShadowStyle(textShadowColor) as TextStyle)
      : undefined,
    Platform.OS === 'ios' && glowing
      ? ({
          textShadowColor: color || '#00D4FF',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 8,
        } as TextStyle)
      : undefined,
  ];

  return (
    <Text style={enhancedStyle} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}