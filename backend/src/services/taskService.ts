import { v4 as uuidv4 } from 'uuid';
import { Task, Expense } from '../types/task.types.js';

const DEFAULT_TASK_TITLES = [
  'Daily Supplements',
  'Skincare and Brush Twice',
  'Notebook',
  'Productive outside Work',
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
    if (expense.category !== undefined && typeof expense.category !== 'string') return 'Expense category must be a string';
  }
  return null;
}

export function calculateTotalSpent(expenses: Expense[]): number {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  return Math.round(total * 100) / 100;
}

