import { HEX_COLORS } from '../../utils/colorMap';

interface ProgressLegendInlineProps {
  distribution: Record<number, number>;
  totalDays: number;
  currentDate: Date;
}

export function ProgressLegendInline({ distribution, totalDays, currentDate }: ProgressLegendInlineProps) {
  // Calculate total completed tasks from distribution
  const totalCompleted = Object.entries(distribution).reduce(
    (sum, [count, occurrences]) => sum + Number(count) * occurrences,
    0
  );

  // Calculate days elapsed up to today (or end of month if viewing past month)
  const today = new Date();
  const viewingYear = currentDate.getFullYear();
  const viewingMonth = currentDate.getMonth();
  const isCurrentMonth = today.getFullYear() === viewingYear && today.getMonth() === viewingMonth;
  const daysElapsed = isCurrentMonth ? today.getDate() : totalDays;

  // Possible tasks = days elapsed × 6 tasks per day
  const possibleTasks = daysElapsed * 6;
  const overallPercentage = possibleTasks > 0 ? Math.round((totalCompleted / possibleTasks) * 100) : 0;

  // Determine progress bar color based on percentage
  const getProgressColor = (pct: number) => {
    if (pct >= 80) return 'bg-green-500';
    if (pct >= 60) return 'bg-lime-500';
    if (pct >= 40) return 'bg-yellow-500';
    if (pct >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-2 mt-2">
      {/* Overall progress bar */}
      <div className="py-2 px-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
            Overall Progress
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {totalCompleted}/{possibleTasks} tasks ({overallPercentage}%)
          </span>
        </div>
        <div className="w-full h-2.5 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
          <div
            className={`h-full ${getProgressColor(overallPercentage)} transition-all duration-300 rounded-full`}
            style={{ width: `${overallPercentage}%` }}
          />
        </div>
      </div>

      {/* Distribution legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 py-2 px-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
        {[6, 5, 4, 3, 2, 1, 0].map((count) => {
          const occurrences = distribution[count] || 0;
          const percentage = totalDays > 0 ? Math.round((occurrences / totalDays) * 100) : 0;
          return (
            <div key={count} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded shadow-sm"
                style={{ backgroundColor: HEX_COLORS[count] }}
              />
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                <span className="font-medium text-gray-600 dark:text-gray-300">{count}/6</span>
                <span className="mx-0.5">·</span>
                <span>{occurrences}</span>
                <span className="ml-0.5">({percentage}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
