import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppContextType, AppState, Task, Transaction, Note } from '../types';

// Atualizado para refletir o nome do sistema
const STORAGE_KEY = 'uwjota_system_v1';

const defaultState: AppState = {
  tasks: [],
  transactions: [],
  notes: [],
  theme: 'light',
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
          ...defaultState, // Defaults
          ...parsedState,  // Overwrites
          notes: Array.isArray(parsedState.notes) ? parsedState.notes : [],
          tasks: Array.isArray(parsedState.tasks) ? parsedState.tasks : [],
          transactions: Array.isArray(parsedState.transactions) ? parsedState.transactions : [],
        };

        // Lógica de Limpeza ao Carregar
        // Garantimos que tarefas recorrentes nunca fiquem "travadas" como completed: true no estado persistido
        // se a lógica anterior as salvou incorretamente.
        safeState.tasks = safeState.tasks.map((t: Task) => {
          if (t.recurrence && t.recurrence.type !== 'once' && t.completed) {
            return { ...t, completed: false }; // Força false, confiamos apenas no lastCompletedDate
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

  // Effect 1: Persistência de Dados
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Erro Crítico: Falha ao salvar no LocalStorage", e);
    }
  }, [state]);

  // Effect 2: Aplicação do Tema
  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

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
    const todayStr = new Date().toISOString().split('T')[0];
    
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => {
        if (t.id === id) {
          const isRecurring = t.recurrence && t.recurrence.type !== 'once';
          
          if (isRecurring) {
            // Lógica para Recorrentes:
            // Se já foi completada hoje, "desfazemos" removendo a data (ou setando null/ontem)
            // Se não foi completada hoje, setamos a data para hoje.
            // O campo 'completed' boolean fica SEMPRE false para recorrentes no DB.
            const isCompletedToday = t.lastCompletedDate === todayStr;
            return {
              ...t,
              completed: false, // Sempre false para não bugar o filtro de "pendentes" amanhã
              lastCompletedDate: isCompletedToday ? '' : todayStr
            };
          } else {
            // Lógica para Tarefas Únicas (Padrão)
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

  // --- Note Logic ---
  const addNote = useCallback((noteData: Omit<Note, 'id' | 'updatedAt'>) => {
    const newNote: Note = {
      ...noteData,
      id: crypto.randomUUID(),
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
      if (!parsed || typeof parsed !== 'object') {
        throw new Error("Formato de JSON inválido");
      }
      const importedState: AppState = {
        ...defaultState,
        ...parsed,
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
        notes: Array.isArray(parsed.notes) ? parsed.notes : [],
        theme: parsed.theme === 'dark' || parsed.theme === 'light' ? parsed.theme : 'light',
      };
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
        setTheme,
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