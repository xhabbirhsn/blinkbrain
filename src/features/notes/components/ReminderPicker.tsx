import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Switch,
  ScrollView,
  Platform,
} from 'react-native';
import { GlassButton } from '../../../shared/components';
import { ReminderSchedule, ReminderType, DayOfWeek } from '../../../domain/models/Reminder';
import { theme } from '../../../shared/theme/tokens';
import { normalize, responsiveSpacing } from '../../../shared/utils/responsive';
import { generateUUID } from '../../../shared/utils/uuid';

interface ReminderPickerProps {
  reminderId?: string;
  schedules: ReminderSchedule[];
  isReminderDisabled: boolean;
  onSchedulesChange: (schedules: ReminderSchedule[]) => void;
  onReminderDisabledChange: (disabled: boolean) => void;
}

const SCHEDULE_TYPES: { value: ReminderType; label: string }[] = [
  { value: 'once', label: 'One Time' },
  { value: 'daily', label: 'Daily' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'specific-time', label: 'Specific Time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'alternate-day', label: 'Alternate Days' },
];

const DAYS: { value: DayOfWeek; label: string }[] = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export const ReminderPicker: React.FC<ReminderPickerProps> = ({
  reminderId,
  schedules,
  isReminderDisabled,
  onSchedulesChange,
  onReminderDisabledChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(!!reminderId);
  
  console.log('[ReminderPicker] Rendering with:', { 
    reminderId, 
    schedulesCount: schedules.length, 
    isReminderDisabled, 
    isExpanded 
  });
  const [editingSchedule, setEditingSchedule] = useState<ReminderSchedule | null>(null);
  const [scheduleType, setScheduleType] = useState<ReminderType>('once');
  const [reminderTime, setReminderTime] = useState(new Date());
  const [countdownDuration, setCountdownDuration] = useState(60);
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);
  const [intervalHours, setIntervalHours] = useState(1);

  const handleAddSchedule = () => {
    console.log('[ReminderPicker] Adding schedule:', { scheduleType, intervalHours, selectedDays });
    try {
    const newSchedule: ReminderSchedule = {
      id: generateUUID(),
      type: scheduleType,
      isActive: true,
      priority: schedules.length + 1,
      ...(scheduleType === 'daily' && { time: `${reminderTime.getHours()}:${reminderTime.getMinutes()}` }),
      ...(scheduleType === 'hourly' && { hour: intervalHours }),
      ...(scheduleType === 'specific-time' && { 
        time: `${reminderTime.getHours()}:${reminderTime.getMinutes()}` 
      }),
      ...(scheduleType === 'weekly' && { 
        daysOfWeek: selectedDays,
        time: `${reminderTime.getHours()}:${reminderTime.getMinutes()}` 
      }),
      ...(scheduleType === 'alternate-day' && { 
        startDate: reminderTime.getTime(),
        time: `${reminderTime.getHours()}:${reminderTime.getMinutes()}` 
      }),
    };

    onSchedulesChange([...schedules, newSchedule]);
    setEditingSchedule(null);
    console.log('[ReminderPicker] Schedule added successfully');
    } catch (error) {
      console.error('[ReminderPicker] Error adding schedule:', error);
    }
  };

  const handleRemoveSchedule = (scheduleId: string) => {
    onSchedulesChange(schedules.filter(s => s.id !== scheduleId));
  };

  const toggleDay = (day: DayOfWeek) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const formatSchedulePreview = (schedule: ReminderSchedule): string => {
    switch (schedule.type) {
      case 'once':
        return `One time reminder`;
      case 'daily':
        return `Daily at ${schedule.time}`;
      case 'hourly':
        return `Every ${schedule.hour} hour(s)`;
      case 'specific-time':
        return `At ${schedule.time}`;
      case 'weekly':
        const days = schedule.daysOfWeek?.map(d => DAYS[d].label).join(', ') || '';
        return `Weekly on ${days} at ${schedule.time}`;
      case 'alternate-day':
        return `Every other day at ${schedule.time}`;
      default:
        return 'Custom schedule';
    }
  };

  if (!isExpanded) {
    console.log('[ReminderPicker] Rendering COLLAPSED view');
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.label}>⏰ Reminder</Text>
          <GlassButton onPress={() => { console.log('[ReminderPicker] Expanding'); setIsExpanded(true); }} variant="secondary" size="sm">
            {reminderId ? 'Edit Reminder' : 'Add Reminder'}
          </GlassButton>
        </View>
        {reminderId && schedules.length > 0 && (
          <Text style={styles.previewText}>
            {`${schedules.length} schedule${schedules.length > 1 ? 's' : ''} configured`}
          </Text>
        )}
      </View>
    );
  }

  console.log('[ReminderPicker] Rendering EXPANDED view');
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>⏰ Reminder Configuration</Text>
        <Pressable onPress={() => { console.log('[ReminderPicker] Collapsing'); setIsExpanded(false); }}>
          <Text style={styles.collapseButton}>−</Text>
        </Pressable>
      </View>

      <View style={styles.expandedContent}>
        {/* Do Not Remind Me Toggle */}
        {reminderId && (
          <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>🔕 Do not remind me</Text>
          <Switch
            value={isReminderDisabled}
            onValueChange={onReminderDisabledChange}
            trackColor={{ false: theme.colors.border.subtle, true: theme.colors.accent.warning }}
            thumbColor={isReminderDisabled ? theme.colors.accent.error : theme.colors.glass.primary}
          />
        </View>
      )}

      {/* Schedule Type Selector */}
      <Text style={styles.sectionLabel}>Schedule Type</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.typeSelector}
        nestedScrollEnabled={false}
      >
        {SCHEDULE_TYPES.map(type => (
          <Pressable
            key={type.value}
            style={[
              styles.typeButton,
              scheduleType === type.value && styles.typeButtonActive,
            ]}
            onPress={() => setScheduleType(type.value)}
          >
            <Text
              style={[
                styles.typeButtonText,
                scheduleType === type.value && styles.typeButtonTextActive,
              ]}
            >
              {type.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Schedule Configuration */}
      <View style={styles.configSection}>
        {/* Time Picker */}
        {['once', 'daily', 'specific-time', 'weekly', 'alternate-day'].includes(scheduleType) && (
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Reminder Time</Text>
            <Pressable
              style={styles.timePicker}
              onPress={() => {
                const now = new Date();
                setReminderTime(now);
              }}
            >
              <Text style={styles.timeText}>
                {reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Hourly Interval */}
        {scheduleType === 'hourly' && (
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Every (hours)</Text>
            <View style={styles.numberInput}>
              <Pressable onPress={() => setIntervalHours(Math.max(1, intervalHours - 1))}>
                <Text style={styles.numberButton}>−</Text>
              </Pressable>
              <Text style={styles.numberValue}>{intervalHours}</Text>
              <Pressable onPress={() => setIntervalHours(Math.min(24, intervalHours + 1))}>
                <Text style={styles.numberButton}>+</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Day of Week Selector */}
        {scheduleType === 'weekly' && (
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Days of Week</Text>
            <View style={styles.daySelector}>
              {DAYS.map(day => (
                <Pressable
                  key={day.value}
                  style={[
                    styles.dayButton,
                    selectedDays.includes(day.value) && styles.dayButtonActive,
                  ]}
                  onPress={() => toggleDay(day.value)}
                >
                  <Text
                    style={[
                      styles.dayButtonText,
                      selectedDays.includes(day.value) && styles.dayButtonTextActive,
                    ]}
                  >
                    {day.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Countdown Duration */}
        <View style={styles.configRow}>
          <Text style={styles.configLabel}>Countdown (seconds)</Text>
          <View style={styles.numberInput}>
            <Pressable onPress={() => setCountdownDuration(Math.max(10, countdownDuration - 10))}>
              <Text style={styles.numberButton}>−</Text>
            </Pressable>
              <Text style={styles.numberValue}>{`${countdownDuration}s`}</Text>
            <Pressable onPress={() => setCountdownDuration(Math.min(300, countdownDuration + 10))}>
              <Text style={styles.numberButton}>+</Text>
            </Pressable>
          </View>
        </View>

        {/* Reminder Preview */}
        <View style={styles.preview}>
          <Text style={styles.previewLabel}>📋 Preview</Text>
          <Text style={styles.previewText}>
            {scheduleType === 'once' && `Remind once at ${reminderTime.toLocaleString()}`}
            {scheduleType === 'daily' && `Remind daily at ${reminderTime.toLocaleTimeString()}`}
            {scheduleType === 'hourly' && `Remind every ${intervalHours} hour(s)`}
            {scheduleType === 'specific-time' && `Remind at ${reminderTime.toLocaleTimeString()}`}
            {scheduleType === 'weekly' &&
              `Remind on ${selectedDays.map(d => DAYS[d].label).join(', ')} at ${reminderTime.toLocaleTimeString()}`}
            {scheduleType === 'alternate-day' && `Remind every other day at ${reminderTime.toLocaleTimeString()}`}
          </Text>
          <Text style={styles.previewSubtext}>
            {`Countdown: ${countdownDuration} seconds with OK action`}
          </Text>
        </View>

        <GlassButton onPress={handleAddSchedule} variant="primary" size="sm">
          {`+ Add Schedule`}
        </GlassButton>
      </View>

      {/* Active Schedules List */}
      {schedules.length > 0 && (
        <View style={styles.schedulesList}>
          <Text style={styles.sectionLabel}>
            {`Active Schedules (${schedules.length})`}
          </Text>
          {schedules.map((schedule, index) => (
            <View key={schedule.id} style={styles.scheduleItem}>
              <View style={styles.scheduleInfo}>
                <Text style={styles.schedulePriority}>{`#${schedule.priority}`}</Text>
                <Text style={styles.scheduleText}>{formatSchedulePreview(schedule)}</Text>
              </View>
              <Pressable
                onPress={() => handleRemoveSchedule(schedule.id)}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: responsiveSpacing.md,
  },
  expandedContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveSpacing.sm,
  },
  label: {
    color: theme.colors.text.secondary,
    fontSize: normalize(14),
    fontWeight: '600',
  },
  collapseButton: {
    color: theme.colors.text.secondary,
    fontSize: normalize(24),
    fontWeight: '300',
  },
  previewText: {
    color: theme.colors.text.tertiary,
    fontSize: normalize(12),
    marginTop: responsiveSpacing.xs,
  },
  previewSubtext: {
    color: theme.colors.text.tertiary,
    fontSize: normalize(11),
    marginTop: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.glass.primary,
    padding: responsiveSpacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: responsiveSpacing.md,
  },
  toggleLabel: {
    color: theme.colors.text.primary,
    fontSize: normalize(14),
    fontWeight: '500',
  },
  sectionLabel: {
    color: theme.colors.text.primary,
    fontSize: normalize(13),
    fontWeight: '600',
    marginTop: responsiveSpacing.md,
    marginBottom: responsiveSpacing.sm,
  },
  typeSelector: {
    marginBottom: responsiveSpacing.md,
  },
  typeButton: {
    backgroundColor: theme.colors.glass.primary,
    paddingHorizontal: responsiveSpacing.md,
    paddingVertical: responsiveSpacing.sm,
    borderRadius: theme.borderRadius.md,
    marginRight: responsiveSpacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  typeButtonActive: {
    backgroundColor: theme.colors.accent.primary,
    borderColor: theme.colors.accent.primary,
  },
  typeButtonText: {
    color: theme.colors.text.secondary,
    fontSize: normalize(12),
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  configSection: {
    backgroundColor: theme.colors.glass.secondary,
    padding: responsiveSpacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: responsiveSpacing.md,
  },
  configRow: {
    marginBottom: responsiveSpacing.md,
  },
  configLabel: {
    color: theme.colors.text.secondary,
    fontSize: normalize(12),
    marginBottom: responsiveSpacing.xs,
  },
  timePicker: {
    backgroundColor: theme.colors.glass.primary,
    padding: responsiveSpacing.md,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  timeText: {
    color: theme.colors.text.primary,
    fontSize: normalize(16),
    fontWeight: '600',
    textAlign: 'center',
  },
  numberInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.glass.primary,
    padding: responsiveSpacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  numberButton: {
    color: theme.colors.accent.primary,
    fontSize: normalize(20),
    fontWeight: '600',
    paddingHorizontal: responsiveSpacing.md,
  },
  numberValue: {
    color: theme.colors.text.primary,
    fontSize: normalize(16),
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  daySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayButton: {
    backgroundColor: theme.colors.glass.primary,
    paddingHorizontal: responsiveSpacing.sm,
    paddingVertical: responsiveSpacing.xs,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    minWidth: normalize(40),
    alignItems: 'center',
    marginRight: responsiveSpacing.xs,
    marginBottom: responsiveSpacing.xs,
  },
  dayButtonActive: {
    backgroundColor: theme.colors.accent.primary,
    borderColor: theme.colors.accent.primary,
  },
  dayButtonText: {
    color: theme.colors.text.secondary,
    fontSize: normalize(11),
    fontWeight: '500',
  },
  dayButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  preview: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    padding: responsiveSpacing.md,
    borderRadius: theme.borderRadius.sm,
    marginBottom: responsiveSpacing.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent.primary,
  },
  previewLabel: {
    color: theme.colors.accent.primary,
    fontSize: normalize(12),
    fontWeight: '600',
    marginBottom: 4,
  },
  schedulesList: {
    marginTop: responsiveSpacing.md,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.glass.primary,
    padding: responsiveSpacing.md,
    borderRadius: theme.borderRadius.sm,
    marginBottom: responsiveSpacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  scheduleInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  schedulePriority: {
    color: theme.colors.accent.primary,
    fontSize: normalize(12),
    fontWeight: '700',
    marginRight: responsiveSpacing.sm,
    minWidth: normalize(24),
  },
  scheduleText: {
    color: theme.colors.text.primary,
    fontSize: normalize(13),
    flex: 1,
  },
  removeButton: {
    backgroundColor: theme.colors.accent.error,
    borderRadius: theme.borderRadius.full,
    width: normalize(24),
    height: normalize(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: normalize(14),
    fontWeight: '600',
  },
});
