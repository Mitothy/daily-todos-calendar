import { Expense } from '../../types/task.types';
import { ExpenseItem } from './ExpenseItem';

interface ExpenseListProps {
  expenses: Expense[];
  onDescriptionChange: (id: string, description: string) => void;
  onAmountChange: (id: string, amount: number) => void;
  onCategoryChange: (id: string, category: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export function ExpenseList({ expenses, onDescriptionChange, onAmountChange, onCategoryChange, onDelete, onAdd }: ExpenseListProps) {
  const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-2">
        Expenses
      </h3>

      {expenses.length > 0 && (
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="flex-1 text-xs text-gray-400 dark:text-slate-500">Description</span>
          <span className="w-20 text-xs text-gray-400 dark:text-slate-500 text-right">Amount</span>
          <span className="w-6" />
        </div>
      )}

      <div className="space-y-0">
        {expenses.map((expense) => (
          <ExpenseItem
            key={expense.id}
            expense={expense}
            onDescriptionChange={onDescriptionChange}
            onAmountChange={onAmountChange}
            onCategoryChange={onCategoryChange}
            onDelete={onDelete}
          />
        ))}
      </div>

      <button
        onClick={onAdd}
        className="mt-2 text-sm text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors flex items-center gap-1"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add expense
      </button>

      {expenses.length > 0 && (
        <div className="mt-3 pt-2 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Total</span>
          <span className="text-sm font-bold text-gray-800 dark:text-white">
            {'\u20B1'}{total.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}
