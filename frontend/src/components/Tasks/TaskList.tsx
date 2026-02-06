import { Task } from '../../types/task.types';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onTitleChange: (id: string, title: string) => void;
  onNotesChange: (id: string, notes: string) => void;
}

export function TaskList({ tasks, onToggle, onTitleChange, onNotesChange }: TaskListProps) {
  return (
    <div className="space-y-1">
      {tasks.map((task, index) => (
        <TaskItem
          key={task.id}
          task={task}
          index={index}
          onToggle={onToggle}
          onTitleChange={onTitleChange}
          onNotesChange={onNotesChange}
        />
      ))}
    </div>
  );
}
