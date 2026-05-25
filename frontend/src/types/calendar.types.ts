export interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: {
    date: string;
    completedCount: number;
    colorId: string;
    eventId: string;
    totalSpent: number;
  };
}

export interface MonthData {
  month: string;
  categoryTotals: Record<string, number>;
  dates: Array<{
    date: string;
    completedCount: number;
    colorId: string;
    eventId: string;
    totalSpent: number;
  }>;
}
