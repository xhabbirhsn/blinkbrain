import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Platform } from 'react-native';
import { Note } from '../../../domain/models/Note';
import { theme } from '../../../shared/theme/tokens';
import { PlatformBlurView } from '../../../shared/components/PlatformBlurView';
import { normalize, responsiveSpacing } from '../../../shared/utils/responsive';

interface NoteCardProps {
  note: Note;
  onPress: () => void;
  onPinToggle: () => void;
  onDelete?: () => void;
}

// Pastel colors matching the snapshot design
const CARD_COLORS = [
  theme.colors.cardColors.purple,
  theme.colors.cardColors.yellow,
  theme.colors.cardColors.green,
  theme.colors.cardColors.peach,
  theme.colors.cardColors.blue,
  theme.colors.cardColors.pink,
];

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onPress,
  onPinToggle,
  onDelete,
}) => {
  const hasAttachments = note.attachments.length > 0;
  const hasCodeBlocks = note.codeBlocks.length > 0;
  const hasReminder = !!note.reminderId;

  // Assign consistent color based on note ID
  const cardColor = useMemo(() => {
    const hash = note.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return CARD_COLORS[hash % CARD_COLORS.length];
  }, [note.id]);

  return (
    <Pressable 
      onPress={onPress} 
      style={[styles.cardContainer, { backgroundColor: cardColor }]}
      android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
    >
      {/* Frosted glass overlay */}
      <PlatformBlurView
        intensity={Platform.OS === 'web' ? 0 : 25}
        tint="light"
        style={styles.glassOverlay}
      >
        <View style={styles.cardContent}>
          {/* Header with title and pin */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {note.title || 'Untitled Note'}
              </Text>
              {note.isPinned && <Text style={styles.pinBadge}>📌</Text>}
            </View>
          </View>

          {/* Content preview */}
          {note.content && (
            <Text style={styles.contentText} numberOfLines={2}>
              {note.content}
            </Text>
          )}

          {/* Image thumbnail if available */}
          {hasAttachments && note.attachments[0].type === 'image' && (
            <Image
              source={{ uri: note.attachments[0].uri }}
              style={styles.thumbnail}
              resizeMode="cover"
              resizeMethod="resize"
              fadeDuration={0}
            />
          )}

          {/* Footer with metadata */}
          <View style={styles.footer}>
            <View style={styles.badges}>
              {hasCodeBlocks && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{'</>'}</Text>
                </View>
              )}
              {hasReminder && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>🔔</Text>
                </View>
              )}
              {hasAttachments && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>📎 {note.attachments.length}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.actions}>
              {onDelete && (
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  style={styles.actionButton}
                >
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </Pressable>
              )}
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  onPinToggle();
                }}
                style={styles.actionButton}
              >
                <Text style={styles.actionIcon}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </PlatformBlurView>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: theme.borderRadius.xl,
    marginBottom: responsiveSpacing.md,
    minHeight: normalize(160),
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  glassOverlay: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      // @ts-ignore - CSS properties for web
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
    }),
  },
  cardContent: {
    flex: 1,
    padding: responsiveSpacing.lg,
  },
  header: {
    marginBottom: responsiveSpacing.sm,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsiveSpacing.sm,
  },
  title: {
    flex: 1,
    color: theme.colors.text.primary,
    fontSize: normalize(20),
    fontWeight: '700',
  },
  pinBadge: {
    fontSize: normalize(16),
  },
  contentText: {
    color: theme.colors.text.secondary,
    fontSize: normalize(16),
    lineHeight: normalize(16) * 1.4,
    marginBottom: responsiveSpacing.md,
  },
  thumbnail: {
    width: normalize(64),
    height: normalize(64),
    borderRadius: theme.borderRadius.md,
    marginBottom: responsiveSpacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  badges: {
    flexDirection: 'row',
    flex: 1,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: responsiveSpacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    marginRight: responsiveSpacing.xs,
  },
  badgeText: {
    color: theme.colors.text.primary,
    fontSize: normalize(12),
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: normalize(40),
    height: normalize(40),
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  actionIcon: {
    color: theme.colors.text.primary,
    fontSize: normalize(24),
    fontWeight: '400',
  },
  deleteIcon: {
    fontSize: normalize(18),
  },
});
