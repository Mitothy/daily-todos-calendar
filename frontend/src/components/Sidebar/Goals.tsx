import { GOALS } from '../../config/goals';

export function Goals() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-4 transition-colors">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
          <svg className="w-3 h-3 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
            <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Goals</h3>
      </div>
      <ul className="space-y-2">
        {GOALS.map((goal, i) => (
          <li key={i} className="flex items-start gap-2.5 group">
            <span className="w-5 h-5 rounded-full bg-gray-50 dark:bg-slate-700 text-[10px] font-medium text-gray-400 dark:text-slate-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/30 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors">
              {i + 1}
            </span>
            <span className="text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed">{goal}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
