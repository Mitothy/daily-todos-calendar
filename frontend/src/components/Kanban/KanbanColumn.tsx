import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard as KanbanCardType, KanbanColumn as KanbanColumnType, KanbanStatus } from '../../types/kanban.types';
import { KanbanCard } from './KanbanCard';

interface Props {
  column: KanbanColumnType;
  cards: KanbanCardType[];
  onAddCard: (status: KanbanStatus) => void;
  onEditCard: (card: KanbanCardType) => void;
}

export function KanbanColumn({ column, cards, onAddCard, onEditCard }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex flex-col w-full lg:w-72 lg:shrink-0">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${column.color}`} />
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
          {column.title}
        </h3>
        <span className="ml-auto text-xs font-medium text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-700 rounded-full px-2 py-0.5">
          {cards.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 flex flex-col gap-2.5 min-h-[120px] rounded-xl p-2.5 transition-colors
          ${isOver
            ? 'bg-blue-50/80 dark:bg-blue-900/20 ring-2 ring-blue-300 dark:ring-blue-600'
            : 'bg-gray-50/60 dark:bg-slate-800/40'}
        `}
      >
        <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map(card => (
            <KanbanCard
              key={card.id}
              card={card}
              onEdit={onEditCard}
            />
          ))}
        </SortableContext>

        {cards.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-6">
            <p className="text-xs text-gray-300 dark:text-slate-600 italic">Drop cards here</p>
          </div>
        )}
      </div>

      {/* Add card button */}
      <button
        onClick={() => onAddCard(column.id)}
        className="mt-2 flex items-center gap-1.5 px-2.5 py-2 text-xs text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/60 rounded-lg transition-colors w-full"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add card
      </button>
    </div>
  );
}
