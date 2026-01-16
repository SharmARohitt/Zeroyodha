import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

export default function Toast({ message, type, visible, onHide, duration = 3000 }: ToastProps) {
  const { theme } = useTheme();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.8,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return { 
          backgroundColor: Platform.OS === 'ios' ? theme.success + 'F2' : theme.success, 
          borderColor: theme.success 
        };
      case 'error':
        return { 
          backgroundColor: Platform.OS === 'ios' ? theme.error + 'F2' : theme.error, 
          borderColor: theme.error 
        };
      case 'warning':
        return { 
          backgroundColor: Platform.OS === 'ios' ? theme.warning + 'F2' : theme.warning, 
          borderColor: theme.warning 
        };
      case 'info':
        return { 
          backgroundColor: Platform.OS === 'ios' ? theme.primary + 'F2' : theme.primary, 
          borderColor: theme.primary 
        };
      default:
        return { 
          backgroundColor: Platform.OS === 'ios' ? theme.primary + 'F2' : theme.primary, 
          borderColor: theme.primary 
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'warning':
        return 'warning';
      case 'info':
        return 'information-circle';
      default:
        return 'information-circle';
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        createStyles(theme).container,
        getToastStyle(),
        {
          transform: [{ translateY }, { scale }],
          opacity,
        },
      ]}
    >
      <Ionicons 
        name={getIcon()} 
        size={Platform.OS === 'ios' ? 26 : 24} 
        color="#FFFFFF" 
        style={Platform.OS === 'ios' ? createStyles(theme).iconShadow : {}}
      />
      <Text style={createStyles(theme).message}>{message}</Text>
    </Animated.View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 65 : 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Platform.OS === 'ios' ? 20 : 16,
    paddingVertical: Platform.OS === 'ios' ? 16 : 12,
    borderRadius: Platform.OS === 'ios' ? 16 : 12,
    borderWidth: Platform.OS === 'ios' ? 0.5 : 1,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: Platform.OS === 'ios' ? 4 : 2 },
    shadowOpacity: Platform.OS === 'ios' ? 0.4 : 0.3,
    shadowRadius: Platform.OS === 'ios' ? 8 : 4,
    elevation: 8,
  },
  message: {
    color: '#FFFFFF',
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    fontWeight: Platform.OS === 'ios' ? '700' : '600',
    marginLeft: Platform.OS === 'ios' ? 16 : 12,
    flex: 1,
    letterSpacing: Platform.OS === 'ios' ? 0.3 : 0,
  },
  iconShadow: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});