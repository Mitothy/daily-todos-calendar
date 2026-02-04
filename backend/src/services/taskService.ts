import { v4 as uuidv4 } from 'uuid';
import { Task } from '../types/task.types.js';

export function createEmptyTasks(): Task[] {
  return Array.from({ length: 6 }, () => ({
    id: uuidv4(),
    title: '',
    completed: false,
    completedAt: null,
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
