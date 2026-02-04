export interface MonthData {
  month: string;
  dates: Array<{
    date: string;
    completedCount: number;
    colorId: string;
    eventId: string;
  }>;
}
