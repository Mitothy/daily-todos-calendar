import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Task, TasksData, DailyTaskEvent } from '../types/task.types.js';
import { getColorId } from '../utils/colorMapper.js';

export async function createOrUpdateTaskEvent(
  auth: OAuth2Client,
  date: string,
  tasks: Task[]
): Promise<string> {
  const calendar = google.calendar({ version: 'v3', auth });

  if (tasks.length !== 6) {
    throw new Error('Must have exactly 6 tasks');
  }

  const completedCount = tasks.filter((t) => t.completed).length;
  const colorId = getColorId(completedCount);

  const tasksData: TasksData = {
    tasks,
    completionRate: (completedCount / 6) * 100,
    lastUpdated: new Date().toISOString(),
  };

  const eventBody = {
    summary: `Daily Tasks: ${completedCount}/6`,
    colorId,
    extendedProperties: {
      private: {
        appId: 'dailyTasksTracker',
        version: '1.0',
        tasksData: JSON.stringify(tasksData),
      },
    },
  };

  const existing = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date(`${date}T00:00:00Z`).toISOString(),
    timeMax: new Date(`${date}T23:59:59Z`).toISOString(),
    privateExtendedProperty: 'appId=dailyTasksTracker',
    maxResults: 1,
  });

  if (existing.data.items && existing.data.items.length > 0) {
    const eventId = existing.data.items[0].id!;
    await calendar.events.patch({
      calendarId: 'primary',
      eventId,
      requestBody: eventBody,
    });
    return eventId;
  } else {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        ...eventBody,
        start: { date },
        end: { date },
      },
    });
    return response.data.id!;
  }
}

export async function getTasksForDate(
  auth: OAuth2Client,
  date: string
): Promise<DailyTaskEvent | null> {
  const calendar = google.calendar({ version: 'v3', auth });

  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date(`${date}T00:00:00Z`).toISOString(),
    timeMax: new Date(`${date}T23:59:59Z`).toISOString(),
    privateExtendedProperty: 'appId=dailyTasksTracker',
    maxResults: 1,
  });

  if (!response.data.items || response.data.items.length === 0) {
    return null;
  }

  const event = response.data.items[0];
  const tasksDataStr = event.extendedProperties?.private?.tasksData;

  if (!tasksDataStr) {
    return null;
  }

  const tasksData: TasksData = JSON.parse(tasksDataStr);
  const completedCount = tasksData.tasks.filter((t) => t.completed).length;

  return {
    date,
    tasks: tasksData.tasks,
    completionRate: tasksData.completionRate,
    colorId: event.colorId || getColorId(completedCount),
    eventId: event.id!,
  };
}

export async function getMonthEvents(
  auth: OAuth2Client,
  year: number,
  month: number
) {
  const calendar = google.calendar({ version: 'v3', auth });

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: startDate.toISOString(),
    timeMax: new Date(endDate.getTime() + 86400000).toISOString(),
    privateExtendedProperty: 'appId=dailyTasksTracker',
    maxResults: 31,
  });

  const dates = (response.data.items || []).map((event) => {
    const tasksDataStr = event.extendedProperties?.private?.tasksData;
    let completedCount = 0;
    if (tasksDataStr) {
      const tasksData: TasksData = JSON.parse(tasksDataStr);
      completedCount = tasksData.tasks.filter((t) => t.completed).length;
    }
    return {
      date: event.start?.date || '',
      completedCount,
      colorId: event.colorId || getColorId(completedCount),
      eventId: event.id!,
    };
  });

  return {
    month: `${year}-${String(month).padStart(2, '0')}`,
    dates,
  };
}
