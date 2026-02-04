import { Header } from '../components/Layout/Header';
import { CalendarView } from '../components/Calendar/CalendarView';
import { ColorLegend } from '../components/Calendar/ColorLegend';

export function CalendarPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 bg-white rounded-lg shadow p-4">
            <CalendarView />
          </div>
          <div className="lg:w-64">
            <ColorLegend />
          </div>
        </div>
      </div>
    </div>
  );
}
