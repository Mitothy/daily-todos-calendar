import { useState } from 'react';
import { Header } from '../components/Layout/Header';
import { CalendarView } from '../components/Calendar/CalendarView';
import { ColorLegend } from '../components/Calendar/ColorLegend';
import { NonNegotiables } from '../components/Sidebar/NonNegotiables';
import { Goals } from '../components/Sidebar/Goals';
import { BibleVerse } from '../components/Sidebar/BibleVerse';
import { useCalendar } from '../hooks/useCalendar';

export function CalendarPage() {
  const { events, loading, monthlyTotal, distribution, loadMonth } = useCalendar();
  const [showSidebars, setShowSidebars] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 transition-colors">
      <Header />
      <div className="max-w-[1400px] mx-auto px-2 sm:px-4 py-3 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-5">
          {/* Left sidebar - hidden on mobile, toggle-able */}
          <div className={`lg:w-52 shrink-0 order-2 lg:order-1 flex flex-col gap-3 sm:gap-4 ${showSidebars ? 'block' : 'hidden lg:flex'}`}>
            <NonNegotiables />
            <Goals />
          </div>

          {/* Calendar */}
          <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-2 sm:p-4 min-w-0 order-1 lg:order-2 transition-colors">
            <CalendarView
              events={events}
              loading={loading}
              monthlyTotal={monthlyTotal}
              loadMonth={loadMonth}
            />
          </div>

          {/* Right sidebar - always show legend on mobile for context */}
          <div className={`lg:w-52 shrink-0 flex flex-col gap-3 sm:gap-4 order-3 ${showSidebars ? 'block' : 'hidden lg:flex'}`}>
            <ColorLegend distribution={distribution} totalDays={events.length} />
            <BibleVerse />
          </div>
        </div>

        {/* Mobile toggle for sidebars */}
        <button
          onClick={() => setShowSidebars(!showSidebars)}
          className="lg:hidden fixed bottom-4 right-4 w-12 h-12 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-30"
          aria-label={showSidebars ? 'Hide details' : 'Show details'}
        >
          <svg
            className={`w-5 h-5 transition-transform ${showSidebars ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            {showSidebars ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>
    </div>
  );
}
