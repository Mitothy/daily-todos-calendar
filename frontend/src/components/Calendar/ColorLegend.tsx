import { HEX_COLORS, COLOR_LABELS } from '../../utils/colorMap';

export function ColorLegend() {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Task Completion Colors</h3>
      <div className="flex flex-col gap-2">
        {[6, 5, 4, 3, 2, 1, 0].map((count) => (
          <div key={count} className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded"
              style={{ backgroundColor: HEX_COLORS[count] }}
            />
            <span className="text-xs text-gray-600">
              {count}/6 - {COLOR_LABELS[count]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
