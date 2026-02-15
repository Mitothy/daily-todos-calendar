export interface Task {
  id: string;
  title: string;
  completed: boolean;
  completedAt: string | null;
  notes: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
}

export interface Income {
  id: string;
  description: string;
  amount: number;
}

export interface TasksData {
  tasks: Task[];
  completionRate: number;
  lastUpdated: string;
}

export interface ExpensesData {
  expenses: Expense[];
  totalSpent: number;
  lastUpdated: string;
}

export interface IncomeData {
  incomes: Income[];
  totalIncome: number;
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
  incomes: Income[];
  totalIncome: number;
}
