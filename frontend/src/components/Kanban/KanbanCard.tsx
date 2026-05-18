import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { KanbanCard as KanbanCardType, KanbanPriority } from '../../types/kanban.types';

const PRIORITY_STYLES: Record<KanbanPriority, string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
};

interface Props {
  card: KanbanCardType;
  overlay?: boolean;
  onEdit: (card: KanbanCardType) => void;
}

export function KanbanCard({ card, overlay = false, onEdit }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700
        p-3 shadow-sm select-none
        transition-shadow
        ${isDragging && !overlay ? 'opacity-40 shadow-none' : 'hover:shadow-md'}
        ${overlay ? 'shadow-xl rotate-1 ring-2 ring-blue-400 dark:ring-blue-500' : ''}
      `}
    >
      {/* Clickable content — opens card. Drag attrs on same div; distance:8 constraint means a tap never starts a drag. */}
      <div
        {...attributes}
        {...listeners}
        onClick={() => !overlay && onEdit(card)}
        className="cursor-pointer"
      >
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-snug pr-6">{card.title}</p>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 uppercase tracking-wide ${PRIORITY_STYLES[card.priority]}`}>
            {card.priority}
          </span>
        </div>
        {card.description && (
          <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed mb-2 line-clamp-2">{card.description}</p>
        )}
        {card.tag && (
          <span className="inline-block text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
            {card.tag}
          </span>
        )}
      </div>

    </div>
  );
}
