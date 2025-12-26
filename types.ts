export type Priority = 'low' | 'medium' | 'high';
export type TransactionType = 'income' | 'expense';
export type ViewMode = 'dashboard' | 'tasks' | 'finance' | 'settings' | 'notes';

export interface Recurrence {
  type: 'once' | 'weekly';
  days?: number[]; // 0 = Domingo, 1 = Segunda, etc.
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO string YYYY-MM-DD (Data de início ou data única)
  recurrence?: Recurrence;
  priority: Priority;
  completed: boolean;
  lastCompletedDate?: string; // Controle para resetar tarefas recorrentes
  createdAt: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  value: number;
  category: string;
  date: string; // ISO string YYYY-MM-DD
  note?: string;
  createdAt: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  updatedAt: number;
}

export interface AppState {
  tasks: Task[];
  transactions: Transaction[];
  notes: Note[];
  // Removido theme
}

export interface AppContextType extends AppState {
  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  // Finance Actions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;
  // Note Actions
  addNote: (note: Omit<Note, 'id' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  // System Actions
  resetData: () => void;
  importData: (jsonData: string) => boolean;
  exportData: () => void;
}