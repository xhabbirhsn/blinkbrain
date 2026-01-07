import { create } from 'zustand';
import { Reminder, ReminderSchedule } from '../../../domain/models/Reminder';
import { storage, STORAGE_KEYS } from '../../../shared/storage';
import { generateUUID } from '../../../shared/utils/uuid';
import { calculateNextScheduledTime } from '../services/schedulingEngine';

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
      const reminders = await storage.getItem<Reminder[]>(STORAGE_KEYS.REMINDERS);
      set({ reminders: reminders || [], isLoading: false });
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

    const reminders = [...get().reminders, newReminder];
    await storage.setItem(STORAGE_KEYS.REMINDERS, reminders);
    set({ reminders });

    return newReminder;
  },

  updateReminder: async (id: string, updates: Partial<Reminder>) => {
    const reminders = get().reminders.map(reminder => {
      if (reminder.id === id) {
        const updated = { ...reminder, ...updates, updatedAt: Date.now() };
        // Recalculate next scheduled time if schedules changed
        if (updates.schedules || updates.isDisabled !== undefined) {
          updated.nextScheduled = calculateNextScheduledTime(updated) || undefined;
        }
        return updated;
      }
      return reminder;
    });

    await storage.setItem(STORAGE_KEYS.REMINDERS, reminders);
    set({ reminders });
  },

  deleteReminder: async (id: string) => {
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
    const reminders = get().reminders.map(reminder => {
      if (reminder.id === reminderId) {
        const updated = {
          ...reminder,
          schedules: [...reminder.schedules, schedule],
          updatedAt: Date.now(),
        };
        updated.nextScheduled = calculateNextScheduledTime(updated) || undefined;
        return updated;
      }
      return reminder;
    });

    await storage.setItem(STORAGE_KEYS.REMINDERS, reminders);
    set({ reminders });
  },

  removeSchedule: async (reminderId: string, scheduleId: string) => {
    const reminders = get().reminders.map(reminder => {
      if (reminder.id === reminderId) {
        const updated = {
          ...reminder,
          schedules: reminder.schedules.filter(s => s.id !== scheduleId),
          updatedAt: Date.now(),
        };
        updated.nextScheduled = calculateNextScheduledTime(updated) || undefined;
        return updated;
      }
      return reminder;
    });

    await storage.setItem(STORAGE_KEYS.REMINDERS, reminders);
    set({ reminders });
  },

  updateSchedule: async (
    reminderId: string,
    scheduleId: string,
    updates: Partial<ReminderSchedule>
  ) => {
    const reminders = get().reminders.map(reminder => {
      if (reminder.id === reminderId) {
        const updated = {
          ...reminder,
          schedules: reminder.schedules.map(schedule =>
            schedule.id === scheduleId ? { ...schedule, ...updates } : schedule
          ),
          updatedAt: Date.now(),
        };
        updated.nextScheduled = calculateNextScheduledTime(updated) || undefined;
        return updated;
      }
      return reminder;
    });

    await storage.setItem(STORAGE_KEYS.REMINDERS, reminders);
    set({ reminders });
  },

  markAsTriggered: async (id: string) => {
    const reminders = get().reminders.map(reminder => {
      if (reminder.id === id) {
        const updated = {
          ...reminder,
          lastTriggered: Date.now(),
          updatedAt: Date.now(),
        };
        // Recalculate next scheduled time
        updated.nextScheduled = calculateNextScheduledTime(updated) || undefined;
        return updated;
      }
      return reminder;
    });

    await storage.setItem(STORAGE_KEYS.REMINDERS, reminders);
    set({ reminders });
  },

  getReminderByNoteId: (noteId: string) => {
    return get().reminders.find(reminder => reminder.noteId === noteId);
  },
}));
