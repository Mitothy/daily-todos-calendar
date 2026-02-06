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
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Verse of the Day</h3>
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        </div>
      ) : verse ? (
        <div>
          <p className="text-xs text-gray-600 leading-relaxed italic">"{verse.text}"</p>
          <p className="text-xs font-medium text-gray-500 mt-2 text-right">— {verse.reference}</p>
        </div>
      ) : null}
    </div>
  );
}
