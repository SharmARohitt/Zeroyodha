import React from 'react';
import { Text, TextStyle, Platform } from 'react-native';
import { iosEnhancements } from '../utils/iosEnhancements';

interface IOSEnhancedTextProps {
  children: React.ReactNode;
  style?: TextStyle;
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
  const enhancedStyle: TextStyle = {
    ...iosEnhancements.getTypographyStyle(variant),
    ...style,
    ...(color && { color }),
    ...(Platform.OS === 'ios' && textShadow && iosEnhancements.getTextShadowStyle(textShadowColor)),
    ...(Platform.OS === 'ios' && glowing && {
      textShadowColor: color || '#00D4FF',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
    }),
  };

  return (
    <Text style={enhancedStyle} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}