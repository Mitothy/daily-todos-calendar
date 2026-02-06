import { Task } from '../../types/task.types';

interface TaskItemProps {
  task: Task;
  index: number;
  onToggle: (id: string) => void;
  onTitleChange: (id: string, title: string) => void;
  onNotesChange: (id: string, notes: string) => void;
}

export function TaskItem({ task, index, onToggle, onTitleChange, onNotesChange }: TaskItemProps) {
  return (
    <div className="flex items-center gap-2 py-2">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer shrink-0"
      />
      <span className="text-sm text-gray-400 w-4 shrink-0">{index + 1}</span>
      <input
        type="text"
        value={task.title}
        onChange={(e) => onTitleChange(task.id, e.target.value)}
        maxLength={100}
        placeholder={`Task ${index + 1}`}
        className={`flex-1 min-w-0 px-2 py-1 border-b border-gray-200 focus:border-blue-400 focus:outline-none text-sm ${
          task.completed ? 'line-through text-gray-400' : 'text-gray-700'
        }`}
      />
      <input
        type="text"
        value={task.notes}
        onChange={(e) => onNotesChange(task.id, e.target.value)}
        maxLength={200}
        placeholder="notes"
        className="w-24 px-2 py-1 text-xs text-gray-500 border-b border-gray-100 focus:border-blue-300 focus:outline-none shrink-0"
      />
    </div>
  );
}
