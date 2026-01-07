import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Base dimensions (iPhone 11 Pro)
const baseWidth = 375;
const baseHeight = 812;

// Calculate scale factors
const scaleWidth = width / baseWidth;
const scaleHeight = height / baseHeight;
const scale = Math.min(scaleWidth, scaleHeight);

/**
 * Normalize size for different screen densities
 * @param size Size in pixels (based on 375x812 screen)
 * @returns Scaled size for current device
 */
export const normalize = (size: number): number => {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

/**
 * Device size categories
 */
export const deviceSize = {
  isSmall: width < 375,
  isMedium: width >= 375 && width < 768,
  isLarge: width >= 768,
  isTablet: width >= 768,
  width,
  height,
};

/**
 * Responsive spacing system
 * Scales based on device size
 */
export const responsiveSpacing = {
  xs: deviceSize.isSmall ? 3 : 4,
  sm: deviceSize.isSmall ? 6 : 8,
  md: deviceSize.isSmall ? 12 : 16,
  lg: deviceSize.isSmall ? 18 : 24,
  xl: deviceSize.isSmall ? 24 : 32,
  xxl: deviceSize.isSmall ? 36 : 48,
  xxxl: deviceSize.isSmall ? 48 : 64,
};

/**
 * Responsive font sizes
 */
export const responsiveFontSize = {
  xs: normalize(12),
  sm: normalize(14),
  md: normalize(16),
  lg: normalize(18),
  xl: normalize(20),
  xxl: normalize(24),
  xxxl: normalize(32),
  display: normalize(42),
};

/**
 * Screen breakpoints
 */
export const breakpoints = {
  small: 0,
  medium: 375,
  large: 768,
  xlarge: 1024,
};

/**
 * Get responsive value based on screen width
 */
export const getResponsiveValue = <T,>(values: {
  small?: T;
  medium?: T;
  large?: T;
  xlarge?: T;
}): T | undefined => {
  if (width >= breakpoints.xlarge && values.xlarge) return values.xlarge;
  if (width >= breakpoints.large && values.large) return values.large;
  if (width >= breakpoints.medium && values.medium) return values.medium;
  return values.small;
};

/**
 * Check if device supports certain features
 */
export const deviceCapabilities = {
  supportsBlur: Platform.OS !== 'web' || typeof CSS !== 'undefined' && CSS.supports('backdrop-filter', 'blur(1px)'),
  supportsHaptics: Platform.OS === 'ios' || Platform.OS === 'android',
  supportsNotifications: true,
};

/**
 * Get safe padding for different screen edges
 */
export const getSafePadding = () => {
  const top = Platform.select({
    ios: 44, // Status bar + safe area
    android: 0, // Handled by system
    default: 0,
  });

  const bottom = Platform.select({
    ios: 34, // Home indicator
    android: 0,
    default: 0,
  });

  return { top, bottom, left: 0, right: 0 };
};
