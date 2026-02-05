import { Expense } from '../../types/task.types';
import { ExpenseItem } from './ExpenseItem';

interface ExpenseListProps {
  expenses: Expense[];
  onDescriptionChange: (id: string, description: string) => void;
  onAmountChange: (id: string, amount: number) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export function ExpenseList({ expenses, onDescriptionChange, onAmountChange, onDelete, onAdd }: ExpenseListProps) {
  const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
        Expenses
      </h3>

      {expenses.length > 0 && (
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="flex-1 text-xs text-gray-400">Description</span>
          <span className="w-20 text-xs text-gray-400 text-right">Amount</span>
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
            onDelete={onDelete}
          />
        ))}
      </div>

      <button
        onClick={onAdd}
        className="mt-2 text-sm text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add expense
      </button>

      {expenses.length > 0 && (
        <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">Total</span>
          <span className="text-sm font-bold text-gray-800">
            {'\u20B1'}{total.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}
