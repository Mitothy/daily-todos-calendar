import { useState, useCallback } from 'react';
import { api } from '../services/api';
import { CalendarEvent, MonthData } from '../types/calendar.types';

function getDaysInMonth(year: number, month: number): string[] {
  const days: string[] = [];
  const lastDay = new Date(year, month, 0).getDate();
  for (let d = 1; d <= lastDay; d++) {
    days.push(`${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  }
  return days;
}

export function useCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [monthlyTotal, setMonthlyTotal] = useState(0);

  const loadMonth = useCallback(async (date: Date) => {
    setLoading(true);
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const response = await api.get<MonthData>(`/calendar/month/${year}/${month}`);

      // Build a map of dates that have backend events
      const backendDates = new Map<string, typeof response.data.dates[0]>();
      let total = 0;
      for (const d of response.data.dates) {
        backendDates.set(d.date, d);
        total += d.totalSpent || 0;
      }
      setMonthlyTotal(Math.round(total * 100) / 100);

      // Generate events for ALL days in the month
      const allDays = getDaysInMonth(year, month);
      const calendarEvents: CalendarEvent[] = allDays.map((dayStr) => {
        const backendData = backendDates.get(dayStr);
        const completedCount = backendData?.completedCount ?? 0;
        const totalSpent = backendData?.totalSpent ?? 0;

        return {
          title: totalSpent > 0
            ? `${completedCount}/6 | \u20B1${totalSpent.toFixed(2)}`
            : `${completedCount}/6`,
          start: new Date(dayStr + 'T00:00:00'),
          end: new Date(dayStr + 'T00:00:00'),
          allDay: true,
          resource: {
            date: dayStr,
            completedCount,
            colorId: backendData?.colorId ?? '',
            eventId: backendData?.eventId ?? '',
            totalSpent,
          },
        };
      });

      setEvents(calendarEvents);
    } catch (err) {
      console.error('Failed to load month data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { events, loading, monthlyTotal, loadMonth };
}
