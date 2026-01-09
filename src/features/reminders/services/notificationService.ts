import React from 'react';
import { Platform } from 'react-native';

/**
 * Platform-specific notification service
 * For Android: Uses Expo Notifications
 * For Web: Uses Browser Notifications API
 */
export const NotificationService = {
  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return this.requestWebPermissions();
    }
    return this.requestNativePermissions();
  },

  /**
   * Request native (Android) notification permissions
   */
  async requestNativePermissions(): Promise<boolean> {
    try {
      const Notifications = await import('expo-notifications');
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Failed to request native permissions:', error);
      return false;
    }
  },

  /**
   * Request web notification permissions
   */
  async requestWebPermissions(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported in this browser');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },

  /**
   * Schedule a notification
   */
  async scheduleNotification(
    title: string,
    body: string,
    triggerTime: number,
    data?: any
  ): Promise<string | null> {
    if (Platform.OS === 'web') {
      return this.scheduleWebNotification(title, body, triggerTime, data);
    }
    return this.scheduleNativeNotification(title, body, triggerTime, data);
  },

  /**
   * Schedule native notification
   */
  async scheduleNativeNotification(
    title: string,
    body: string,
    triggerTime: number,
    data?: any
  ): Promise<string | null> {
    try {
      const Notifications = await import('expo-notifications');
      // Ensure channel exists on Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
          sound: 'default',
        });
      }
      
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          priority: 'high' as any,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(triggerTime),
        },
      });
      
      return identifier;
    } catch (error) {
      console.error('Failed to schedule native notification:', error);
      return null;
    }
  },

  /**
   * Schedule web notification (using setTimeout for now, Service Worker in production)
   */
  async scheduleWebNotification(
    title: string,
    body: string,
    triggerTime: number,
    data?: any
  ): Promise<string | null> {
    const delay = triggerTime - Date.now();
    
    if (delay <= 0) {
      this.showWebNotification(title, body);
      return null;
    }

    const timeoutId = setTimeout(() => {
      this.showWebNotification(title, body, data);
    }, delay);

    return String(timeoutId);
  },

  /**
   * Show web notification immediately
   */
  showWebNotification(title: string, body: string, data?: any): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      console.warn('Cannot show notification: permission not granted');
      return;
    }

    new Notification(title, {
      body,
      icon: '/icon.png',
      badge: '/badge.png',
      data,
    });
  },

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(identifier: string): Promise<void> {
    if (Platform.OS === 'web') {
      clearTimeout(Number(identifier));
    } else {
      try {
        const Notifications = await import('expo-notifications');
        await Notifications.cancelScheduledNotificationAsync(identifier);
      } catch (error) {
        console.error('Failed to cancel notification:', error);
      }
    }
  },

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    if (Platform.OS === 'web') {
      // Web notifications are managed via Service Worker
      console.log('Cancelling all web notifications');
    } else {
      try {
        const Notifications = await import('expo-notifications');
        await Notifications.cancelAllScheduledNotificationsAsync();
      } catch (error) {
        console.error('Failed to cancel all notifications:', error);
      }
    }
  },
};

/**
 * Configure notification handlers for Android
 */
export const configureNativeNotifications = async () => {
  if (Platform.OS === 'web') return;

  try {
    const Notifications = await import('expo-notifications');
    
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        sound: 'default',
      });
    }
  } catch (error) {
    console.error('Failed to configure native notifications:', error);
  }
};
