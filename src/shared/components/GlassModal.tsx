import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { theme } from '../theme/tokens';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface GlassModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const GlassModal: React.FC<GlassModalProps> = ({
  visible,
  onClose,
  title,
  children,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      if (prefersReducedMotion) {
        slideAnim.setValue(0);
        opacityAnim.setValue(1);
      } else {
        Animated.parallel([
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 10,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: theme.animations.durations.normal,
            useNativeDriver: true,
          }),
        ]).start();
      }
    } else {
      if (prefersReducedMotion) {
        slideAnim.setValue(SCREEN_HEIGHT);
        opacityAnim.setValue(0);
      } else {
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: SCREEN_HEIGHT,
            duration: theme.animations.durations.fast,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: theme.animations.durations.fast,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  }, [visible, prefersReducedMotion]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          style={[styles.overlayBackground, { opacity: opacityAnim }]}
        >
          <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
        </Animated.View>
      </Pressable>

      <Animated.View
        style={[
          styles.modalContainer,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalCard}>
            <BlurView intensity={40} tint="dark" style={styles.blur}>
              {title && (
                <View style={styles.header}>
                  <Text style={styles.title}>{title}</Text>
                  <Pressable onPress={onClose} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>✕</Text>
                  </Pressable>
                </View>
              )}
              
              <View style={styles.content}>{children}</View>
            </BlurView>
          </View>
        </Pressable>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.glass.overlay,
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  modalContent: {
    flex: 1,
  },
  modalCard: {
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: theme.colors.glass.primary,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    ...theme.shadows.lg,
  },
  blur: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },
  title: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  closeButtonText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.sizes.xl,
    lineHeight: theme.typography.sizes.xl,
  },
  content: {
    padding: theme.spacing.lg,
  },
});
