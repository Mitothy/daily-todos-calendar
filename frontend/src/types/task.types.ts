export interface Task {
  id: string;
  title: string;
  completed: boolean;
  completedAt: string | null;
  notes: string;
}

export const EXPENSE_CATEGORIES = [
  'Social',
  'Personal',
  'Food & Beverage',
  'Shopping',
  'Hannah',
] as const;

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category?: string;
}

export interface TasksData {
  tasks: Task[];
  completionRate: number;
  lastUpdated: string;
}

export interface DailyTaskEvent {
  date: string;
  tasks: Task[];
  completionRate: number;
  colorId: string;
  eventId: string;
  expenses: Expense[];
  totalSpent: number;
}

export const DEFAULT_TASK_TITLES = [
  'Daily Supplements',
  'Skincare and Brush Twice',
  'Notebook',
  'Productive outside Work',
  'Exercise',
  'Read or Mental Exercise',
];

export function createDefaultTasks(): Task[] {
  return DEFAULT_TASK_TITLES.map((title) => ({
    id: crypto.randomUUID(),
    title,
    completed: false,
    completedAt: null,
    notes: '',
  }));
}
