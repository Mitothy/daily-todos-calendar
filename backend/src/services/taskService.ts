import { v4 as uuidv4 } from 'uuid';
import { Task, Expense, Income } from '../types/task.types.js';

const DEFAULT_TASK_TITLES = [
  'Daily Supplements',
  'Skincare and Brush Twice',
  'Notebook',
  'Stretching',
  'Exercise',
  'Read or Mental Exercise',
];

export function createEmptyTasks(): Task[] {
  return DEFAULT_TASK_TITLES.map((title) => ({
    id: uuidv4(),
    title,
    completed: false,
    completedAt: null,
    notes: '',
  }));
}

export function toggleTask(task: Task): Task {
  return {
    ...task,
    completed: !task.completed,
    completedAt: !task.completed ? new Date().toISOString() : null,
  };
}

export function validateTasks(tasks: Task[]): string | null {
  if (tasks.length !== 6) return 'Must have exactly 6 tasks';
  for (const task of tasks) {
    if (!task.id) return 'Each task must have an id';
    if (typeof task.title !== 'string') return 'Each task title must be a string';
    if (task.title.length > 100) return 'Task title must be 100 characters or less';
    if (typeof task.completed !== 'boolean') return 'Each task must have a boolean completed field';
  }
  return null;
}

export function validateExpenses(expenses: Expense[]): string | null {
  if (!Array.isArray(expenses)) return 'Expenses must be an array';
  for (const expense of expenses) {
    if (!expense.id) return 'Each expense must have an id';
    if (typeof expense.description !== 'string') return 'Each expense description must be a string';
    if (expense.description.length > 200) return 'Expense description must be 200 characters or less';
    if (typeof expense.amount !== 'number' || isNaN(expense.amount)) return 'Each expense must have a numeric amount';
    if (expense.amount < 0) return 'Expense amount cannot be negative';
  }
  return null;
}

export function calculateTotalSpent(expenses: Expense[]): number {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  return Math.round(total * 100) / 100;
}

export function validateIncomes(incomes: Income[]): string | null {
  if (!Array.isArray(incomes)) return 'Incomes must be an array';
  for (const income of incomes) {
    if (!income.id) return 'Each income must have an id';
    if (typeof income.description !== 'string') return 'Each income description must be a string';
    if (income.description.length > 200) return 'Income description must be 200 characters or less';
    if (typeof income.amount !== 'number' || isNaN(income.amount)) return 'Each income must have a numeric amount';
    if (income.amount < 0) return 'Income amount cannot be negative';
  }
  return null;
}

export function calculateTotalIncome(incomes: Income[]): number {
  const total = incomes.reduce((sum, i) => sum + i.amount, 0);
  return Math.round(total * 100) / 100;
}
