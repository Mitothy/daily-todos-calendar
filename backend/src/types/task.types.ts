export interface Task {
  id: string;
  title: string;
  completed: boolean;
  completedAt: string | null;
}

export interface TasksData {
  tasks: Task[];
  completionRate: number;
  lastUpdated: string;
}

export interface DailyTaskEvent {
  date: string;
  tasks: Task[];
  completionRate: number;
  colorId: string;
  eventId: string;
}
