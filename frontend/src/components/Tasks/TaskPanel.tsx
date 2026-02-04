import { useEffect, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useTasks } from '../../hooks/useTasks';
import { TaskList } from './TaskList';
import { ErrorMessage } from '../Common/ErrorMessage';
import { formatDisplayDate } from '../../utils/dateHelpers';
import { HEX_COLORS } from '../../utils/colorMap';
import { Task } from '../../types/task.types';

interface TaskPanelProps {
  date: Date;
  isOpen: boolean;
  onClose: () => void;
}

function createEmptyTasks(): Task[] {
  return Array.from({ length: 6 }, () => ({
    id: uuidv4(),
    title: '',
    completed: false,
    completedAt: null,
  }));
}

export function TaskPanel({ date, isOpen, onClose }: TaskPanelProps) {
  const { loadTasks, saveTasks, createTasks, error } = useTasks();
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [panelLoading, setPanelLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    async function load() {
      setPanelLoading(true);
      const result = await loadTasks(date);
      if (result && result.tasks.length > 0) {
        setLocalTasks(result.tasks);
        setIsNew(false);
      } else {
        setLocalTasks(createEmptyTasks());
        setIsNew(true);
      }
      setPanelLoading(false);
    }

    load();
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

  const handleSave = async () => {
    setSaving(true);
    if (isNew) {
      await createTasks(date, localTasks);
    } else {
      await saveTasks(date, localTasks);
    }
    setSaving(false);
    onClose();
  };

  const completedCount = localTasks.filter((t) => t.completed).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b" style={{ backgroundColor: HEX_COLORS[completedCount] + '22' }}>
          <h2 className="text-lg font-semibold text-gray-800">{formatDisplayDate(date)}</h2>
          <div className="flex items-center gap-2 mt-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: HEX_COLORS[completedCount] }}
            />
            <span className="text-sm text-gray-600">
              Completed: {completedCount}/6
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
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
              />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100 transition-colors"
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
  );
}
