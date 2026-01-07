/**
 * Platform-agnostic storage interface
 * Implemented by AsyncStorage (Android) and IndexedDB/localStorage (Web)
 */
export interface IStorage {
  /**
   * Get item from storage
   */
  getItem<T = any>(key: string): Promise<T | null>;

  /**
   * Set item in storage
   */
  setItem<T = any>(key: string, value: T): Promise<void>;

  /**
   * Remove item from storage
   */
  removeItem(key: string): Promise<void>;

  /**
   * Get all keys in storage
   */
  getAllKeys(): Promise<string[]>;

  /**
   * Get multiple items at once
   */
  multiGet(keys: string[]): Promise<Record<string, any>>;

  /**
   * Set multiple items at once
   */
  multiSet(keyValuePairs: Record<string, any>): Promise<void>;

  /**
   * Remove multiple items at once
   */
  multiRemove(keys: string[]): Promise<void>;

  /**
   * Clear all items from storage
   */
  clear(): Promise<void>;
}
