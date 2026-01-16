import { Dimensions, PixelRatio, Platform, StatusBar } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 11 Pro)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

/**
 * Scales a value based on screen width
 */
export const scaleWidth = (size: number): number => {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

/**
 * Scales a value based on screen height
 */
export const scaleHeight = (size: number): number => {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

/**
 * Scales font size based on screen width and pixel ratio
 */
export const scaleFontSize = (size: number): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Moderately scales a value (less aggressive than scaleWidth)
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scaleWidth(size) - size) * factor;
};

/**
 * Get responsive padding for headers based on platform and screen
 */
export const getHeaderPadding = () => {
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
  
  return {
    paddingTop: Platform.OS === 'ios' 
      ? scaleHeight(55) 
      : statusBarHeight + scaleHeight(10),
    paddingBottom: scaleHeight(12),
    paddingHorizontal: scaleWidth(16),
  };
};

/**
 * Get responsive tab bar height and padding
 */
export const getTabBarDimensions = () => {
  const isSmallScreen = SCREEN_HEIGHT < 700;
  
  return {
    height: Platform.OS === 'ios' 
      ? (isSmallScreen ? scaleHeight(85) : scaleHeight(95))
      : (isSmallScreen ? scaleHeight(60) : scaleHeight(65)),
    paddingBottom: Platform.OS === 'ios' 
      ? (isSmallScreen ? scaleHeight(30) : scaleHeight(36))
      : (isSmallScreen ? scaleHeight(8) : scaleHeight(12)),
    paddingTop: scaleHeight(8),
  };
};

/**
 * Check if device is a small screen
 */
export const isSmallScreen = (): boolean => {
  return SCREEN_HEIGHT < 700 || SCREEN_WIDTH < 375;
};

/**
 * Check if device is a large screen (tablet)
 */
export const isLargeScreen = (): boolean => {
  return SCREEN_WIDTH >= 768;
};

/**
 * Get responsive icon size
 */
export const getIconSize = (baseSize: number): number => {
  if (isSmallScreen()) {
    return moderateScale(baseSize * 0.9);
  }
  return moderateScale(baseSize);
};

/**
 * Get responsive logo size
 */
export const getLogoSize = (): number => {
  if (isSmallScreen()) {
    return Platform.OS === 'ios' ? moderateScale(48) : moderateScale(42);
  }
  return Platform.OS === 'ios' ? moderateScale(56) : moderateScale(48);
};

/**
 * Get responsive title font size
 */
export const getTitleFontSize = (): number => {
  if (isSmallScreen()) {
    return Platform.OS === 'ios' ? scaleFontSize(20) : scaleFontSize(18);
  }
  return Platform.OS === 'ios' ? scaleFontSize(24) : scaleFontSize(20);
};

export const responsive = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  moderateScale,
  getHeaderPadding,
  getTabBarDimensions,
  isSmallScreen: isSmallScreen(),
  isLargeScreen: isLargeScreen(),
  getIconSize,
  getLogoSize,
  getTitleFontSize,
};
