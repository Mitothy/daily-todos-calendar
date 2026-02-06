import { useEffect, useState, useCallback } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { TaskList } from './TaskList';
import { ExpenseList } from '../Expenses/ExpenseList';
import { ErrorMessage } from '../Common/ErrorMessage';
import { formatDisplayDate } from '../../utils/dateHelpers';
import { HEX_COLORS } from '../../utils/colorMap';
import { Task, Expense, createDefaultTasks } from '../../types/task.types';

interface TaskPanelProps {
  date: Date;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskPanel({ date, isOpen, onClose }: TaskPanelProps) {
  const { loadTasks, saveTasks, createTasks, deleteTasks, error } = useTasks();
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const [localExpenses, setLocalExpenses] = useState<Expense[]>([]);
  const [saving, setSaving] = useState(false);
  const [panelLoading, setPanelLoading] = useState(true);
  const [isNewDay, setIsNewDay] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    async function loadData() {
      setPanelLoading(true);
      const result = await loadTasks(date);
      if (cancelled) return;

      if (result && result.tasks.length > 0) {
        setLocalTasks(result.tasks);
        setLocalExpenses(result.expenses || []);
        setIsNewDay(false);
      } else {
        setLocalTasks(createDefaultTasks());
        setLocalExpenses([]);
        setIsNewDay(true);
      }
      setPanelLoading(false);
    }

    loadData();
    return () => { cancelled = true; };
  }, [date, isOpen, loadTasks]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleToggle = useCallback((id: string) => {
    setLocalTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : null }
          : t
      )
    );
  }, []);

  const handleTitleChange = useCallback((id: string, title: string) => {
    setLocalTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title } : t))
    );
  }, []);

  const handleNotesChange = useCallback((id: string, notes: string) => {
    setLocalTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, notes } : t))
    );
  }, []);

  const handleAddExpense = useCallback(() => {
    setLocalExpenses((prev) => [
      ...prev,
      { id: crypto.randomUUID(), description: '', amount: 0 },
    ]);
  }, []);

  const handleDeleteExpense = useCallback((id: string) => {
    setLocalExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleExpenseDescriptionChange = useCallback((id: string, description: string) => {
    setLocalExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, description } : e))
    );
  }, []);

  const handleExpenseAmountChange = useCallback((id: string, amount: number) => {
    setLocalExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, amount } : e))
    );
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const cleanedExpenses = localExpenses
      .filter((e) => e.description.trim() || e.amount > 0)
      .map((e) => ({ ...e, amount: Math.round(e.amount * 100) / 100 }));

    if (isNewDay) {
      await createTasks(date, localTasks, cleanedExpenses);
    } else {
      await saveTasks(date, localTasks, cleanedExpenses);
    }
    setSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!confirm('Delete this day\'s tasks and expenses?')) return;
    setSaving(true);
    await deleteTasks(date);
    setSaving(false);
    onClose();
  };

  const completedCount = localTasks.filter((t) => t.completed).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b dark:border-slate-700" style={{ backgroundColor: HEX_COLORS[completedCount] + '22' }}>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{formatDisplayDate(date)}</h2>
          <div className="flex items-center gap-2 mt-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: HEX_COLORS[completedCount] }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Completed: {completedCount}/6
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          {panelLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {error && <ErrorMessage message={error} />}
              <TaskList
                tasks={localTasks}
                onToggle={handleToggle}
                onTitleChange={handleTitleChange}
                onNotesChange={handleNotesChange}
              />
              <ExpenseList
                expenses={localExpenses}
                onDescriptionChange={handleExpenseDescriptionChange}
                onAmountChange={handleExpenseAmountChange}
                onDelete={handleDeleteExpense}
                onAdd={handleAddExpense}
              />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 flex justify-between">
          {!isNewDay ? (
            <button
              onClick={handleDelete}
              disabled={saving || panelLoading}
              className="px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
            >
              Delete
            </button>
          ) : (
            <div />
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || panelLoading}
              className="px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
