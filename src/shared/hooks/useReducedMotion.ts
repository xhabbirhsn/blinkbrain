import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Hook to detect if user prefers reduced motion
 * Respects accessibility settings
 */
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check initial state
    AccessibilityInfo.isReduceMotionEnabled().then(isEnabled => {
      setPrefersReducedMotion(isEnabled);
    });

    // Listen for changes
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      isEnabled => {
        setPrefersReducedMotion(isEnabled);
      }
    );

    return () => subscription.remove();
  }, []);

  return prefersReducedMotion;
};
