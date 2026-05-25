import { Expense, EXPENSE_CATEGORIES } from '../../types/task.types';

const CATEGORY_COLORS: Record<string, string> = {
  'Social':          'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  'Personal':        'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'Food & Beverage': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'Shopping':        'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  'Hannah':          'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
};

const EMPTY_STYLE = 'bg-gray-100 text-gray-400 dark:bg-slate-700 dark:text-slate-500';

interface ExpenseItemProps {
  expense: Expense;
  onDescriptionChange: (id: string, description: string) => void;
  onAmountChange: (id: string, amount: number) => void;
  onCategoryChange: (id: string, category: string) => void;
  onDelete: (id: string) => void;
}

export function ExpenseItem({ expense, onDescriptionChange, onAmountChange, onCategoryChange, onDelete }: ExpenseItemProps) {
  const cat = expense.category || '';
  const badgeStyle = cat ? (CATEGORY_COLORS[cat] ?? EMPTY_STYLE) : EMPTY_STYLE;
  const badgeLabel = cat
    ? cat === 'Food & Beverage' ? 'F&B'
    : cat === 'Maintenance' ? 'Maint'
    : cat
    : '—';

  return (
    <div className="flex items-center gap-2 py-1.5 sm:py-1">
      <input
        type="text"
        value={expense.description}
        onChange={(e) => onDescriptionChange(expense.id, e.target.value)}
        placeholder="Description"
        maxLength={200}
        className="flex-1 min-w-0 px-2 py-1.5 sm:py-1 border-b border-gray-200 dark:border-slate-600 focus:border-blue-400 dark:focus:border-blue-500 focus:outline-none text-sm text-gray-700 dark:text-gray-200 bg-transparent"
      />

      {/* Category badge — square button that opens a native select */}
      <div className="relative shrink-0">
        <span className={`inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-semibold leading-none whitespace-nowrap cursor-pointer select-none ${badgeStyle}`}>
          {badgeLabel}
        </span>
        <select
          value={cat}
          onChange={(e) => onCategoryChange(expense.id, e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Category"
        >
          <option value="">— none —</option>
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center shrink-0">
        <span className="text-sm text-gray-400 dark:text-slate-500 mr-1">{'₱'}</span>
        <input
          type="number"
          inputMode="decimal"
          value={expense.amount || ''}
          onChange={(e) => onAmountChange(expense.id, parseFloat(e.target.value) || 0)}
          placeholder="0.00"
          step="0.01"
          min="0"
          className="w-16 sm:w-20 px-2 py-1.5 sm:py-1 border-b border-gray-200 dark:border-slate-600 focus:border-blue-400 dark:focus:border-blue-500 focus:outline-none text-sm text-gray-700 dark:text-gray-200 text-right bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
      <button
        onClick={() => onDelete(expense.id)}
        className="inline-btn p-2 sm:p-1 text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 active:text-red-600 transition-colors"
        aria-label="Delete expense"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
