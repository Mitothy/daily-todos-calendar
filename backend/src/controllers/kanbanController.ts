import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { KanbanCard } from '../types/kanban.types.js';
import { getKanbanCards, saveKanbanCards, validateCard } from '../services/kanbanService.js';

export async function listCards(req: Request, res: Response) {
  try {
    const cards = await getKanbanCards(req.auth!, req.session.userId!);
    res.json(cards);
  } catch (err: any) {
    console.error('[kanban] listCards error:', err.message);
    res.status(500).json({ error: 'Failed to load kanban cards' });
  }
}

export async function createCard(req: Request, res: Response) {
  try {
    const { title, description = '', priority = 'medium', status = 'todo', tag = '' } = req.body as Partial<KanbanCard>;

    const error = validateCard({ title, description, priority, status, tag });
    if (error) return res.status(400).json({ error });

    const cards = await getKanbanCards(req.auth!, req.session.userId!);
    const now = new Date().toISOString();
    const newCard: KanbanCard = {
      id: uuidv4(),
      title: title!,
      description,
      priority: priority!,
      status: status!,
      tag,
      createdAt: now,
      updatedAt: now,
      doneAt: status === 'done' ? now : undefined,
    };

    await saveKanbanCards(req.auth!, req.session.userId!, [...cards, newCard]);
    res.status(201).json(newCard);
  } catch (err: any) {
    console.error('[kanban] createCard error:', err.message);
    res.status(500).json({ error: 'Failed to create card' });
  }
}

export async function updateCard(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const patch = req.body as Partial<KanbanCard>;

    const error = validateCard(patch);
    if (error) return res.status(400).json({ error });

    const cards = await getKanbanCards(req.auth!, req.session.userId!);
    const idx = cards.findIndex(c => c.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Card not found' });

    const now = new Date().toISOString();
    const prev = cards[idx];
    const nextStatus = patch.status ?? prev.status;
    const doneAt = nextStatus === 'done'
      ? (prev.doneAt ?? now)
      : undefined;
    cards[idx] = { ...prev, ...patch, id, updatedAt: now, doneAt };
    await saveKanbanCards(req.auth!, req.session.userId!, cards);
    res.json(cards[idx]);
  } catch (err: any) {
    console.error('[kanban] updateCard error:', err.message);
    res.status(500).json({ error: 'Failed to update card' });
  }
}

export async function deleteCard(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const cards = await getKanbanCards(req.auth!, req.session.userId!);
    const filtered = cards.filter(c => c.id !== id);
    if (filtered.length === cards.length) return res.status(404).json({ error: 'Card not found' });

    await saveKanbanCards(req.auth!, req.session.userId!, filtered);
    res.json({ message: 'Deleted' });
  } catch (err: any) {
    console.error('[kanban] deleteCard error:', err.message);
    res.status(500).json({ error: 'Failed to delete card' });
  }
}

// Bulk reorder/status update — called after drag-drop
export async function bulkUpdate(req: Request, res: Response) {
  try {
    const { cards } = req.body as { cards: KanbanCard[] };
    if (!Array.isArray(cards)) return res.status(400).json({ error: 'cards must be an array' });

    const now = new Date().toISOString();
    const updated = cards.map(c => ({ ...c, updatedAt: now }));
    await saveKanbanCards(req.auth!, req.session.userId!, updated);
    res.json(updated);
  } catch (err: any) {
    console.error('[kanban] bulkUpdate error:', err.message);
    res.status(500).json({ error: 'Failed to save board state' });
  }
}
