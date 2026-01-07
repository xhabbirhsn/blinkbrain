import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { GlassInput, GlassButton } from '../../../shared/components';
import { AttachmentPicker } from './AttachmentPicker';
import { CodeBlockEditor } from './CodeBlockEditor';
import { ReminderPicker } from './ReminderPicker';
import { Note, NoteAttachment, CodeBlock } from '../../../domain/models/Note';
import { ReminderSchedule } from '../../../domain/models/Reminder';
import { useRemindersStore } from '../../reminders/store/remindersStore';
import { theme } from '../../../shared/theme/tokens';

interface NoteEditorProps {
  note?: Note;
  onSave: (
    title: string,
    content: string,
    attachments: NoteAttachment[],
    codeBlocks: CodeBlock[],
    reminderSchedules?: ReminderSchedule[],
    isReminderDisabled?: boolean
  ) => void;
  onCancel: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onSave,
  onCancel,
}) => {
  console.log('[NoteEditor] Rendering with note:', note?.id || 'new', 'reminderId:', note?.reminderId);
  
  const { reminders } = useRemindersStore();
  
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [attachments, setAttachments] = useState<NoteAttachment[]>(note?.attachments || []);
  const [codeBlocks, setCodeBlocks] = useState<CodeBlock[]>(note?.codeBlocks || []);
  const [reminderSchedules, setReminderSchedules] = useState<ReminderSchedule[]>([]);
  const [isReminderDisabled, setIsReminderDisabled] = useState(false);
  const [titleError, setTitleError] = useState('');

  // Load existing reminder schedules when editing a note
  useEffect(() => {
    if (note?.reminderId) {
      const existingReminder = reminders.find(r => r.id === note.reminderId);
      if (existingReminder) {
        console.log('[NoteEditor] Loading existing reminder:', existingReminder.id, 'schedules:', existingReminder.schedules.length);
        setReminderSchedules(existingReminder.schedules);
        setIsReminderDisabled(existingReminder.isDisabled);
      } else {
        console.warn('[NoteEditor] Reminder not found for reminderId:', note.reminderId);
      }
    }
  }, [note?.reminderId, reminders]);

  const handleSave = () => {
    console.log('[NoteEditor] Attempting to save note');
    if (!title.trim()) {
      setTitleError('Title is required');
      console.warn('[NoteEditor] Save failed: title required');
      return;
    }

    console.log('[NoteEditor] Saving with reminder schedules:', reminderSchedules.length);
    try {
    onSave(
      title.trim(),
      content.trim(),
      attachments,
      codeBlocks,
      reminderSchedules.length > 0 ? reminderSchedules : undefined,
      isReminderDisabled
    );
    console.log('[NoteEditor] Save successful');
    } catch (error) {
      console.error('[NoteEditor] Save error:', error);
    }
  };

  const handleAddAttachment = (attachment: NoteAttachment) => {
    setAttachments([...attachments, attachment]);
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments(attachments.filter(a => a.id !== attachmentId));
  };

  const handleAddCodeBlock = (codeBlock: CodeBlock) => {
    setCodeBlocks([...codeBlocks, codeBlock]);
  };

  const handleRemoveCodeBlock = (codeBlockId: string) => {
    setCodeBlocks(codeBlocks.filter(cb => cb.id !== codeBlockId));
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={true}
      keyboardShouldPersistTaps="handled"
      scrollEnabled={true}
    >
        <Text style={styles.heading}>
          {note ? 'Edit Note' : 'New Note'}
        </Text>

        <GlassInput
          label="Title"
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            if (titleError) setTitleError('');
          }}
          placeholder="Enter note title..."
          error={titleError}
          autoFocus={!note}
        />

        <GlassInput
          label="Content"
          value={content}
          onChangeText={setContent}
          placeholder="Write your note here..."
          multiline
          numberOfLines={10}
        />

        <AttachmentPicker
          attachments={attachments}
          onAddAttachment={handleAddAttachment}
          onRemoveAttachment={handleRemoveAttachment}
        />

        <CodeBlockEditor
          codeBlocks={codeBlocks}
          onAddCodeBlock={handleAddCodeBlock}
          onRemoveCodeBlock={handleRemoveCodeBlock}
        />

        <ReminderPicker
          reminderId={note?.reminderId}
          schedules={reminderSchedules}
          isReminderDisabled={isReminderDisabled}
          onSchedulesChange={setReminderSchedules}
          onReminderDisabledChange={setIsReminderDisabled}
        />

        <View style={styles.actions}>
          <GlassButton
            onPress={onCancel}
            variant="outline"
            style={styles.button}
          >
            Cancel
          </GlassButton>

          <View style={{ width: theme.spacing.md }} />

          <GlassButton
            onPress={handleSave}
            variant="primary"
            style={styles.button}
          >
            {note ? 'Update' : 'Create'}
          </GlassButton>
        </View>
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heading: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  button: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
});

