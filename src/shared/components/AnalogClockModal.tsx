import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { GlassModal } from './GlassModal';
import { GlassButton } from './GlassButton';
import { theme } from '../theme/tokens';
import { normalize, responsiveSpacing } from '../utils/responsive';

interface AnalogClockModalProps {
  visible: boolean;
  initialDate?: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
}

export const AnalogClockModal: React.FC<AnalogClockModalProps> = ({
  visible,
  initialDate,
  onConfirm,
  onCancel,
}) => {
  const init = initialDate ?? new Date();
  const [hour, setHour] = React.useState<number>(((init.getHours() % 12) || 12));
  const [minute, setMinute] = React.useState<number>(init.getMinutes());
  const [isPM, setIsPM] = React.useState<boolean>(init.getHours() >= 12);

  const pad2 = (n: number) => n.toString().padStart(2, '0');

  const confirm = () => {
    const hour24 = isPM ? ((hour % 12) + 12) : (hour % 12);
    const next = new Date(init);
    next.setHours(hour24);
    next.setMinutes(minute);
    next.setSeconds(0);
    onConfirm(next);
  };

  return (
    <GlassModal visible={visible} onClose={onCancel} title="Select Time">
      <View style={styles.container}>
        {/* AM/PM Toggle */}
        <View style={styles.ampmToggle}>
          <Pressable 
            style={[styles.ampmButton, !isPM && styles.ampmButtonActive]} 
            onPress={() => setIsPM(false)}
          >
            <Text style={[styles.ampmText, !isPM && styles.ampmTextActive]}>AM</Text>
          </Pressable>
          <Pressable 
            style={[styles.ampmButton, isPM && styles.ampmButtonActive]} 
            onPress={() => setIsPM(true)}
          >
            <Text style={[styles.ampmText, isPM && styles.ampmTextActive]}>PM</Text>
          </Pressable>
        </View>

        {/* Digital Time Display with Spinners */}
        <View style={styles.timeDisplay}>
          {/* Hour Spinner */}
          <View style={styles.spinnerColumn}>
            <Text style={styles.spinnerLabel}>Hour</Text>
            <View style={styles.spinner}>
              <Pressable 
                onPress={() => setHour(((hour + 10) % 12) + 1)} 
                style={styles.spinnerButton}
              >
                <Text style={styles.spinnerButtonText}>−</Text>
              </Pressable>
              <Text style={styles.spinnerValue}>{pad2(hour)}</Text>
              <Pressable 
                onPress={() => setHour((hour % 12) + 1)} 
                style={styles.spinnerButton}
              >
                <Text style={styles.spinnerButtonText}>+</Text>
              </Pressable>
            </View>
          </View>

          {/* Colon Separator */}
          <Text style={styles.colonText}>:</Text>

          {/* Minute Spinner */}
          <View style={styles.spinnerColumn}>
            <Text style={styles.spinnerLabel}>Minute</Text>
            <View style={styles.spinner}>
              <Pressable 
                onPress={() => setMinute((minute + 59) % 60)} 
                style={styles.spinnerButton}
              >
                <Text style={styles.spinnerButtonText}>−</Text>
              </Pressable>
              <Text style={styles.spinnerValue}>{pad2(minute)}</Text>
              <Pressable 
                onPress={() => setMinute((minute + 1) % 60)} 
                style={styles.spinnerButton}
              >
                <Text style={styles.spinnerButtonText}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Digital Readout */}
        <View style={styles.readout}>
          <Text style={styles.readoutText}>
            {`${pad2(isPM ? ((hour % 12) + 12) : (hour % 12))}:${pad2(minute)} ${isPM ? 'PM' : 'AM'}`}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <GlassButton variant="outline" onPress={onCancel} style={styles.button}>
            Cancel
          </GlassButton>
          <GlassButton variant="primary" onPress={confirm} style={styles.button}>
            OK
          </GlassButton>
        </View>
      </View>
    </GlassModal>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: responsiveSpacing.lg,
  },
  ampmToggle: {
    flexDirection: 'row',
    gap: responsiveSpacing.md,
    justifyContent: 'center',
  },
  ampmButton: {
    backgroundColor: theme.colors.glass.primary,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: responsiveSpacing.lg,
    paddingVertical: responsiveSpacing.sm,
  },
  ampmButtonActive: {
    backgroundColor: theme.colors.accent.primary,
    borderColor: theme.colors.accent.primary,
  },
  ampmText: {
    color: theme.colors.text.secondary,
    fontSize: normalize(14),
    fontWeight: '700',
  },
  ampmTextActive: {
    color: '#FFFFFF',
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: responsiveSpacing.md,
    backgroundColor: theme.colors.glass.secondary,
    borderRadius: theme.borderRadius.lg,
    padding: responsiveSpacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  spinnerColumn: {
    alignItems: 'center',
    gap: responsiveSpacing.sm,
  },
  spinnerLabel: {
    color: theme.colors.text.secondary,
    fontSize: normalize(12),
    fontWeight: '600',
  },
  spinner: {
    alignItems: 'center',
    backgroundColor: theme.colors.glass.primary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    paddingVertical: responsiveSpacing.sm,
    paddingHorizontal: responsiveSpacing.md,
  },
  spinnerButton: {
    paddingHorizontal: responsiveSpacing.sm,
    paddingVertical: responsiveSpacing.xs,
  },
  spinnerButtonText: {
    color: theme.colors.accent.primary,
    fontSize: normalize(24),
    fontWeight: '600',
  },
  spinnerValue: {
    color: theme.colors.text.primary,
    fontSize: normalize(32),
    fontWeight: '700',
    textAlign: 'center',
    minWidth: normalize(60),
  },
  colonText: {
    color: theme.colors.text.primary,
    fontSize: normalize(32),
    fontWeight: '700',
    marginBottom: responsiveSpacing.md,
  },
  readout: {
    alignItems: 'center',
    backgroundColor: theme.colors.glass.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: responsiveSpacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  readoutText: {
    color: theme.colors.accent.primary,
    fontSize: normalize(24),
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: responsiveSpacing.md,
  },
  button: {
    flex: 1,
  },
});
