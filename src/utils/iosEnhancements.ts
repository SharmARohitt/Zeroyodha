import { Platform, Animated, Easing } from 'react-native';

// iOS-specific enhancement utilities
export const iosEnhancements = {
  // Enhanced shadow styles for iOS
  getShadowStyle: (color: string = '#00D4FF', opacity: number = 0.3, radius: number = 8) => {
    if (Platform.OS !== 'ios') return {};
    
    return {
      shadowColor: color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: opacity,
      shadowRadius: radius,
    };
  },

  // Enhanced text shadow for iOS
  getTextShadowStyle: (color: string = 'rgba(255, 255, 255, 0.1)', opacity: number = 1) => {
    if (Platform.OS !== 'ios') return {};
    
    return {
      textShadowColor: color,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    };
  },

  // Enhanced border styles for iOS
  getBorderStyle: (color: string = 'rgba(0, 212, 255, 0.3)', width: number = 0.5) => {
    if (Platform.OS !== 'ios') return {};
    
    return {
      borderWidth: width,
      borderColor: color,
    };
  },

  // Enhanced backdrop blur style
  getBlurStyle: (intensity: number = 20) => {
    if (Platform.OS !== 'ios') return {};
    
    return {
      backdropFilter: `blur(${intensity}px)`,
    };
  },

  // Create subtle pulse animation
  createPulseAnimation: (animatedValue: Animated.Value, minScale: number = 1, maxScale: number = 1.05, duration: number = 3000) => {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: maxScale,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: minScale,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
  },

  // Create glow animation
  createGlowAnimation: (animatedValue: Animated.Value, minOpacity: number = 0.6, maxOpacity: number = 1, duration: number = 2000) => {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: maxOpacity,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: minOpacity,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    );
  },

  // Enhanced button press animation
  createPressAnimation: (scaleValue: Animated.Value, pressScale: number = 0.95) => {
    const pressIn = () => {
      Animated.spring(scaleValue, {
        toValue: pressScale,
        useNativeDriver: true,
      }).start();
    };

    const pressOut = () => {
      Animated.spring(scaleValue, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }).start();
    };

    return { pressIn, pressOut };
  },

  // Platform-specific dimensions
  getDimensions: () => ({
    iconSize: Platform.OS === 'ios' ? 26 : 24,
    logoSize: Platform.OS === 'ios' ? 48 : 44,
    fontSize: {
      title: Platform.OS === 'ios' ? 24 : 22,
      subtitle: Platform.OS === 'ios' ? 16 : 14,
      body: Platform.OS === 'ios' ? 16 : 14,
      caption: Platform.OS === 'ios' ? 12 : 11,
    },
    spacing: {
      padding: Platform.OS === 'ios' ? 16 : 12,
      margin: Platform.OS === 'ios' ? 12 : 8,
      borderRadius: Platform.OS === 'ios' ? 12 : 10,
    },
    fontWeight: {
      bold: Platform.OS === 'ios' ? '800' : 'bold',
      semibold: Platform.OS === 'ios' ? '700' : '600',
      medium: Platform.OS === 'ios' ? '600' : '500',
    },
  }),

  // Enhanced typography styles
  getTypographyStyle: (variant: 'title' | 'subtitle' | 'body' | 'caption' = 'body') => {
    const dimensions = iosEnhancements.getDimensions();
    
    const baseStyle = {
      fontSize: dimensions.fontSize[variant],
      fontWeight: dimensions.fontWeight.medium,
    };

    if (Platform.OS === 'ios') {
      return {
        ...baseStyle,
        letterSpacing: variant === 'title' ? 0.5 : variant === 'caption' ? 0.3 : 0,
        ...iosEnhancements.getTextShadowStyle(),
      };
    }

    return baseStyle;
  },

  // Enhanced card styles
  getCardStyle: (elevated: boolean = true) => {
    const dimensions = iosEnhancements.getDimensions();
    
    const baseStyle = {
      borderRadius: dimensions.spacing.borderRadius,
      padding: dimensions.spacing.padding,
    };

    if (Platform.OS === 'ios' && elevated) {
      return {
        ...baseStyle,
        ...iosEnhancements.getShadowStyle(),
        ...iosEnhancements.getBorderStyle(),
      };
    }

    return baseStyle;
  },

  // Enhanced button styles
  getButtonStyle: (variant: 'primary' | 'secondary' | 'ghost' = 'primary') => {
    const dimensions = iosEnhancements.getDimensions();
    
    const baseStyle = {
      borderRadius: dimensions.spacing.borderRadius,
      paddingVertical: dimensions.spacing.padding,
      paddingHorizontal: dimensions.spacing.padding * 1.5,
    };

    if (Platform.OS === 'ios') {
      const enhancedStyle = {
        ...baseStyle,
        ...iosEnhancements.getTypographyStyle('body'),
      };

      if (variant === 'primary') {
        return {
          ...enhancedStyle,
          ...iosEnhancements.getShadowStyle('#00D4FF', 0.4, 12),
        };
      }

      return enhancedStyle;
    }

    return baseStyle;
  },
};

export default iosEnhancements;