interface StorageKeys {
  themeMode: 'light' | 'dark';
  geminiApiKey: string;
}

class StorageService {
  private prefix = 'quantum_file_';

  set<K extends keyof StorageKeys>(key: K, value: StorageKeys[K]): void {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key} to storage:`, error);
    }
  }

  get<K extends keyof StorageKeys>(key: K): StorageKeys[K] | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading ${key} from storage:`, error);
      return null;
    }
  }

  remove<K extends keyof StorageKeys>(key: K): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
    }
  }

  clear(): void {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}

export const storageService = new StorageService();
