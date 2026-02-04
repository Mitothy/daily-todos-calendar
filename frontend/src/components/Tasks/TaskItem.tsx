import { Task } from '../../types/task.types';

interface TaskItemProps {
  task: Task;
  index: number;
  onToggle: (id: string) => void;
  onTitleChange: (id: string, title: string) => void;
}

export function TaskItem({ task, index, onToggle, onTitleChange }: TaskItemProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
      />
      <span className="text-sm text-gray-400 w-4">{index + 1}</span>
      <input
        type="text"
        value={task.title}
        onChange={(e) => onTitleChange(task.id, e.target.value)}
        maxLength={100}
        placeholder={`Task ${index + 1}`}
        className={`flex-1 px-2 py-1 border-b border-gray-200 focus:border-blue-400 focus:outline-none text-sm ${
          task.completed ? 'line-through text-gray-400' : 'text-gray-700'
        }`}
      />
    </div>
  );
}
