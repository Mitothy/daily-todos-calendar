import { Header } from '../components/Layout/Header';
import { CalendarView } from '../components/Calendar/CalendarView';
import { ColorLegend } from '../components/Calendar/ColorLegend';
import { NonNegotiables } from '../components/Sidebar/NonNegotiables';
import { BibleVerse } from '../components/Sidebar/BibleVerse';

export function CalendarPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left sidebar */}
          <div className="lg:w-56 shrink-0">
            <NonNegotiables />
          </div>

          {/* Calendar */}
          <div className="flex-1 bg-white rounded-lg shadow p-4 min-w-0">
            <CalendarView />
          </div>

          {/* Right sidebar */}
          <div className="lg:w-56 shrink-0 flex flex-col gap-4">
            <ColorLegend />
            <BibleVerse />
          </div>
        </div>
      </div>
    </div>
  );
}
