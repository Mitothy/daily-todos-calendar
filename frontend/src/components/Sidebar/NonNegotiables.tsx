import { NON_NEGOTIABLES } from '../../config/nonNegotiables';

export function NonNegotiables() {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Non-Negotiables</h3>
      <ul className="space-y-2">
        {NON_NEGOTIABLES.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-xs text-gray-400 mt-0.5 shrink-0">{i + 1}.</span>
            <span className="text-xs text-gray-600 leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
