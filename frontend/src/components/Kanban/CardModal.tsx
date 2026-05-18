import { useEffect, useRef, useState } from 'react';
import { KanbanCard, KanbanPriority, KanbanStatus, COLUMNS } from '../../types/kanban.types';

interface Props {
  mode: 'add' | 'edit';
  initialStatus?: KanbanStatus;
  card?: KanbanCard;
  onSave: (data: Pick<KanbanCard, 'title' | 'description' | 'priority' | 'status' | 'tag'>) => Promise<void>;
  onDelete?: () => void;
  onClose: () => void;
}

const PRIORITIES: { value: KanbanPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export function CardModal({ mode, initialStatus = 'todo', card, onSave, onDelete, onClose }: Props) {
  const [title, setTitle] = useState(card?.title ?? '');
  const [description, setDescription] = useState(card?.description ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [priority, setPriority] = useState<KanbanPriority>(card?.priority ?? 'medium');
  const [status, setStatus] = useState<KanbanStatus>(card?.status ?? initialStatus);
  const [tag, setTag] = useState(card?.tag ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave({ title: title.trim(), description: description.trim(), priority, status, tag: tag.trim() });
      onClose();
    } catch {
      setError('Failed to save — please try again');
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full sm:w-[480px] bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 dark:border-slate-700">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">
            {mode === 'add' ? 'New card' : 'Edit card'}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">Title</label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={200}
              placeholder="What needs to be done?"
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-100 placeholder-gray-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">Description <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="Add more detail..."
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 resize-none"
            />
          </div>

          {/* Status + Priority row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as KanbanStatus)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-100"
              >
                {COLUMNS.map(col => (
                  <option key={col.id} value={col.id}>{col.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as KanbanPriority)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-100"
              >
                {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>

          {/* Tag */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">Tag <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              type="text"
              value={tag}
              onChange={e => setTag(e.target.value)}
              maxLength={50}
              placeholder="e.g. Work, Personal, Learning"
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-100 placeholder-gray-400"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          {/* Delete (edit mode only) */}
          {mode === 'edit' && onDelete && (
            <div className="pt-1 border-t border-gray-100 dark:border-slate-700">
              {confirmDelete ? (
                <button
                  type="button"
                  onClick={onDelete}
                  className="w-full px-3 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                >
                  Confirm delete
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="w-full px-3 py-2 text-sm text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Delete card
                </button>
              )}
            </div>
          )}

          {/* Save / Cancel */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg transition-colors"
            >
              {saving ? 'Saving…' : mode === 'add' ? 'Add card' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
