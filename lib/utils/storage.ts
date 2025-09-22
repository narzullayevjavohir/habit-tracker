// LocalStorage and SessionStorage utilities for offline capabilities

export class StorageManager {
  private static instance: StorageManager;
  private isClient = typeof window !== "undefined";

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  // LocalStorage methods
  setLocalItem(key: string, value: any): void {
    if (!this.isClient) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }

  getLocalItem<T>(key: string, defaultValue?: T): T | null {
    if (!this.isClient) return defaultValue || null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return defaultValue || null;
    }
  }

  removeLocalItem(key: string): void {
    if (!this.isClient) return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing from localStorage:", error);
    }
  }

  clearLocalStorage(): void {
    if (!this.isClient) return;
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  }

  // SessionStorage methods
  setSessionItem(key: string, value: any): void {
    if (!this.isClient) return;
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving to sessionStorage:", error);
    }
  }

  getSessionItem<T>(key: string, defaultValue?: T): T | null {
    if (!this.isClient) return defaultValue || null;
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error("Error reading from sessionStorage:", error);
      return defaultValue || null;
    }
  }

  removeSessionItem(key: string): void {
    if (!this.isClient) return;
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing from sessionStorage:", error);
    }
  }

  clearSessionStorage(): void {
    if (!this.isClient) return;
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error("Error clearing sessionStorage:", error);
    }
  }

  // Habit-specific storage methods
  saveHabits(habits: any[]): void {
    this.setLocalItem("habits", habits);
  }

  getHabits(): any[] {
    return this.getLocalItem("habits", []);
  }

  saveHabitEntries(entries: any[]): void {
    this.setLocalItem("habit_entries", entries);
  }

  getHabitEntries(): any[] {
    return this.getLocalItem("habit_entries", []);
  }

  saveUserPreferences(preferences: any): void {
    this.setLocalItem("user_preferences", preferences);
  }

  getUserPreferences(): any {
    return this.getLocalItem("user_preferences", {});
  }

  // Offline sync methods
  getOfflineData(): any {
    return {
      habits: this.getHabits(),
      entries: this.getHabitEntries(),
      preferences: this.getUserPreferences(),
      lastSync: this.getLocalItem("last_sync"),
    };
  }

  setLastSync(timestamp: string): void {
    this.setLocalItem("last_sync", timestamp);
  }

  // Export/Import functionality
  exportData(): string {
    const data = this.getOfflineData();
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.habits) this.saveHabits(data.habits);
      if (data.entries) this.saveHabitEntries(data.entries);
      if (data.preferences) this.saveUserPreferences(data.preferences);
      if (data.lastSync) this.setLastSync(data.lastSync);
      return true;
    } catch (error) {
      console.error("Error importing data:", error);
      return false;
    }
  }
}

// Export singleton instance
export const storage = StorageManager.getInstance();

// Convenience functions
export const saveHabits = (habits: any[]) => storage.saveHabits(habits);
export const getHabits = () => storage.getHabits();
export const saveHabitEntries = (entries: any[]) =>
  storage.saveHabitEntries(entries);
export const getHabitEntries = () => storage.getHabitEntries();
export const saveUserPreferences = (preferences: any) =>
  storage.saveUserPreferences(preferences);
export const getUserPreferences = () => storage.getUserPreferences();
export const exportData = () => storage.exportData();
export const importData = (jsonData: string) => storage.importData(jsonData);

