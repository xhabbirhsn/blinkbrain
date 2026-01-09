import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  Animated,
  Pressable,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { theme } from '../theme/tokens';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface GlassButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (prefersReducedMotion || disabled) return;
    
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePressOut = () => {
    if (prefersReducedMotion || disabled) return;
    
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.accent.primary,
          borderColor: 'transparent',
        };
      case 'secondary':
        return {
          backgroundColor: theme.colors.glass.primary,
          borderColor: theme.colors.border.subtle,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: theme.colors.border.medium,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
        };
      case 'md':
        return {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
        };
      case 'lg':
        return {
          paddingVertical: theme.spacing.lg,
          paddingHorizontal: theme.spacing.xl,
        };
    }
  };

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        fullWidth && styles.fullWidth,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={[
          styles.button,
          getVariantStyles(),
          getSizeStyles(),
          disabled && styles.disabled,
          style,
        ]}
      >
        {variant === 'primary' ? (
          <Text
            style={[
              styles.text,
              size === 'sm' && styles.textSm,
              size === 'lg' && styles.textLg,
              disabled && styles.textDisabled,
              textStyle,
            ]}
          >
            {children}
          </Text>
        ) : (
          <BlurView intensity={20} tint="dark" style={styles.blurContent}>
            <Text
              style={[
                styles.text,
                size === 'sm' && styles.textSm,
                size === 'lg' && styles.textLg,
                disabled && styles.textDisabled,
                textStyle,
              ]}
            >
              {children}
            </Text>
          </BlurView>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  fullWidth: {
    width: '100%',
  },
  blurContent: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
  textSm: {
    fontSize: theme.typography.sizes.sm,
  },
  textLg: {
    fontSize: theme.typography.sizes.lg,
  },
  disabled: {
    opacity: 0.5,
  },
  textDisabled: {
    color: theme.colors.text.disabled,
  },
});
