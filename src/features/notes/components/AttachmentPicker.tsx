import React from 'react';
import { View, Image, StyleSheet, Pressable, Text, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { GlassButton } from '../../../shared/components';
import { NoteAttachment } from '../../../domain/models/Note';
import { theme } from '../../../shared/theme/tokens';
import { generateUUID } from '../../../shared/utils/uuid';

interface AttachmentPickerProps {
  attachments: NoteAttachment[];
  onAddAttachment: (attachment: NoteAttachment) => void;
  onRemoveAttachment: (attachmentId: string) => void;
}

export const AttachmentPicker: React.FC<AttachmentPickerProps> = ({
  attachments,
  onAddAttachment,
  onRemoveAttachment,
}) => {
  const pickImage = async () => {
    // Request permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      alert('Permission to access gallery is required!');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const attachment: NoteAttachment = {
        id: generateUUID(),
        type: 'image',
        uri: asset.uri,
        fileName: asset.fileName || 'image.jpg',
        mimeType: asset.mimeType,
        size: asset.fileSize,
        addedAt: Date.now(),
      };
      onAddAttachment(attachment);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Attachments</Text>
        <GlassButton onPress={pickImage} variant="secondary" size="sm">
          📎 Add Image
        </GlassButton>
      </View>

      {attachments.length > 0 && (
        <ScrollView horizontal style={styles.attachmentsList}>
          {attachments.map((attachment) => (
            <View key={attachment.id} style={styles.attachmentItem}>
              <Image
                source={{ uri: attachment.uri }}
                style={styles.thumbnail}
                resizeMode="cover"
                resizeMethod="resize"
                fadeDuration={0}
              />
              <Pressable
                onPress={() => onRemoveAttachment(attachment.id)}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  label: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
  },
  attachmentsList: {
    marginTop: theme.spacing.sm,
  },
  attachmentItem: {
    marginRight: theme.spacing.md,
    position: 'relative',
  },
  thumbnail: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.glass.secondary,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.colors.accent.error,
    borderRadius: theme.borderRadius.full,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  removeButtonText: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
  },
});
