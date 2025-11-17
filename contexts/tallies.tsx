import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tally } from '@/types/tally';

interface TalliesContextValue {
  tallies: Tally[];
  isLoading: boolean;
  addTally: (tally: Omit<Tally, 'id' | 'createdAt'>) => Promise<void>;
  deleteTally: (id: string) => Promise<void>;
  updateTally: (id: string, updates: Partial<Tally>) => Promise<void>;
  reorderTallies: (orderedIds: string[]) => Promise<void>;
}

const TalliesContext = createContext<TalliesContextValue | undefined>(undefined);

const STORAGE_KEY = '@tally_app:tallies';

export function TalliesProvider({ children }: { children: React.ReactNode }) {
  const [tallies, setTallies] = useState<Tally[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTallies();
  }, []);

  const loadTallies = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setTallies(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load tallies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTallies = async (newTallies: Tally[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTallies));
      setTallies(newTallies);
    } catch (error) {
      console.error('Failed to save tallies:', error);
    }
  };

  const addTally = useCallback(async (tallyData: Omit<Tally, 'id' | 'createdAt'>) => {
    const newTally: Tally = {
      ...tallyData,
      id: Date.now().toString(),
      createdAt: Date.now(),
    };
    const newTallies = [...tallies, newTally];
    await saveTallies(newTallies);
  }, [tallies]);

  const deleteTally = useCallback(async (id: string) => {
    const newTallies = tallies.filter(t => t.id !== id);
    await saveTallies(newTallies);
  }, [tallies]);

  const updateTally = useCallback(async (id: string, updates: Partial<Tally>) => {
    const newTallies = tallies.map(t =>
      t.id === id ? { ...t, ...updates } : t
    );
    await saveTallies(newTallies);
  }, [tallies]);

  const reorderTallies = useCallback(async (orderedIds: string[]) => {
    const tallyMap = new Map(tallies.map((tally) => [tally.id, tally]));
    const reordered: Tally[] = [];

    orderedIds.forEach((id) => {
      const item = tallyMap.get(id);
      if (item) {
        reordered.push(item);
        tallyMap.delete(id);
      }
    });

    tallyMap.forEach((item) => {
      reordered.push(item);
    });

    await saveTallies(reordered);
  }, [tallies]);

  const value = useMemo(
    () => ({ tallies, isLoading, addTally, deleteTally, updateTally, reorderTallies }),
    [tallies, isLoading, addTally, deleteTally, updateTally, reorderTallies]
  );

  return (
    <TalliesContext.Provider value={value}>
      {children}
    </TalliesContext.Provider>
  );
}

export function useTallies() {
  const context = useContext(TalliesContext);
  if (!context) {
    throw new Error('useTallies must be used within TalliesProvider');
  }
  return context;
}
