import React, { createContext, useContext, useEffect, useState } from 'react';
import { storageService } from '../services/storageService';

interface SettingsContextType {
  apiKey: string;
  setApiKey: (key: string) => Promise<void>;
  isApiKeyValid: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState<string>('');
  const [isApiKeyValid, setIsApiKeyValid] = useState(false);

  useEffect(() => {
    // Load API key from storage on mount
    const loadApiKey = async () => {
      try {
        const storedKey = await window.electron.getApiKey();
        if (storedKey) {
          setApiKeyState(storedKey);
          setIsApiKeyValid(true);
        }
      } catch (error) {
        console.error('Error loading API key:', error);
      }
    };

    loadApiKey();
  }, []);

  const setApiKey = async (key: string) => {
    try {
      await window.electron.saveApiKey(key);
      setApiKeyState(key);
      setIsApiKeyValid(!!key);
    } catch (error) {
      console.error('Error saving API key:', error);
      throw error;
    }
  };

  const value = {
    apiKey,
    setApiKey,
    isApiKeyValid,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
