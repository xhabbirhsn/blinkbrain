import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { theme } from '../theme/tokens';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 20,
  tint = 'light',
}) => {
  return (
    <View style={[styles.container, style]}>
      <BlurView intensity={intensity} tint={tint} style={styles.blur}>
        <View style={styles.content}>{children}</View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.glass.primary,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    ...theme.shadows.md,
  },
  blur: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
});
