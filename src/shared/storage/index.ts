import { Platform } from 'react-native';
import { IStorage } from '../../domain/interfaces/IStorage';
import { AsyncStorageAdapter } from './AsyncStorageAdapter';
import { IndexedDBAdapter } from './IndexedDBAdapter';

/**
 * Platform-agnostic storage factory
 * Returns AsyncStorage for native platforms, IndexedDB for web
 */
export const createStorage = (): IStorage => {
  if (Platform.OS === 'web') {
    return new IndexedDBAdapter();
  }
  return new AsyncStorageAdapter();
};

// Export singleton instance
export const storage = createStorage();

// Storage keys
export const STORAGE_KEYS = {
  NOTES: 'blinkbrain:notes',
  REMINDERS: 'blinkbrain:reminders',
  SETTINGS: 'blinkbrain:settings',
  LAST_SYNC: 'blinkbrain:last_sync',
} as const;
