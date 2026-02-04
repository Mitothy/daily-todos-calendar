import { useState, useCallback } from 'react';
import { api } from '../services/api';
import { CalendarEvent, MonthData } from '../types/calendar.types';

export function useCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMonth = useCallback(async (date: Date) => {
    setLoading(true);
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const response = await api.get<MonthData>(`/calendar/month/${year}/${month}`);

      const calendarEvents: CalendarEvent[] = response.data.dates.map((d) => ({
        title: `${d.completedCount}/6`,
        start: new Date(d.date + 'T00:00:00'),
        end: new Date(d.date + 'T00:00:00'),
        allDay: true,
        resource: {
          date: d.date,
          completedCount: d.completedCount,
          colorId: d.colorId,
          eventId: d.eventId,
        },
      }));

      setEvents(calendarEvents);
    } catch (err) {
      console.error('Failed to load month data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { events, loading, loadMonth };
}
