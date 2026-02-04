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
  };
}

export interface MonthData {
  month: string;
  dates: Array<{
    date: string;
    completedCount: number;
    colorId: string;
    eventId: string;
  }>;
}
