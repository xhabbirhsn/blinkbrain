import AsyncStorage from '@react-native-async-storage/async-storage';
import { IStorage } from '../../domain/interfaces/IStorage';

/**
 * AsyncStorage adapter for Android/iOS
 */
export class AsyncStorageAdapter implements IStorage {
  async getItem<T = any>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`AsyncStorage getItem error for key ${key}:`, error);
      return null;
    }
  }

  async setItem<T = any>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`AsyncStorage setItem error for key ${key}:`, error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`AsyncStorage removeItem error for key ${key}:`, error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return [...keys];
    } catch (error) {
      console.error('AsyncStorage getAllKeys error:', error);
      return [];
    }
  }

  async multiGet(keys: string[]): Promise<Record<string, any>> {
    try {
      const pairs = await AsyncStorage.multiGet(keys);
      const result: Record<string, any> = {};
      
      pairs.forEach(([key, value]) => {
        if (value) {
          try {
            result[key] = JSON.parse(value);
          } catch {
            result[key] = value;
          }
        }
      });
      
      return result;
    } catch (error) {
      console.error('AsyncStorage multiGet error:', error);
      return {};
    }
  }

  async multiSet(keyValuePairs: Record<string, any>): Promise<void> {
    try {
      const pairs: [string, string][] = Object.entries(keyValuePairs).map(([key, value]) => [
        key,
        JSON.stringify(value),
      ]);
      await AsyncStorage.multiSet(pairs);
    } catch (error) {
      console.error('AsyncStorage multiSet error:', error);
      throw error;
    }
  }

  async multiRemove(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('AsyncStorage multiRemove error:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('AsyncStorage clear error:', error);
      throw error;
    }
  }
}
