import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  StatusBar,
  Platform,
} from 'react-native';
import { normalize, responsiveSpacing, getSafePadding } from '../../../shared/utils/responsive';
import { useNotesStore } from '../store/notesStore';
import { useRemindersStore } from '../../reminders/store/remindersStore';
import { NoteCard } from '../components/NoteCard';
import { GlassButton, GlassModal, ConfirmDialog, useFlashMessage } from '../../../shared/components';
import { NoteEditor } from '../components/NoteEditor';
import { Note, NoteAttachment, CodeBlock } from '../../../domain/models/Note';
import { ReminderSchedule } from '../../../domain/models/Reminder';
import { theme } from '../../../shared/theme/tokens';
import { generateUUID } from '../../../shared/utils/uuid';

export const NotesListScreen: React.FC = () => {
  const {
    loadNotes,
    createNote,
    updateNote,
    deleteNote,
    pinNote,
    unpinNote,
    setFilters,
    getFilteredNotes,
  } = useNotesStore();

  const {
    loadReminders,
    createReminder,
    updateReminder,
    deleteReminder,
  } = useRemindersStore();

  const { isVisible: isFlashVisible } = useFlashMessage();

  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

  const filteredNotes = getFilteredNotes();

  useEffect(() => {
    loadNotes();
    loadReminders();
  }, []);

  useEffect(() => {
    setFilters({ searchQuery });
  }, [searchQuery]);

  const handleCreateNote = () => {
    setSelectedNote(undefined);
    setIsEditorVisible(true);
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setIsEditorVisible(true);
  };

  const handleSaveNote = async (
    title: string,
    content: string,
    attachments: NoteAttachment[],
    codeBlocks: CodeBlock[],
    reminderSchedules?: ReminderSchedule[],
    isReminderDisabled?: boolean
  ) => {
    let noteId: string;
    const countdownDuration = 60; // Default 60 seconds

    if (selectedNote) {
      // Update existing note
      await updateNote(selectedNote.id, { title, content, attachments, codeBlocks });
      noteId = selectedNote.id;

      // Handle reminder updates
      if (selectedNote.reminderId && reminderSchedules && reminderSchedules.length > 0) {
        // Update existing reminder
        await updateReminder(selectedNote.reminderId, {
          isDisabled: isReminderDisabled || false,
          schedules: reminderSchedules,
        });
      } else if (selectedNote.reminderId && (!reminderSchedules || reminderSchedules.length === 0)) {
        // Remove reminder if schedules cleared
        await deleteReminder(selectedNote.reminderId);
        await updateNote(selectedNote.id, { reminderId: undefined });
      } else if (!selectedNote.reminderId && reminderSchedules && reminderSchedules.length > 0) {
        // Create new reminder for existing note
        const reminder = await createReminder(selectedNote.id, reminderSchedules, countdownDuration);
        await updateNote(selectedNote.id, { reminderId: reminder.id });
      }
    } else {
      // Create new note
      const note = await createNote(title, content);
      noteId = note.id;

      // Update with attachments and code blocks
      if (attachments.length > 0 || codeBlocks.length > 0) {
        await updateNote(note.id, { attachments, codeBlocks });
      }

      // Create reminder if schedules provided
      if (reminderSchedules && reminderSchedules.length > 0) {
        const reminder = await createReminder(note.id, reminderSchedules, countdownDuration);
        await updateNote(note.id, { reminderId: reminder.id });
      }
    }

    setIsEditorVisible(false);
    setSelectedNote(undefined);
  };

  const handlePinToggle = async (note: Note) => {
    if (note.isPinned) {
      await unpinNote(note.id);
    } else {
      await pinNote(note.id);
    }
  };

  const handleDeleteNote = (note: Note) => {
    setNoteToDelete(note);
    setDeleteConfirmVisible(true);
  };

  const confirmDelete = async () => {
    if (noteToDelete) {
      // Delete associated reminder if exists
      if (noteToDelete.reminderId) {
        await deleteReminder(noteToDelete.reminderId);
      }
      // Soft delete the note
      await deleteNote(noteToDelete.id);
      setNoteToDelete(null);
      setDeleteConfirmVisible(false);
    }
  };

  const safePadding = getSafePadding();

  return (
    <>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background.primary} />

      <View style={[styles.safeArea, { paddingTop: safePadding.top }]}>
        {/* Large Title Header (matching snapshot) */}
        <View style={styles.header}>
          <Text style={styles.title}>BlinkBrain</Text>
        </View>

        {/* Search Bar */}
        {!isFlashVisible && (
          <View style={styles.searchContainer}>
            <View style={styles.searchWrapper}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search notes..."
                placeholderTextColor={theme.colors.text.tertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>
        )}

        {/* Notes List */}
        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NoteCard
              note={item}
              onPress={() => handleEditNote(item)}
              onPinToggle={() => handlePinToggle(item)}
              onDelete={() => handleDeleteNote(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyText}>No notes yet</Text>
              <Text style={styles.emptySubtext}>
                Tap the + button to create your first note
              </Text>
            </View>
          }
        />

        {/* Floating Action Button (matching snapshot's bottom nav style) */}
        {!isFlashVisible && (
          <View style={styles.fabContainer}>
            <Pressable 
              style={styles.fab}
              onPress={handleCreateNote}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              android_ripple={{ color: 'rgba(255,255,255,0.3)' }}
            >
              <Text style={styles.fabIcon}>+</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Editor Modal */}
      <GlassModal
        visible={isEditorVisible}
        onClose={() => {
          setIsEditorVisible(false);
          setSelectedNote(undefined);
        }}
      >
        <NoteEditor
          note={selectedNote}
          onSave={handleSaveNote}
          onCancel={() => {
            setIsEditorVisible(false);
            setSelectedNote(undefined);
          }}
        />
      </GlassModal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
          visible={deleteConfirmVisible}
          title="Delete Note?"
          message={`Are you sure you want to delete "${noteToDelete?.title}"? This note will be moved to trash and can be recovered within 30 days.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          onConfirm={confirmDelete}
          onCancel={() => {
            setDeleteConfirmVisible(false);
            setNoteToDelete(null);
          }}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: responsiveSpacing.lg,
    paddingTop: responsiveSpacing.xl,
    paddingBottom: responsiveSpacing.sm,
    marginTop: responsiveSpacing.md,
  },
  title: {
    color: theme.colors.text.primary,
    fontSize: normalize(42),
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  searchContainer: {
    paddingHorizontal: responsiveSpacing.lg,
    paddingVertical: responsiveSpacing.md,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.glass.primary,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: responsiveSpacing.md,
    paddingVertical: responsiveSpacing.sm,
    ...theme.shadows.sm,
  },
  searchIcon: {
    fontSize: normalize(18),
    marginRight: responsiveSpacing.sm,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text.primary,
    fontSize: normalize(16),
    padding: responsiveSpacing.sm,
  },
  listContent: {
    paddingHorizontal: responsiveSpacing.lg,
    paddingBottom: normalize(100), // Space for FAB
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: responsiveSpacing.xxxl * 2,
  },
  emptyIcon: {
    fontSize: normalize(64),
    marginBottom: responsiveSpacing.lg,
  },
  emptyText: {
    color: theme.colors.text.primary,
    fontSize: normalize(20),
    fontWeight: '600',
    marginBottom: responsiveSpacing.sm,
  },
  emptySubtext: {
    color: theme.colors.text.tertiary,
    fontSize: normalize(16),
    textAlign: 'center',
    paddingHorizontal: responsiveSpacing.xl,
  },
  // Floating Action Button (matching snapshot's style)
  fabContainer: {
    position: 'absolute',
    bottom: responsiveSpacing.xl,
    right: responsiveSpacing.lg,
    left: responsiveSpacing.lg,
    alignItems: 'center',
  },
  fab: {
    backgroundColor: theme.colors.text.primary,
    width: normalize(64),
    height: normalize(64),
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.lg,
  },
  fabIcon: {
    color: theme.colors.background.primary,
    fontSize: normalize(32),
    fontWeight: '300',
  },
});
