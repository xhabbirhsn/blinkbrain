export type ReminderType = 
  | 'once' 
  | 'daily' 
  | 'hourly' 
  | 'specific-time' 
  | 'weekly' 
  | 'alternate-day';

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday

export interface ReminderSchedule {
  id: string;
  type: ReminderType;
  time?: string; // HH:mm format for specific-time
  hour?: number; // For hourly reminders
  daysOfWeek?: DayOfWeek[]; // For weekly reminders
  startDate?: number; // Timestamp for alternate-day
  priority: number; // Higher number = higher priority when multiple schedules
  isActive: boolean;
}

export interface Reminder {
  id: string;
  noteId: string;
  schedules: ReminderSchedule[];
  countdownDuration: number; // seconds
  isDisabled: boolean;
  lastTriggered?: number;
  nextScheduled?: number;
  scheduledNotificationId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ReminderNotification {
  id: string;
  reminderId: string;
  noteId: string;
  noteTitle: string;
  noteContent: string;
  triggeredAt: number;
  countdownEndsAt: number;
  isDismissed: boolean;
}
