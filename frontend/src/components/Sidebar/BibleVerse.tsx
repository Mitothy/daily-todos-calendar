import { useEffect, useState } from 'react';

interface VerseData {
  text: string;
  reference: string;
}

export function BibleVerse() {
  const [verse, setVerse] = useState<VerseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchVerse() {
      setLoading(true);
      try {
        const res = await fetch('https://beta.ourmanna.com/api/v1/get/?format=json');
        const data = await res.json();
        if (cancelled) return;
        setVerse({
          text: data.verse.details.text,
          reference: data.verse.details.reference,
        });
      } catch {
        // Fallback if API is down
        if (cancelled) return;
        setVerse({
          text: 'Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
          reference: 'Proverbs 3:5-6',
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchVerse();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/50 dark:to-slate-800 rounded-xl border border-indigo-100/50 dark:border-indigo-900/50 shadow-sm p-4 transition-colors">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
          <svg className="w-3 h-3 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Verse of the Day</h3>
      </div>
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-200 dark:border-indigo-800 border-t-indigo-500 dark:border-t-indigo-400"></div>
        </div>
      ) : verse ? (
        <div>
          <p className="text-[13px] text-gray-700 dark:text-gray-200 leading-relaxed italic">"{verse.text}"</p>
          <p className="text-xs font-medium text-indigo-600/80 dark:text-indigo-400 mt-3 text-right">— {verse.reference}</p>
        </div>
      ) : null}
    </div>
  );
}
