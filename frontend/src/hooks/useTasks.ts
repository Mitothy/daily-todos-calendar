import { useState, useCallback } from 'react';
import { api } from '../services/api';
import { Task, Expense, DailyTaskEvent } from '../types/task.types';
import { formatDateKey } from '../utils/dateHelpers';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async (date: Date) => {
    setLoading(true);
    setError(null);
    try {
      const dateKey = formatDateKey(date);
      const response = await api.get<DailyTaskEvent | null>(`/tasks/${dateKey}`);
      setTasks(response.data?.tasks || []);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load tasks');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveTasks = useCallback(async (date: Date, updatedTasks: Task[], updatedExpenses: Expense[]) => {
    setLoading(true);
    setError(null);
    try {
      const dateKey = formatDateKey(date);
      const response = await api.put(`/tasks/${dateKey}`, {
        tasks: updatedTasks,
        expenses: updatedExpenses,
      });
      setTasks(response.data.tasks);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save tasks');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTasks = useCallback(async (date: Date, newTasks: Task[], expenses: Expense[] = []) => {
    setLoading(true);
    setError(null);
    try {
      const dateKey = formatDateKey(date);
      const response = await api.post(`/tasks/${dateKey}`, { tasks: newTasks, expenses });
      setTasks(response.data.tasks);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create tasks');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleTask = useCallback(async (date: Date, taskId: string) => {
    setError(null);
    try {
      const dateKey = formatDateKey(date);
      const response = await api.patch(`/tasks/${dateKey}/${taskId}/toggle`);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? response.data.task : t))
      );
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to toggle task');
      return null;
    }
  }, []);

  const deleteTasks = useCallback(async (date: Date) => {
    setLoading(true);
    setError(null);
    try {
      const dateKey = formatDateKey(date);
      await api.delete(`/tasks/${dateKey}`);
      setTasks([]);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete tasks');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { tasks, loading, error, loadTasks, saveTasks, createTasks, toggleTask, deleteTasks };
}
