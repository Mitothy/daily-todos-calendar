import { HEX_COLORS } from '../../utils/colorMap';

interface ColorLegendProps {
  distribution: Record<number, number>;
  totalDays: number;
}

export function ColorLegend({ distribution, totalDays }: ColorLegendProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-4 transition-colors">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <svg className="w-3 h-3 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Progress Legend</h3>
      </div>
      <div className="flex flex-col gap-1.5">
        {[6, 5, 4, 3, 2, 1, 0].map((count) => {
          const occurrences = distribution[count] || 0;
          const percentage = totalDays > 0 ? Math.round((occurrences / totalDays) * 100) : 0;
          return (
            <div key={count} className="flex items-center gap-2.5 py-0.5">
              <div
                className="w-4 h-4 rounded shadow-sm"
                style={{ backgroundColor: HEX_COLORS[count] }}
              />
              <span className="text-[13px] text-gray-600 dark:text-gray-300">
                <span className="font-medium text-gray-700 dark:text-gray-200">{count}/6</span>
                <span className="text-gray-400 dark:text-slate-500 mx-1">·</span>
                <span className="text-gray-500 dark:text-slate-400">{occurrences}</span>
                <span className="text-gray-400 dark:text-slate-500 ml-1">({percentage}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
