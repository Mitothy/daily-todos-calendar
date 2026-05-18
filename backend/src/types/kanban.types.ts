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

export interface KanbanData {
  cards: KanbanCard[];
  lastUpdated: string;
}
