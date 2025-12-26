import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppContextType, AppState, Task, Transaction, Note } from '../types';

const STORAGE_KEY = 'uwjota_system_v1';

const defaultState: AppState = {
  tasks: [],
  transactions: [],
  notes: [],
};

// Polyfill seguro para geração de IDs em navegadores antigos (iOS < 15.4)
const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback timestamp + random
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const StoreContext = createContext<AppContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedState = JSON.parse(stored);
        
        // --- DATA INTEGRITY CHECK ---
        const safeState: AppState = {
          ...defaultState,
          ...parsedState,
          // Remove theme from imported state if it exists
          notes: Array.isArray(parsedState.notes) ? parsedState.notes : [],
          tasks: Array.isArray(parsedState.tasks) ? parsedState.tasks : [],
          transactions: Array.isArray(parsedState.transactions) ? parsedState.transactions : [],
        };
        // Remove theme key specifically if it came from old storage
        if ('theme' in safeState) {
            delete (safeState as any).theme;
        }

        // Clean up recurrence tasks logic
        safeState.tasks = safeState.tasks.map((t: Task) => {
          if (t.recurrence && t.recurrence.type !== 'once' && t.completed) {
            return { ...t, completed: false }; 
          }
          return t;
        });

        return safeState;
      }
    } catch (e) {
      console.error("Falha ao carregar dados do sistema:", e);
    }
    return defaultState;
  });

  // Effect 1: Persistência
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Erro Crítico: Falha ao salvar no LocalStorage", e);
    }
  }, [state]);

  // Always force dark mode on mount
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#030303');
  }, []);

  // --- Task Logic ---
  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    const newTask: Task = {
      ...taskData,
      id: generateId(),
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
    const todayStr = new Date().toISOString().split('T')[0];
    
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => {
        if (t.id === id) {
          const isRecurring = t.recurrence && t.recurrence.type !== 'once';
          
          if (isRecurring) {
            const isCompletedToday = t.lastCompletedDate === todayStr;
            return {
              ...t,
              completed: false, 
              lastCompletedDate: isCompletedToday ? '' : todayStr
            };
          } else {
            return { 
              ...t, 
              completed: !t.completed,
              lastCompletedDate: !t.completed ? todayStr : t.lastCompletedDate 
            };
          }
        }
        return t;
      }),
    }));
  }, []);

  // --- Finance Logic ---
  const addTransaction = useCallback((txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...txData,
      id: generateId(),
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

  // --- Note Logic ---
  const addNote = useCallback((noteData: Omit<Note, 'id' | 'updatedAt'>) => {
    const newNote: Note = {
      ...noteData,
      id: generateId(),
      updatedAt: Date.now(),
    };
    setState(prev => ({ ...prev, notes: [newNote, ...prev.notes] }));
  }, []);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setState(prev => ({
      ...prev,
      notes: prev.notes.map(n => (n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n)),
    }));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      notes: prev.notes.filter(n => n.id !== id),
    }));
  }, []);


  // --- System Logic ---
  const resetData = useCallback(() => {
    if (window.confirm("ATENÇÃO: Isso apagará todos os dados permanentemente e reiniciará o sistema. Continuar?")) {
      setState({ ...defaultState });
    }
  }, []);

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
      if (!parsed || typeof parsed !== 'object') {
        throw new Error("Formato de JSON inválido");
      }
      const importedState: AppState = {
        ...defaultState,
        ...parsed,
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
        notes: Array.isArray(parsed.notes) ? parsed.notes : [],
      };
      if ('theme' in importedState) { delete (importedState as any).theme; }

      setState(importedState);
      return true;
    } catch (e) {
      console.error("Erro na Importação:", e);
      return false;
    }
  }, []);

  return (
    <StoreContext.Provider
      value={{
        ...state,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        addTransaction,
        deleteTransaction,
        addNote,
        updateNote,
        deleteNote,
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