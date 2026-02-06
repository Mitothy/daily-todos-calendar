import { useEffect, useState, useCallback, useMemo } from 'react';
import { Calendar, momentLocalizer, NavigateAction, ToolbarProps } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../styles/calendar.css';
import { TaskPanel } from '../Tasks/TaskPanel';
import { CalendarEvent } from '../../types/calendar.types';
import { DayEvent } from './DayEvent';

const localizer = momentLocalizer(moment);

interface CalendarViewProps {
  events: CalendarEvent[];
  loading: boolean;
  monthlyTotal: number;
  loadMonth: (date: Date) => Promise<void>;
}

function createToolbar(monthlyTotal: number) {
  return function CustomToolbar({ label, onNavigate }: ToolbarProps) {
    return (
      <div className="flex items-center justify-between px-2 py-3 mb-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onNavigate('PREV')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 active:bg-gray-200 dark:active:bg-slate-600 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            aria-label="Previous month"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={() => onNavigate('NEXT')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 active:bg-gray-200 dark:active:bg-slate-600 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            aria-label="Next month"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white ml-2 tracking-tight">{label}</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-slate-700 rounded-lg">
            <svg className="w-4 h-4 text-gray-400 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-gray-500 dark:text-slate-400">Monthly:</span>
            <span className="text-sm font-semibold text-gray-800 dark:text-white">{'\u20B1'}{monthlyTotal.toFixed(2)}</span>
          </div>
          <button
            onClick={() => onNavigate('TODAY')}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
          >
            Today
          </button>
        </div>
      </div>
    );
  };
}

export function CalendarView({ events, loading, monthlyTotal, loadMonth }: CalendarViewProps) {
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
