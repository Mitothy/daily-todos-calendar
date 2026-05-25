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
  const [distribution, setDistribution] = useState<Record<number, number>>({});
  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>({});
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const loadMonth = useCallback(async (date: Date) => {
    setLoading(true);
    setCurrentDate(date);
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const response = await api.get<MonthData>(`/calendar/month/${year}/${month}`);

      const backendDates = new Map<string, typeof response.data.dates[0]>();
      let totalExpenses = 0;
      for (const d of response.data.dates) {
        backendDates.set(d.date, d);
        totalExpenses += d.totalSpent || 0;
      }
      setMonthlyTotal(Math.round(totalExpenses * 100) / 100);
      setCategoryTotals(response.data.categoryTotals || {});

      const dist: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

      const allDays = getDaysInMonth(year, month);
      const calendarEvents: CalendarEvent[] = allDays.map((dayStr) => {
        const backendData = backendDates.get(dayStr);
        const completedCount = backendData?.completedCount ?? 0;
        const totalSpent = backendData?.totalSpent ?? 0;

        dist[completedCount] = (dist[completedCount] || 0) + 1;

        let title = `${completedCount}/6`;
        if (totalSpent > 0) title += ` | -₱${totalSpent.toFixed(2)}`;

        return {
          title,
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

      setDistribution(dist);
      setEvents(calendarEvents);
    } catch (err) {
      console.error('Failed to load month data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { events, loading, monthlyTotal, distribution, categoryTotals, currentDate, loadMonth };
}
