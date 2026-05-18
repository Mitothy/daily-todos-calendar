import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { KanbanCard as KanbanCardType, KanbanStatus, COLUMNS } from '../../types/kanban.types';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { CardModal } from './CardModal';
import { useKanban } from '../../hooks/useKanban';

export function KanbanBoard() {
  const { cards, cardsByStatus, loading, saving, error, setError, addCard, updateCard, deleteCard, moveCard } = useKanban();

  const [activeCard, setActiveCard] = useState<KanbanCardType | null>(null);
  const [activeTab, setActiveTab] = useState<KanbanStatus>('todo');
  const [modal, setModal] = useState<{ mode: 'add'; status: KanbanStatus } | { mode: 'edit'; card: KanbanCardType } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  function onDragStart({ active }: DragStartEvent) {
    setActiveCard(cards.find(c => c.id === active.id) ?? null);
  }

  function onDragOver({ active, over }: DragOverEvent) {
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const dragged = cards.find(c => c.id === activeId);
    if (!dragged) return;

    const isOverColumn = COLUMNS.some(col => col.id === overId);
    if (isOverColumn && dragged.status !== overId) {
      moveCard(cards.map(c => c.id === activeId ? { ...c, status: overId as KanbanStatus } : c));
    }
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    setActiveCard(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const dragged = cards.find(c => c.id === activeId);
    const overCard = cards.find(c => c.id === overId);

    if (!dragged) return;

    if (overCard && dragged.status !== overCard.status) {
      moveCard(cards.map(c => c.id === activeId ? { ...c, status: overCard.status } : c));
      return;
    }

    const colCards = cards.filter(c => c.status === dragged.status);
    const rest = cards.filter(c => c.status !== dragged.status);
    const oldIdx = colCards.findIndex(c => c.id === activeId);
    const newIdx = colCards.findIndex(c => c.id === overId);
    if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
      moveCard([...rest, ...arrayMove(colCards, oldIdx, newIdx)]);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4 flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-300">
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-2">✕</button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        {saving ? (
          <span className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1.5">
            <span className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
            Saving…
          </span>
        ) : <span />}
        <button
          onClick={() => setModal({ mode: 'add', status: 'todo' })}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New card
        </button>
      </div>

      {/* Mobile column tabs */}
      <div className="flex lg:hidden border-b border-gray-200 dark:border-slate-700 mb-4">
        {COLUMNS.map(col => (
          <button
            key={col.id}
            onClick={() => setActiveTab(col.id)}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors border-b-2 ${
              activeTab === col.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-400 dark:text-slate-500'
            }`}
          >
            {col.title}
            <span className="ml-1 text-gray-400 dark:text-slate-600 font-normal">({cardsByStatus(col.id).length})</span>
          </button>
        ))}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        {/* Desktop: 3 columns */}
        <div className="hidden lg:flex gap-5 overflow-x-auto pb-4">
          {COLUMNS.map(col => (
            <KanbanColumn
              key={col.id}
              column={col}
              cards={cardsByStatus(col.id)}
              onAddCard={status => setModal({ mode: 'add', status })}
              onEditCard={card => setModal({ mode: 'edit', card })}
            />
          ))}
        </div>

        {/* Mobile: one tab at a time */}
        <div className="lg:hidden">
          {COLUMNS.filter(col => col.id === activeTab).map(col => (
            <KanbanColumn
              key={col.id}
              column={col}
              cards={cardsByStatus(col.id)}
              onAddCard={status => setModal({ mode: 'add', status })}
              onEditCard={card => setModal({ mode: 'edit', card })}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCard && <KanbanCard card={activeCard} overlay onEdit={() => {}} />}
        </DragOverlay>
      </DndContext>

      {modal && (
        <CardModal
          mode={modal.mode}
          initialStatus={modal.mode === 'add' ? modal.status : undefined}
          card={modal.mode === 'edit' ? modal.card : undefined}
          onSave={async data => {
            if (modal.mode === 'add') {
              await addCard(data);
            } else {
              await updateCard(modal.card.id, data);
            }
          }}
          onDelete={modal.mode === 'edit' ? async () => { await deleteCard(modal.card.id); setModal(null); } : undefined}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
