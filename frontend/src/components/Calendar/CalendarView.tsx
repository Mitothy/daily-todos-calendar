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
  return function CustomToolbar({ label, onNavigate }: ToolbarProps<CalendarEvent, object>) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-1 sm:px-2 py-2 sm:py-3 mb-1 sm:mb-2 gap-2 sm:gap-0">
        <div className="flex items-center justify-between sm:justify-start gap-1">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onNavigate('PREV')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 active:bg-gray-200 dark:active:bg-slate-600 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              aria-label="Previous month"
            >
              <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={() => onNavigate('NEXT')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 active:bg-gray-200 dark:active:bg-slate-600 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              aria-label="Next month"
            >
              <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 6 15 12 9 18" />
              </svg>
            </button>
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white ml-1 sm:ml-2 tracking-tight">{label}</h2>
          </div>
          <button
            onClick={() => onNavigate('TODAY')}
            className="sm:hidden px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
          >
            Today
          </button>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
          <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <span className="text-xs sm:text-sm text-red-500 dark:text-red-400">Spent:</span>
            <span className="text-xs sm:text-sm font-semibold text-red-600 dark:text-red-400">{'₱'}{monthlyTotal.toFixed(2)}</span>
          </div>
          <button
            onClick={() => onNavigate('TODAY')}
            className="hidden sm:block px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
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
        className="calendar-responsive"
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
