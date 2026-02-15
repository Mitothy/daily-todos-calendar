import { useEffect, useState, useCallback } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { TaskList } from './TaskList';
import { ExpenseList } from '../Expenses/ExpenseList';
import { IncomeList } from '../Income/IncomeList';
import { ErrorMessage } from '../Common/ErrorMessage';
import { formatDisplayDate } from '../../utils/dateHelpers';
import { HEX_COLORS } from '../../utils/colorMap';
import { Task, Expense, Income, createDefaultTasks } from '../../types/task.types';

interface TaskPanelProps {
  date: Date;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskPanel({ date, isOpen, onClose }: TaskPanelProps) {
  const { loadTasks, saveTasks, createTasks, deleteTasks, error } = useTasks();
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const [localExpenses, setLocalExpenses] = useState<Expense[]>([]);
  const [localIncomes, setLocalIncomes] = useState<Income[]>([]);
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
        setLocalIncomes(result.incomes || []);
        setIsNewDay(false);
      } else {
        setLocalTasks(createDefaultTasks());
        setLocalExpenses([]);
        setLocalIncomes([]);
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

  const handleAddIncome = useCallback(() => {
    setLocalIncomes((prev) => [
      ...prev,
      { id: crypto.randomUUID(), description: '', amount: 0 },
    ]);
  }, []);

  const handleDeleteIncome = useCallback((id: string) => {
    setLocalIncomes((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const handleIncomeDescriptionChange = useCallback((id: string, description: string) => {
    setLocalIncomes((prev) =>
      prev.map((i) => (i.id === id ? { ...i, description } : i))
    );
  }, []);

  const handleIncomeAmountChange = useCallback((id: string, amount: number) => {
    setLocalIncomes((prev) =>
      prev.map((i) => (i.id === id ? { ...i, amount } : i))
    );
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const cleanedExpenses = localExpenses
      .filter((e) => e.description.trim() || e.amount > 0)
      .map((e) => ({ ...e, amount: Math.round(e.amount * 100) / 100 }));
    const cleanedIncomes = localIncomes
      .filter((i) => i.description.trim() || i.amount > 0)
      .map((i) => ({ ...i, amount: Math.round(i.amount * 100) / 100 }));

    if (isNewDay) {
      await createTasks(date, localTasks, cleanedExpenses, cleanedIncomes);
    } else {
      await saveTasks(date, localTasks, cleanedExpenses, cleanedIncomes);
    }
    setSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!confirm('Delete this day\'s tasks, expenses, and income?')) return;
    setSaving(true);
    await deleteTasks(date);
    setSaving(false);
    onClose();
  };

  const completedCount = localTasks.filter((t) => t.completed).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-md sm:mx-4 overflow-hidden transition-colors max-h-[90vh] sm:max-h-none flex flex-col">
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center py-2 bg-white dark:bg-slate-800">
          <div className="w-10 h-1 bg-gray-300 dark:bg-slate-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b dark:border-slate-700 flex items-center justify-between" style={{ backgroundColor: HEX_COLORS[completedCount] + '22' }}>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">{formatDisplayDate(date)}</h2>
            <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
              <div
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"
                style={{ backgroundColor: HEX_COLORS[completedCount] }}
              />
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                Completed: {completedCount}/6
              </span>
            </div>
          </div>
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="sm:hidden p-2 -mr-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 overflow-y-auto flex-1">
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
              <IncomeList
                incomes={localIncomes}
                onDescriptionChange={handleIncomeDescriptionChange}
                onAmountChange={handleIncomeAmountChange}
                onDelete={handleDeleteIncome}
                onAdd={handleAddIncome}
              />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 flex justify-between pb-safe">
          {!isNewDay ? (
            <button
              onClick={handleDelete}
              disabled={saving || panelLoading}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
            >
              Delete
            </button>
          ) : (
            <div />
          )}
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="hidden sm:block px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || panelLoading}
              className="px-4 sm:px-4 py-2.5 sm:py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg sm:rounded-md transition-colors disabled:opacity-50 min-w-[80px]"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
