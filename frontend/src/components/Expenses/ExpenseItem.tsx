import { Expense } from '../../types/task.types';

interface ExpenseItemProps {
  expense: Expense;
  onDescriptionChange: (id: string, description: string) => void;
  onAmountChange: (id: string, amount: number) => void;
  onDelete: (id: string) => void;
}

export function ExpenseItem({ expense, onDescriptionChange, onAmountChange, onDelete }: ExpenseItemProps) {
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
      <div className="flex items-center shrink-0">
        <span className="text-sm text-gray-400 dark:text-slate-500 mr-1">{'\u20B1'}</span>
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
