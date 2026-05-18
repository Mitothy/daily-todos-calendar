export type KanbanStatus = 'todo' | 'inprogress' | 'done';
export type KanbanPriority = 'low' | 'medium' | 'high';

export interface KanbanCard {
  id: string;
  title: string;
  description: string;
  priority: KanbanPriority;
  status: KanbanStatus;
  tag: string;
  createdAt: string;
  updatedAt: string;
  doneAt?: string;
}

export interface KanbanColumn {
  id: KanbanStatus;
  title: string;
  color: string;
}

export const COLUMNS: KanbanColumn[] = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-400' },
  { id: 'inprogress', title: 'In Progress', color: 'bg-blue-500' },
  { id: 'done', title: 'Done', color: 'bg-green-500' },
];
