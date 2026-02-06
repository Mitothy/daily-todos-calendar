import { Header } from '../components/Layout/Header';
import { CalendarView } from '../components/Calendar/CalendarView';
import { ColorLegend } from '../components/Calendar/ColorLegend';
import { NonNegotiables } from '../components/Sidebar/NonNegotiables';
import { Goals } from '../components/Sidebar/Goals';
import { BibleVerse } from '../components/Sidebar/BibleVerse';
import { useCalendar } from '../hooks/useCalendar';

export function CalendarPage() {
  const { events, loading, monthlyTotal, distribution, loadMonth } = useCalendar();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 transition-colors">
      <Header />
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Left sidebar */}
          <div className="lg:w-52 shrink-0 order-2 lg:order-1 flex flex-col gap-4">
            <NonNegotiables />
            <Goals />
          </div>

          {/* Calendar */}
          <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-4 min-w-0 order-1 lg:order-2 transition-colors">
            <CalendarView
              events={events}
              loading={loading}
              monthlyTotal={monthlyTotal}
              loadMonth={loadMonth}
            />
          </div>

          {/* Right sidebar */}
          <div className="lg:w-52 shrink-0 flex flex-col gap-4 order-3">
            <ColorLegend distribution={distribution} totalDays={events.length} />
            <BibleVerse />
          </div>
        </div>
      </div>
    </div>
  );
}
