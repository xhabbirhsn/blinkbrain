import { create } from 'zustand';
import { Reminder, ReminderSchedule } from '../../../domain/models/Reminder';
import { storage, STORAGE_KEYS } from '../../../shared/storage';
import { generateUUID } from '../../../shared/utils/uuid';
import { calculateNextScheduledTime } from '../services/schedulingEngine';
import { NotificationService } from '../services/notificationService';

interface RemindersState {
  reminders: Reminder[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadReminders: () => Promise<void>;
  createReminder: (
    noteId: string,
    schedules: ReminderSchedule[],
    countdownDuration: number
  ) => Promise<Reminder>;
  updateReminder: (id: string, updates: Partial<Reminder>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  disableReminder: (id: string) => Promise<void>;
  enableReminder: (id: string) => Promise<void>;
  addSchedule: (reminderId: string, schedule: ReminderSchedule) => Promise<void>;
  removeSchedule: (reminderId: string, scheduleId: string) => Promise<void>;
  updateSchedule: (
    reminderId: string,
    scheduleId: string,
    updates: Partial<ReminderSchedule>
  ) => Promise<void>;
  markAsTriggered: (id: string) => Promise<void>;
  getReminderByNoteId: (noteId: string) => Reminder | undefined;
}

export const useRemindersStore = create<RemindersState>((set, get) => ({
  reminders: [],
  isLoading: false,
  error: null,

  loadReminders: async () => {
    set({ isLoading: true, error: null });
    try {
      const reminders = (await storage.getItem<Reminder[]>(STORAGE_KEYS.REMINDERS)) || [];
      // On load, ensure upcoming notifications are (re)scheduled
      const scheduled: Reminder[] = [];
      for (const r of reminders) {
        // Recompute next if missing
        const base: Reminder = {
          ...r,
          nextScheduled: r.nextScheduled ?? (calculateNextScheduledTime(r) || undefined),
        };
        scheduled.push(await scheduleForReminder(base));
      }
      await storage.setItem(STORAGE_KEYS.REMINDERS, scheduled);
      set({ reminders: scheduled, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load reminders',
        isLoading: false,
      });
    }
  },

  createReminder: async (noteId: string, schedules: ReminderSchedule[], countdownDuration: number) => {
    const newReminder: Reminder = {
      id: generateUUID(),
      noteId,
      schedules,
      countdownDuration,
      isDisabled: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Calculate next scheduled time
    newReminder.nextScheduled = calculateNextScheduledTime(newReminder) || undefined;

    // Schedule notification if applicable
    const scheduled = await scheduleForReminder(newReminder);

    const reminders = [...get().reminders, scheduled];
    await storage.setItem(STORAGE_KEYS.REMINDERS, reminders);
    set({ reminders });

    return scheduled;
  },

  updateReminder: async (id: string, updates: Partial<Reminder>) => {
    const reminders = get().reminders.slice();
    const idx = reminders.findIndex(r => r.id === id);
    if (idx === -1) return;

    let updated: Reminder = { ...reminders[idx], ...updates, updatedAt: Date.now() };
    if (updates.schedules || updates.isDisabled !== undefined) {
      updated.nextScheduled = calculateNextScheduledTime(updated) || undefined;
    }
    updated = await scheduleForReminder(updated);
    reminders[idx] = updated;

    await storage.setItem(STORAGE_KEYS.REMINDERS, reminders);
    set({ reminders });
  },

  deleteReminder: async (id: string) => {
    const current = get().reminders.find(r => r.id === id);
    if (current?.scheduledNotificationId) {
      try { await NotificationService.cancelNotification(current.scheduledNotificationId); } catch {}
    }
    const reminders = get().reminders.filter(reminder => reminder.id !== id);
    await storage.setItem(STORAGE_KEYS.REMINDERS, reminders);
    set({ reminders });
  },

  disableReminder: async (id: string) => {
    await get().updateReminder(id, { isDisabled: true });
  },

  enableReminder: async (id: string) => {
    await get().updateReminder(id, { isDisabled: false });
  },

  addSchedule: async (reminderId: string, schedule: ReminderSchedule) => {
    const reminders = get().reminders.slice();
    const idx = reminders.findIndex(r => r.id === reminderId);
    if (idx === -1) return;
    let updated: Reminder = {
      ...reminders[idx],
      schedules: [...reminders[idx].schedules, schedule],
      updatedAt: Date.now(),
    };
    updated.nextScheduled = calculateNextScheduledTime(updated) || undefined;
    updated = await scheduleForReminder(updated);
    reminders[idx] = updated;
    await storage.setItem(STORAGE_KEYS.REMINDERS, reminders);
    set({ reminders });
  },

  removeSchedule: async (reminderId: string, scheduleId: string) => {
    const reminders = get().reminders.slice();
    const idx = reminders.findIndex(r => r.id === reminderId);
    if (idx === -1) return;
    let updated: Reminder = {
      ...reminders[idx],
      schedules: reminders[idx].schedules.filter(s => s.id !== scheduleId),
      updatedAt: Date.now(),
    };
    updated.nextScheduled = calculateNextScheduledTime(updated) || undefined;
    updated = await scheduleForReminder(updated);
    reminders[idx] = updated;
    await storage.setItem(STORAGE_KEYS.REMINDERS, reminders);
    set({ reminders });
  },

  updateSchedule: async (
    reminderId: string,
    scheduleId: string,
    updates: Partial<ReminderSchedule>
  ) => {
    const reminders = get().reminders.slice();
    const idx = reminders.findIndex(r => r.id === reminderId);
    if (idx === -1) return;
    let updated: Reminder = {
      ...reminders[idx],
      schedules: reminders[idx].schedules.map(schedule =>
        schedule.id === scheduleId ? { ...schedule, ...updates } : schedule
      ),
      updatedAt: Date.now(),
    };
    updated.nextScheduled = calculateNextScheduledTime(updated) || undefined;
    updated = await scheduleForReminder(updated);
    reminders[idx] = updated;
    await storage.setItem(STORAGE_KEYS.REMINDERS, reminders);
    set({ reminders });
  },

  markAsTriggered: async (id: string) => {
    const reminders = get().reminders.slice();
    const idx = reminders.findIndex(r => r.id === id);
    if (idx === -1) return;
    let updated: Reminder = {
      ...reminders[idx],
      lastTriggered: Date.now(),
      updatedAt: Date.now(),
    };
    updated.nextScheduled = calculateNextScheduledTime(updated) || undefined;
    updated = await scheduleForReminder(updated);
    reminders[idx] = updated;

    await storage.setItem(STORAGE_KEYS.REMINDERS, reminders);
    set({ reminders });
  },

  getReminderByNoteId: (noteId: string) => {
    return get().reminders.find(reminder => reminder.noteId === noteId);
  },
}));

// Helper: schedule or cancel the next notification for a reminder
async function scheduleForReminder(reminder: Reminder): Promise<Reminder> {
  try {
    // Cancel any previously scheduled notification for this reminder
    if (reminder.scheduledNotificationId) {
      await NotificationService.cancelNotification(reminder.scheduledNotificationId);
    }

    if (reminder.isDisabled || !reminder.nextScheduled) {
      return { ...reminder, scheduledNotificationId: undefined };
    }

    // Fetch note data for notification
    const notes = await storage.getItem(STORAGE_KEYS.NOTES) || [];
    const note = notes.find((n: any) => n.id === reminder.noteId);
    
    const title = note?.title || 'Reminder';
    const body = note?.content || 'One of your notes is due now.';
    const identifier = await NotificationService.scheduleNotification(
      title,
      body,
      reminder.nextScheduled,
      { 
        reminderId: reminder.id, 
        noteId: reminder.noteId,
        countdownDuration: reminder.countdownDuration,
        noteTitle: note?.title,
        noteContent: note?.content,
        attachments: JSON.stringify(note?.attachments || []),
        codeBlocks: JSON.stringify(note?.codeBlocks || []),
      }
    );
    return { ...reminder, scheduledNotificationId: identifier ?? undefined };
  } catch (e) {
    console.error('Failed to schedule reminder notification', e);
    return { ...reminder, scheduledNotificationId: undefined };
  }
}
