import { get, set, del, keys, clear, entries, setMany, delMany } from 'idb-keyval';
import { IStorage } from '../../domain/interfaces/IStorage';

/**
 * IndexedDB adapter for Web with localStorage fallback
 */
export class IndexedDBAdapter implements IStorage {
  private useFallback = false;

  constructor() {
    // Check if IndexedDB is available
    if (typeof indexedDB === 'undefined') {
      console.warn('IndexedDB not available, falling back to localStorage');
      this.useFallback = true;
    }
  }

  async getItem<T = any>(key: string): Promise<T | null> {
    try {
      if (this.useFallback) {
        return this.localStorageGet(key);
      }
      const value = await get(key);
      return value ?? null;
    } catch (error) {
      console.error(`IndexedDB getItem error for key ${key}:`, error);
      return this.localStorageGet(key);
    }
  }

  async setItem<T = any>(key: string, value: T): Promise<void> {
    try {
      if (this.useFallback) {
        this.localStorageSet(key, value);
        return;
      }
      await set(key, value);
    } catch (error) {
      console.error(`IndexedDB setItem error for key ${key}:`, error);
      this.localStorageSet(key, value);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (this.useFallback) {
        localStorage.removeItem(key);
        return;
      }
      await del(key);
    } catch (error) {
      console.error(`IndexedDB removeItem error for key ${key}:`, error);
      localStorage.removeItem(key);
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      if (this.useFallback) {
        return Object.keys(localStorage);
      }
      const allKeys = await keys();
      return allKeys.map(String);
    } catch (error) {
      console.error('IndexedDB getAllKeys error:', error);
      return Object.keys(localStorage);
    }
  }

  async multiGet(keys: string[]): Promise<Record<string, any>> {
    try {
      if (this.useFallback) {
        const result: Record<string, any> = {};
        keys.forEach(key => {
          const value = this.localStorageGet(key);
          if (value !== null) {
            result[key] = value;
          }
        });
        return result;
      }

      const result: Record<string, any> = {};
      await Promise.all(
        keys.map(async (key) => {
          const value = await get(key);
          if (value !== undefined) {
            result[key] = value;
          }
        })
      );
      return result;
    } catch (error) {
      console.error('IndexedDB multiGet error:', error);
      return {};
    }
  }

  async multiSet(keyValuePairs: Record<string, any>): Promise<void> {
    try {
      if (this.useFallback) {
        Object.entries(keyValuePairs).forEach(([key, value]) => {
          this.localStorageSet(key, value);
        });
        return;
      }
      
      const entries: [string, any][] = Object.entries(keyValuePairs);
      await setMany(entries);
    } catch (error) {
      console.error('IndexedDB multiSet error:', error);
      Object.entries(keyValuePairs).forEach(([key, value]) => {
        this.localStorageSet(key, value);
      });
    }
  }

  async multiRemove(keys: string[]): Promise<void> {
    try {
      if (this.useFallback) {
        keys.forEach(key => localStorage.removeItem(key));
        return;
      }
      await delMany(keys);
    } catch (error) {
      console.error('IndexedDB multiRemove error:', error);
      keys.forEach(key => localStorage.removeItem(key));
    }
  }

  async clear(): Promise<void> {
    try {
      if (this.useFallback) {
        localStorage.clear();
        return;
      }
      await clear();
    } catch (error) {
      console.error('IndexedDB clear error:', error);
      localStorage.clear();
    }
  }

  // LocalStorage fallback helpers
  private localStorageGet<T>(key: string): T | null {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }

  private localStorageSet<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('localStorage setItem error:', error);
    }
  }
}
