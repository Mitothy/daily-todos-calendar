import { useState, useEffect, useCallback, useRef } from 'react';
import { KanbanCard, KanbanStatus } from '../types/kanban.types';
import { kanbanApi } from '../services/kanbanApi';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function stampDoneAt(cards: KanbanCard[]): KanbanCard[] {
  const now = new Date().toISOString();
  return cards.map(c => {
    if (c.status === 'done' && !c.doneAt) return { ...c, doneAt: now };
    if (c.status !== 'done' && c.doneAt) return { ...c, doneAt: undefined };
    return c;
  });
}

export function useKanban() {
  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cleanedUpRef = useRef(false);

  useEffect(() => {
    kanbanApi.list()
      .then(setCards)
      .catch(() => setError('Failed to load board'))
      .finally(() => setLoading(false));
  }, []);

  // Auto-delete Done cards older than 7 days, runs once after initial load
  useEffect(() => {
    if (loading || cleanedUpRef.current) return;
    cleanedUpRef.current = true;

    const cutoff = Date.now() - SEVEN_DAYS_MS;
    const expired = cards.filter(
      c => c.status === 'done' && c.doneAt && new Date(c.doneAt).getTime() < cutoff
    );
    if (expired.length === 0) return;

    setCards(prev => prev.filter(c => !expired.some(e => e.id === c.id)));
    Promise.all(expired.map(c => kanbanApi.delete(c.id))).catch(() => {});
  }, [loading, cards]);

  const scheduleSave = useCallback((nextCards: KanbanCard[]) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        await kanbanApi.bulkUpdate(nextCards);
      } catch {
        setError('Failed to save — changes may not persist');
      } finally {
        setSaving(false);
      }
    }, 800);
  }, []);

  const addCard = useCallback(async (data: Pick<KanbanCard, 'title' | 'description' | 'priority' | 'status' | 'tag'>) => {
    const created = await kanbanApi.create(data);
    setCards(prev => [...prev, created]);
    return created;
  }, []);

  const updateCard = useCallback(async (id: string, patch: Partial<KanbanCard>) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
    try {
      const updated = await kanbanApi.update(id, patch);
      setCards(prev => prev.map(c => c.id === id ? updated : c));
    } catch {
      kanbanApi.list().then(setCards).catch(() => {});
      throw new Error('Failed to update card');
    }
  }, []);

  const deleteCard = useCallback(async (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
    await kanbanApi.delete(id);
  }, []);

  // Drag-drop: stamp doneAt on status change, then debounce save
  const moveCard = useCallback((updatedCards: KanbanCard[]) => {
    const stamped = stampDoneAt(updatedCards);
    setCards(stamped);
    scheduleSave(stamped);
  }, [scheduleSave]);

  const cardsByStatus = (status: KanbanStatus) => cards.filter(c => c.status === status);

  return {
    cards,
    cardsByStatus,
    loading,
    saving,
    error,
    setError,
    addCard,
    updateCard,
    deleteCard,
    moveCard,
  };
}
