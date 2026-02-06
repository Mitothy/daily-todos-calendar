import { useEffect, useState, useCallback, useMemo } from 'react';
import { Calendar, momentLocalizer, NavigateAction, ToolbarProps } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../styles/calendar.css';
import { useCalendar } from '../../hooks/useCalendar';
import { TaskPanel } from '../Tasks/TaskPanel';
import { CalendarEvent } from '../../types/calendar.types';
import { DayEvent } from './DayEvent';

const localizer = momentLocalizer(moment);

function createToolbar(monthlyTotal: number) {
  return function CustomToolbar({ label, onNavigate }: ToolbarProps) {
    return (
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('PREV')}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
            aria-label="Previous month"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={() => onNavigate('NEXT')}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
            aria-label="Next month"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
          <span className="text-lg font-semibold text-gray-800 ml-2">{label}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-500">
            Monthly: <span className="text-gray-800 font-semibold">{'\u20B1'}{monthlyTotal.toFixed(2)}</span>
          </span>
          <button
            onClick={() => onNavigate('TODAY')}
            className="px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Today
          </button>
        </div>
      </div>
    );
  };
}

export function CalendarView() {
  const { events, loading, monthlyTotal, loadMonth } = useCalendar();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const Toolbar = useMemo(() => createToolbar(monthlyTotal), [monthlyTotal]);

  useEffect(() => {
    loadMonth(currentDate);
  }, [currentDate, loadMonth]);

  const handleNavigate = useCallback((date: Date, _view: string, _action: NavigateAction) => {
    setCurrentDate(date);
  }, []);

  const handleSelectSlot = useCallback((slotInfo: { start: Date }) => {
    setSelectedDate(slotInfo.start);
  }, []);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedDate(event.start);
  }, []);

  const handlePanelClose = useCallback(() => {
    setSelectedDate(null);
    loadMonth(currentDate);
  }, [currentDate, loadMonth]);

  return (
    <div className="relative">
      {loading && (
        <div className="absolute top-2 right-2 z-10">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        </div>
      )}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '75vh' }}
        views={['month']}
        defaultView="month"
        date={currentDate}
        onNavigate={handleNavigate}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        selectable
        components={{
          toolbar: Toolbar,
          event: DayEvent,
        }}
        eventPropGetter={() => ({
          className: 'day-event-wrapper',
          style: {
            backgroundColor: 'transparent',
            border: 'none',
            padding: 0,
            margin: 0,
          },
        })}
      />

      {selectedDate && (
        <TaskPanel
          date={selectedDate}
          isOpen={!!selectedDate}
          onClose={handlePanelClose}
        />
      )}
    </div>
  );
}
