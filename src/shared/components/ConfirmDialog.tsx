import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { theme } from '../theme/tokens';
import { normalize, responsiveSpacing } from '../utils/responsive';
import { GlassButton } from './GlassButton';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'info',
}) => {
  const variantColors = {
    danger: theme.colors.accent.error,
    warning: theme.colors.accent.warning,
    info: theme.colors.accent.primary,
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.overlay} onPress={onCancel}>
        <View style={styles.dialog}>
          <View style={[styles.header, { borderLeftColor: variantColors[variant] }]}>
            <Text style={styles.title}>{title}</Text>
          </View>

          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            <GlassButton
              onPress={onCancel}
              variant="secondary"
              size="md"
              style={styles.button}
              textStyle={{ color: theme.colors.text.primary }}
            >
              {cancelText}
            </GlassButton>
            <View style={{ width: responsiveSpacing.md }} />
            <GlassButton
              onPress={onConfirm}
              variant="primary"
              size="md"
              style={[styles.button, { backgroundColor: variantColors[variant] }]}
              textStyle={{ color: '#FFFFFF' }}
            >
              {confirmText}
            </GlassButton>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: responsiveSpacing.lg,
  },
  dialog: {
    backgroundColor: theme.colors.glass.primary,
    borderRadius: theme.borderRadius.lg,
    padding: responsiveSpacing.lg,
    width: '100%',
    maxWidth: normalize(400),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    borderLeftWidth: 4,
    paddingLeft: responsiveSpacing.md,
    marginBottom: responsiveSpacing.md,
  },
  title: {
    fontSize: normalize(18),
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: responsiveSpacing.xs,
  },
  message: {
    fontSize: normalize(14),
    color: theme.colors.text.secondary,
    lineHeight: normalize(20),
    marginBottom: responsiveSpacing.lg,
  },
  actions: {
    flexDirection: 'row',
  },
  button: {
    flex: 1,
  },
});
