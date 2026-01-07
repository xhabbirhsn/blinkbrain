/**
 * BlinkBrain Design System - Modern Pastel Theme
 * Inspired by Apple Liquid Glass, Material You, and Notion Mobile
 */

export const colors = {
  // Primary Glass Surfaces (now more subtle for light theme)
  glass: {
    primary: 'rgba(255, 255, 255, 0.95)',
    secondary: 'rgba(255, 255, 255, 0.8)',
    tertiary: 'rgba(255, 255, 255, 0.6)',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Backgrounds - Light theme
  background: {
    primary: '#F5F5F7', // Light gray (Apple-like)
    secondary: '#FFFFFF',
    gradient: ['#F5F5F7', '#E8E8EA'],
  },
  
  // Text - Dark text for light background
  text: {
    primary: '#1D1D1F', // Almost black
    secondary: 'rgba(0, 0, 0, 0.7)',
    tertiary: 'rgba(0, 0, 0, 0.5)',
    disabled: 'rgba(0, 0, 0, 0.3)',
  },
  
  // Pastel Card Colors (matching the snapshot)
  cardColors: {
    purple: '#D4C5F9', // Breakfast card
    yellow: '#FFF4C9', // Lunch card
    green: '#C9F4DE',  // Dinner card
    peach: '#FFE4C9',  // Snack card
    blue: '#C9E4FF',
    pink: '#FFD4E5',
  },
  
  // Accents
  accent: {
    primary: '#6366F1', // Indigo
    secondary: '#8B5CF6', // Violet
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  
  // Borders
  border: {
    subtle: 'rgba(0, 0, 0, 0.05)',
    medium: 'rgba(0, 0, 0, 0.1)',
    strong: 'rgba(0, 0, 0, 0.2)',
  },
} as const;

export const blur = {
  none: 0,
  subtle: 10,
  medium: 20,
  strong: 40,
  intense: 60,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
} as const;

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const animations = {
  durations: {
    instant: 0,
    fast: 150,
    normal: 250,
    slow: 400,
  },
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

export const theme = {
  colors,
  blur,
  spacing,
  borderRadius,
  shadows,
  typography,
  animations,
} as const;

export type Theme = typeof theme;
