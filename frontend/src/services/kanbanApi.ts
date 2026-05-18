import { api } from './api';
import { KanbanCard } from '../types/kanban.types';

export const kanbanApi = {
  list: () => api.get<KanbanCard[]>('/kanban').then(r => r.data),

  create: (card: Pick<KanbanCard, 'title' | 'description' | 'priority' | 'status' | 'tag'>) =>
    api.post<KanbanCard>('/kanban', card).then(r => r.data),

  update: (id: string, patch: Partial<KanbanCard>) =>
    api.patch<KanbanCard>(`/kanban/${id}`, patch).then(r => r.data),

  delete: (id: string) => api.delete(`/kanban/${id}`),

  bulkUpdate: (cards: KanbanCard[]) =>
    api.put<KanbanCard[]>('/kanban/bulk', { cards }).then(r => r.data),
};
