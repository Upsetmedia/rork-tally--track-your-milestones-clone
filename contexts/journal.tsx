import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JournalEntry } from '@/types/tally';

interface JournalContextValue {
  entries: JournalEntry[];
  isLoading: boolean;
  addEntry: (entry: Omit<JournalEntry, 'id' | 'timestamp'>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  getTodayEntry: () => JournalEntry | undefined;
  getEntriesByTally: (tallyId: string) => JournalEntry[];
}

const JournalContext = createContext<JournalContextValue | undefined>(undefined);

const STORAGE_KEY = '@tally_app:journal_entries';

export function JournalProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setEntries(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load journal entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveEntries = useCallback(async (newEntries: JournalEntry[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
      setEntries(newEntries);
    } catch (error) {
      console.error('Failed to save journal entries:', error);
    }
  }, []);

  const addEntry = useCallback(async (entryData: Omit<JournalEntry, 'id' | 'timestamp'>) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();

    const existingIndex = entries.findIndex((entry) => {
      const entryDate = new Date(entry.timestamp);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === todayStart;
    });

    if (existingIndex !== -1) {
      const existingEntry = entries[existingIndex];
      const updatedEntry: JournalEntry = {
        ...existingEntry,
        ...entryData,
        id: existingEntry.id,
        timestamp: existingEntry.timestamp,
      };
      const updatedEntries = [...entries];
      updatedEntries[existingIndex] = updatedEntry;
      await saveEntries(updatedEntries);
      return;
    }

    const newEntry: JournalEntry = {
      ...entryData,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    const newEntries = [...entries, newEntry];
    await saveEntries(newEntries);
  }, [entries, saveEntries]);

  const deleteEntry = useCallback(async (id: string) => {
    const newEntries = entries.filter(e => e.id !== id);
    await saveEntries(newEntries);
  }, [entries, saveEntries]);

  const getTodayEntry = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();
    
    return entries.find(entry => {
      const entryDate = new Date(entry.timestamp);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === todayTimestamp;
    });
  }, [entries]);

  const getEntriesByTally = useCallback((tallyId: string) => {
    return entries.filter(e => e.tallyId === tallyId).sort((a, b) => b.timestamp - a.timestamp);
  }, [entries]);

  const value = useMemo(
    () => ({ entries, isLoading, addEntry, deleteEntry, getTodayEntry, getEntriesByTally }),
    [entries, isLoading, addEntry, deleteEntry, getTodayEntry, getEntriesByTally]
  );

  return (
    <JournalContext.Provider value={value}>
      {children}
    </JournalContext.Provider>
  );
}

export function useJournal() {
  const context = useContext(JournalContext);
  if (!context) {
    throw new Error('useJournal must be used within JournalProvider');
  }
  return context;
}
