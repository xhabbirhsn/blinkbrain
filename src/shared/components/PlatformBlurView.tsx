import React from 'react';
import { Platform, View, ViewStyle, StyleProp } from 'react-native';
import { BlurView, BlurViewProps } from 'expo-blur';

interface PlatformBlurViewProps extends Partial<BlurViewProps> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
}

/**
 * Platform-aware BlurView component
 * - Uses native BlurView on iOS/Android
 * - Falls back to CSS backdrop-filter on Web
 */
export const PlatformBlurView: React.FC<PlatformBlurViewProps> = ({
  children,
  style,
  intensity = 20,
  tint = 'light',
  ...props
}) => {
  if (Platform.OS === 'web') {
    // Web fallback with CSS backdrop-filter
    return (
      <View
        style={[
          {
            // @ts-ignore - CSS properties for web
            backdropFilter: `blur(${intensity / 2}px) saturate(180%)`,
            WebkitBackdropFilter: `blur(${intensity / 2}px) saturate(180%)`,
            backgroundColor: tint === 'light' 
              ? 'rgba(255, 255, 255, 0.7)' 
              : 'rgba(0, 0, 0, 0.5)',
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  // Native BlurView for iOS/Android
  return (
    <BlurView intensity={intensity} tint={tint} style={style} {...props}>
      {children}
    </BlurView>
  );
};
