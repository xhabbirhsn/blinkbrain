import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { theme } from '../theme/tokens';

interface GlassInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  multiline?: boolean;
  numberOfLines?: number;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  label,
  error,
  containerStyle,
  multiline = false,
  numberOfLines = 1,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        <BlurView intensity={20} tint="dark" style={styles.blur}>
          <TextInput
            {...textInputProps}
            multiline={multiline}
            numberOfLines={multiline ? numberOfLines : 1}
            onFocus={(e) => {
              setIsFocused(true);
              textInputProps.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              textInputProps.onBlur?.(e);
            }}
            style={[
              styles.input,
              multiline && styles.inputMultiline,
              textInputProps.style,
            ]}
            placeholderTextColor={theme.colors.text.tertiary}
          />
        </BlurView>
      </View>
      
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    marginBottom: theme.spacing.sm,
  },
  inputContainer: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.glass.primary,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  inputContainerFocused: {
    borderColor: theme.colors.accent.primary,
    ...theme.shadows.md,
  },
  inputContainerError: {
    borderColor: theme.colors.accent.error,
  },
  blur: {
    flex: 1,
  },
  input: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.sizes.md,
    padding: theme.spacing.md,
    minHeight: 48,
  },
  inputMultiline: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  error: {
    color: theme.colors.accent.error,
    fontSize: theme.typography.sizes.sm,
    marginTop: theme.spacing.sm,
  },
});
