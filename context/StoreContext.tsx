import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppContextType, AppState, Task, Transaction } from '../types';

const STORAGE_KEY = 'lifesync_data_v1';

const defaultState: AppState = {
  tasks: [],
  transactions: [],
  theme: 'light',
};

const StoreContext = createContext<AppContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...defaultState, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error("Failed to load data", e);
    }
    return defaultState;
  });

  // Persist to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // Apply theme
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state]);

  const setTheme = useCallback((theme: 'light' | 'dark') => {
    setState(prev => ({ ...prev, theme }));
  }, []);

  // --- Task Logic ---
  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      completed: false,
      createdAt: Date.now(),
    };
    setState(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => (t.id === id ? { ...t, ...updates } : t)),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id),
    }));
  }, []);

  const toggleTaskCompletion = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)),
    }));
  }, []);

  // --- Finance Logic ---
  const addTransaction = useCallback((txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...txData,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setState(prev => ({ ...prev, transactions: [...prev.transactions, newTx] }));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id),
    }));
  }, []);

  // --- System Logic ---
  const resetData = useCallback(() => {
    if (window.confirm("Tem certeza? Isso apagará todos os dados permanentemente.")) {
      setState({ ...defaultState, theme: state.theme });
    }
  }, [state.theme]);

  const exportData = useCallback(() => {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uwjota_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [state]);

  const importData = useCallback((jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      // Basic validation
      if (!Array.isArray(parsed.tasks) || !Array.isArray(parsed.transactions)) {
        throw new Error("Invalid format");
      }
      setState(prev => ({
        ...prev,
        tasks: parsed.tasks,
        transactions: parsed.transactions,
      }));
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }, []);

  return (
    <StoreContext.Provider
      value={{
        ...state,
        setTheme,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        addTransaction,
        deleteTransaction,
        resetData,
        exportData,
        importData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};