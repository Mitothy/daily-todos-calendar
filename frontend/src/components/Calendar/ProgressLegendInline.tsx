import { HEX_COLORS } from '../../utils/colorMap';

interface ProgressLegendInlineProps {
  distribution: Record<number, number>;
  totalDays: number;
}

export function ProgressLegendInline({ distribution, totalDays }: ProgressLegendInlineProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 py-2 px-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg mt-2">
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
  );
}
