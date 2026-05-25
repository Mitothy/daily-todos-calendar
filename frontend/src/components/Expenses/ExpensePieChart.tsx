import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const CATEGORY_COLORS: Record<string, string> = {
  'Social':          '#6366f1',
  'Personal':        '#f59e0b',
  'Food & Beverage': '#10b981',
  'Shopping':        '#ec4899',
  'Hannah':          '#8b5cf6',
  'Uncategorized':   '#94a3b8',
};

const DEFAULT_COLOR = '#64748b';

interface ExpensePieChartProps {
  categoryTotals: Record<string, number>;
}

export function ExpensePieChart({ categoryTotals }: ExpensePieChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const data = Object.entries(categoryTotals)
    .filter(([, amount]) => amount > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  if (data.length === 0) return null;

  const total = data.reduce((sum, d) => sum + d.value, 0);

  const renderInnerLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.07) return null;
    const RADIAN = Math.PI / 180;
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
        fontSize={12} fontWeight="700">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const tooltipStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
    borderRadius: '8px',
    color: isDark ? '#e2e8f0' : '#374151',
    fontSize: '13px',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-4 transition-colors">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
          <svg className="w-3 h-3 text-gray-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Spending Breakdown</h3>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={72}
            innerRadius={32}
            paddingAngle={2}
            label={renderInnerLabel}
            labelLine={false}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] ?? DEFAULT_COLOR} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [
              `₱${(value as number).toFixed(2)}  (${(((value as number) / total) * 100).toFixed(1)}%)`,
              name as string,
            ]}
            contentStyle={tooltipStyle}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend with amount + percentage */}
      <div className="mt-3 space-y-2">
        {data.map((entry) => {
          const pct = ((entry.value / total) * 100).toFixed(1);
          const color = CATEGORY_COLORS[entry.name] ?? DEFAULT_COLOR;
          return (
            <div key={entry.name} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="flex-1 text-[13px] text-gray-600 dark:text-slate-300 truncate">{entry.name}</span>
              <span className="text-[13px] font-medium text-gray-700 dark:text-slate-200 shrink-0">
                ₱{entry.value >= 1000 ? (entry.value / 1000).toFixed(1) + 'k' : entry.value.toFixed(0)}
              </span>
              <span className="text-[12px] text-gray-400 dark:text-slate-500 w-10 text-right shrink-0">{pct}%</span>
            </div>
          );
        })}
        <div className="pt-2 border-t border-gray-100 dark:border-slate-700 flex justify-between">
          <span className="text-[13px] text-gray-500 dark:text-slate-400">Total</span>
          <span className="text-[13px] font-semibold text-gray-700 dark:text-slate-200">
            ₱{(total / 1000).toFixed(1)}k
          </span>
        </div>
      </div>
    </div>
  );
}
