export type Priority = 'low' | 'medium' | 'high';
export type TransactionType = 'income' | 'expense';
export type ViewMode = 'dashboard' | 'tasks' | 'finance' | 'settings';

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

export interface AppState {
  tasks: Task[];
  transactions: Transaction[];
  theme: 'light' | 'dark';
}

export interface AppContextType extends AppState {
  setTheme: (theme: 'light' | 'dark') => void;
  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  // Finance Actions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;
  // System Actions
  resetData: () => void;
  importData: (jsonData: string) => boolean;
  exportData: () => void;
}