import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Task, TasksData, DailyTaskEvent, Expense, ExpensesData } from '../types/task.types.js';
import { getColorId } from '../utils/colorMapper.js';
import { getCachedEventId, setCachedEventId, clearCachedEventId } from './eventCache.js';

// Get the next day string for date range queries
function getNextDay(date: string): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().split('T')[0];
}

// Get the previous day string
function getPrevDay(date: string): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().split('T')[0];
}

// Find existing task event for a date.
// If knownEventId is provided (from cache), use strongly-consistent events.get()
// instead of eventually-consistent events.list().
async function findExistingEvent(calendar: any, date: string, knownEventId?: string) {
  // Try cached eventId first (strongly consistent lookup)
  if (knownEventId) {
    try {
      const response = await calendar.events.get({
        calendarId: 'primary',
        eventId: knownEventId,
      });
      const event = response.data;
      if (event && event.extendedProperties?.private?.appId === 'dailyTasksTracker') {
        const eventDate = event.start?.date || event.start?.dateTime?.split('T')[0];
        if (eventDate === date) {
          console.log(`[findExistingEvent] cache hit: found event ${knownEventId} for date=${date}`);
          return event;
        }
      }
    } catch (err: any) {
      console.log(`[findExistingEvent] cached eventId ${knownEventId} not found (${err.message}), falling back to search`);
    }
  }

  // Fall back to list search with padded window for timezone safety
  const prevDay = getPrevDay(date);
  const dayAfterNext = getNextDay(getNextDay(date));
  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: `${prevDay}T00:00:00Z`,
    timeMax: `${dayAfterNext}T00:00:00Z`,
    privateExtendedProperty: 'appId=dailyTasksTracker',
    maxResults: 10,
  });

  const items = response.data.items || [];
  const match = items.find((item: any) => {
    const eventDate = item.start?.date || item.start?.dateTime?.split('T')[0];
    return eventDate === date;
  });

  console.log(`[findExistingEvent] date=${date}, found ${items.length} items in window, exact match: ${!!match}`);
  return match || null;
}

export async function createOrUpdateTaskEvent(
  auth: OAuth2Client,
  date: string,
  tasks: Task[],
  userId: string,
  expenses: Expense[] = []
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

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const expensesData: ExpensesData = {
    expenses,
    totalSpent: Math.round(totalSpent * 100) / 100,
    lastUpdated: new Date().toISOString(),
  };

  const eventBody = {
    summary: `Daily Tasks: ${completedCount}/6`,
    colorId,
    extendedProperties: {
      private: {
        appId: 'dailyTasksTracker',
        version: '1.3',
        tasksData: JSON.stringify(tasksData),
        expensesData: JSON.stringify(expensesData),
      },
    },
  };

  const cachedId = getCachedEventId(userId, date);
  const existing = await findExistingEvent(calendar, date, cachedId ?? undefined);

  if (existing) {
    console.log(`[createOrUpdate] PATCHING existing event ${existing.id} for date ${date}`);
    setCachedEventId(userId, date, existing.id!);
    await calendar.events.patch({
      calendarId: 'primary',
      eventId: existing.id!,
      requestBody: eventBody,
    });
    return existing.id!;
  } else {
    console.log(`[createOrUpdate] INSERTING new event for date ${date}`);
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        ...eventBody,
        start: { date },
        end: { date },
      },
    });
    const newEventId = response.data.id!;
    setCachedEventId(userId, date, newEventId);
    return newEventId;
  }
}

export async function getTasksForDate(
  auth: OAuth2Client,
  date: string,
  userId: string
): Promise<DailyTaskEvent | null> {
  const calendar = google.calendar({ version: 'v3', auth });

  const cachedId = getCachedEventId(userId, date);
  const event = await findExistingEvent(calendar, date, cachedId ?? undefined);

  if (!event) {
    return null;
  }

  setCachedEventId(userId, date, event.id!);

  const tasksDataStr = event.extendedProperties?.private?.tasksData;

  if (!tasksDataStr) {
    return null;
  }

  const tasksData: TasksData = JSON.parse(tasksDataStr);
  const completedCount = tasksData.tasks.filter((t) => t.completed).length;

  // Parse expenses (backward compatible with events created before expenses existed)
  const expensesDataStr = event.extendedProperties?.private?.expensesData;
  let expenses: Expense[] = [];
  let totalSpent = 0;
  if (expensesDataStr) {
    const parsed: ExpensesData = JSON.parse(expensesDataStr);
    expenses = parsed.expenses;
    totalSpent = parsed.totalSpent;
  }

  // Backward compat: ensure each task has a notes field
  const tasks = tasksData.tasks.map((t) => ({ ...t, notes: t.notes || '' }));

  return {
    date,
    tasks,
    completionRate: tasksData.completionRate,
    colorId: event.colorId || getColorId(completedCount),
    eventId: event.id!,
    expenses,
    totalSpent,
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
    const expensesDataStr = event.extendedProperties?.private?.expensesData;
    let totalSpent = 0;
    if (expensesDataStr) {
      const expensesData: ExpensesData = JSON.parse(expensesDataStr);
      totalSpent = expensesData.totalSpent;
    }
    return {
      date: event.start?.date || '',
      completedCount,
      colorId: event.colorId || getColorId(completedCount),
      eventId: event.id!,
      totalSpent,
    };
  });

  return {
    month: `${year}-${String(month).padStart(2, '0')}`,
    dates,
  };
}

export async function deleteTaskEvent(
  auth: OAuth2Client,
  date: string,
  userId: string
): Promise<boolean> {
  const calendar = google.calendar({ version: 'v3', auth });

  const cachedId = getCachedEventId(userId, date);
  const event = await findExistingEvent(calendar, date, cachedId ?? undefined);

  if (!event) {
    return false;
  }

  await calendar.events.delete({
    calendarId: 'primary',
    eventId: event.id!,
  });

  clearCachedEventId(userId, date);
  console.log(`[deleteTaskEvent] Deleted event ${event.id} for date ${date}`);
  return true;
}
