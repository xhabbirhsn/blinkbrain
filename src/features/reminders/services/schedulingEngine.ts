import { Reminder, ReminderSchedule, ReminderType, DayOfWeek } from '../../../domain/models/Reminder';

/**
 * Calculate the next scheduled time for a reminder based on its schedules
 * Returns timestamp in milliseconds, or null if no valid schedule
 */
export const calculateNextScheduledTime = (reminder: Reminder): number | null => {
  if (reminder.isDisabled || reminder.schedules.length === 0) {
    return null;
  }

  const now = Date.now();
  let nextTimes: number[] = [];

  // Calculate next time for each active schedule
  reminder.schedules
    .filter(schedule => schedule.isActive)
    .forEach(schedule => {
      const nextTime = calculateNextTimeForSchedule(schedule, now);
      if (nextTime) {
        nextTimes.push(nextTime);
      }
    });

  if (nextTimes.length === 0) {
    return null;
  }

  // Return the earliest next time
  return Math.min(...nextTimes);
};

/**
 * Calculate next time for a specific schedule
 */
const calculateNextTimeForSchedule = (
  schedule: ReminderSchedule,
  fromTime: number
): number | null => {
  switch (schedule.type) {
    case 'once':
      return calculateOnce(schedule, fromTime);
    case 'hourly':
      return calculateHourly(schedule, fromTime);
    case 'daily':
      return calculateDaily(schedule, fromTime);
    case 'specific-time':
      return calculateSpecificTime(schedule, fromTime);
    case 'weekly':
      return calculateWeekly(schedule, fromTime);
    case 'alternate-day':
      return calculateAlternateDay(schedule, fromTime);
    default:
      return null;
  }
};

/**
 * One-time reminder - only if in the future
 */
const calculateOnce = (schedule: ReminderSchedule, fromTime: number): number | null => {
  if (!schedule.startDate) return null;
  return schedule.startDate > fromTime ? schedule.startDate : null;
};

/**
 * Hourly reminder - next hour mark
 */
const calculateHourly = (schedule: ReminderSchedule, fromTime: number): number | null => {
  const hour = schedule.hour || 1; // Default to every 1 hour
  const nextTime = new Date(fromTime);
  nextTime.setMinutes(0, 0, 0);
  nextTime.setHours(nextTime.getHours() + hour);
  return nextTime.getTime();
};

/**
 * Daily reminder at specific time
 */
const calculateDaily = (schedule: ReminderSchedule, fromTime: number): number | null => {
  if (!schedule.time) return null;

  const [hours, minutes] = schedule.time.split(':').map(Number);
  const nextTime = new Date(fromTime);
  nextTime.setHours(hours, minutes, 0, 0);

  // If time has passed today, schedule for tomorrow
  if (nextTime.getTime() <= fromTime) {
    nextTime.setDate(nextTime.getDate() + 1);
  }

  return nextTime.getTime();
};

/**
 * Specific time reminder
 */
const calculateSpecificTime = (schedule: ReminderSchedule, fromTime: number): number | null => {
  if (!schedule.time || !schedule.startDate) return null;

  const [hours, minutes] = schedule.time.split(':').map(Number);
  const nextTime = new Date(schedule.startDate);
  nextTime.setHours(hours, minutes, 0, 0);

  return nextTime.getTime() > fromTime ? nextTime.getTime() : null;
};

/**
 * Weekly reminder on specific days
 */
const calculateWeekly = (schedule: ReminderSchedule, fromTime: number): number | null => {
  if (!schedule.time || !schedule.daysOfWeek || schedule.daysOfWeek.length === 0) {
    return null;
  }

  const [hours, minutes] = schedule.time.split(':').map(Number);
  const now = new Date(fromTime);
  const currentDay = now.getDay() as DayOfWeek;

  // Find next occurrence
  for (let i = 0; i < 7; i++) {
    const nextDate = new Date(fromTime);
    nextDate.setDate(nextDate.getDate() + i);
    nextDate.setHours(hours, minutes, 0, 0);
    
    const nextDay = nextDate.getDay() as DayOfWeek;
    
    if (schedule.daysOfWeek.includes(nextDay) && nextDate.getTime() > fromTime) {
      return nextDate.getTime();
    }
  }

  return null;
};

/**
 * Alternate day reminder
 */
const calculateAlternateDay = (schedule: ReminderSchedule, fromTime: number): number | null => {
  if (!schedule.time || !schedule.startDate) return null;

  const [hours, minutes] = schedule.time.split(':').map(Number);
  const startDate = new Date(schedule.startDate);
  startDate.setHours(hours, minutes, 0, 0);

  const daysSinceStart = Math.floor((fromTime - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate next occurrence (every 2 days)
  const daysUntilNext = daysSinceStart % 2 === 0 ? 0 : 1;
  const nextTime = new Date(fromTime);
  nextTime.setDate(nextTime.getDate() + daysUntilNext);
  nextTime.setHours(hours, minutes, 0, 0);

  if (nextTime.getTime() <= fromTime) {
    nextTime.setDate(nextTime.getDate() + 2);
  }

  return nextTime.getTime();
};

/**
 * Get the highest priority schedule that should trigger next
 */
export const getActivePrioritySchedule = (reminder: Reminder): ReminderSchedule | null => {
  if (reminder.isDisabled || reminder.schedules.length === 0) {
    return null;
  }

  const activeSchedules = reminder.schedules
    .filter(schedule => schedule.isActive)
    .sort((a, b) => b.priority - a.priority);

  return activeSchedules[0] || null;
};

/**
 * Check if a reminder should trigger now
 */
export const shouldTriggerReminder = (reminder: Reminder, currentTime: number): boolean => {
  if (!reminder.nextScheduled) return false;
  
  // Trigger if scheduled time has passed and within 1 minute window
  const timeDiff = currentTime - reminder.nextScheduled;
  return timeDiff >= 0 && timeDiff < 60000; // 1 minute window
};
