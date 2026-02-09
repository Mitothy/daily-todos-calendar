import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Task, TasksData, DailyTaskEvent, Expense, ExpensesData } from '../types/task.types.js';
import { getColorId } from '../utils/colorMapper.js';
import { getCachedEventId, setCachedEventId, clearCachedEventId, getAllCachedDatesForMonth } from './eventCache.js';

// Build a human-readable description for the Google Calendar event
function buildEventDescription(tasks: Task[], expenses: Expense[], totalSpent: number): string {
  const lines: string[] = [];

  // Tasks section
  lines.push('📋 TASKS');
  lines.push('─'.repeat(20));
  tasks.forEach((task, i) => {
    const checkbox = task.completed ? '✅' : '⬜';
    const title = task.title || `Task ${i + 1}`;
    const notes = task.notes ? ` (${task.notes})` : '';
    lines.push(`${checkbox} ${title}${notes}`);
  });

  const completedCount = tasks.filter(t => t.completed).length;
  lines.push('');
  lines.push(`Progress: ${completedCount}/6 tasks completed`);

  // Expenses section (only if there are expenses)
  if (expenses.length > 0) {
    lines.push('');
    lines.push('💰 EXPENSES');
    lines.push('─'.repeat(20));
    expenses.forEach(expense => {
      const desc = expense.description || 'Unnamed expense';
      lines.push(`• ${desc}: ₱${expense.amount.toFixed(2)}`);
    });
    lines.push('');
    lines.push(`Total Spent: ₱${totalSpent.toFixed(2)}`);
  }
  
  return lines.join('\n');
}

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
// Returns { event, cacheWasStale } to let caller know if cache needs clearing.
async function findExistingEvent(
  calendar: any,
  date: string,
  knownEventId?: string,
  userId?: string
): Promise<{ event: any | null; cacheWasStale: boolean }> {
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
          return { event, cacheWasStale: false };
        }
      }
    } catch (err: any) {
      console.log(`[findExistingEvent] cached eventId ${knownEventId} not found (${err.message}), clearing cache and falling back to search`);
      // Clear the stale cache entry
      if (userId) {
        clearCachedEventId(userId, date);
      }
    }
  }

  // Fall back to list search with padded window for timezone safety
  // Use singleEvents=true to expand recurring events and ensure all-day events are matched correctly
  const prevDay = getPrevDay(date);
  const dayAfterNext = getNextDay(getNextDay(date));
  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: `${prevDay}T00:00:00Z`,
    timeMax: `${dayAfterNext}T23:59:59Z`,
    privateExtendedProperty: ['appId=dailyTasksTracker'],
    singleEvents: true,
    maxResults: 10,
  });

  const items = response.data.items || [];
  console.log(`[findExistingEvent] date=${date}, window=${prevDay} to ${dayAfterNext}, found ${items.length} items`);
  items.forEach((item: any) => {
    console.log(`  - event: ${item.id}, start: ${JSON.stringify(item.start)}, summary: ${item.summary}`);
  });

  const match = items.find((item: any) => {
    const eventDate = item.start?.date || item.start?.dateTime?.split('T')[0];
    return eventDate === date;
  });

  console.log(`[findExistingEvent] exact match for ${date}: ${!!match}`);
  return { event: match || null, cacheWasStale: !!knownEventId };
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
  const roundedTotalSpent = Math.round(totalSpent * 100) / 100;
  const expensesData: ExpensesData = {
    expenses,
    totalSpent: roundedTotalSpent,
    lastUpdated: new Date().toISOString(),
  };

  // Build human-readable description for the calendar event
  const description = buildEventDescription(tasks, expenses, roundedTotalSpent);

  const eventBody = {
    summary: `Daily Tasks: ${completedCount}/6`,
    description,
    colorId,
    extendedProperties: {
      private: {
        appId: 'dailyTasksTracker',
        version: '1.4',
        tasksData: JSON.stringify(tasksData),
        expensesData: JSON.stringify(expensesData),
      },
    },
  };

  const cachedId = getCachedEventId(userId, date);
  const { event: existing } = await findExistingEvent(calendar, date, cachedId ?? undefined, userId);

  if (existing) {
    console.log(`[createOrUpdate] PATCHING existing event ${existing.id} for date ${date}`);
    setCachedEventId(userId, date, existing.id!);
    try {
      await calendar.events.patch({
        calendarId: 'primary',
        eventId: existing.id!,
        requestBody: eventBody,
      });
      return existing.id!;
    } catch (err: any) {
      // If resource was deleted, clear cache and insert new
      if (err.message?.includes('deleted') || err.code === 410) {
        console.log(`[createOrUpdate] Event ${existing.id} was deleted externally, inserting new`);
        clearCachedEventId(userId, date);
      } else {
        throw err;
      }
    }
  }

  // Insert new event
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

export async function getTasksForDate(
  auth: OAuth2Client,
  date: string,
  userId: string
): Promise<DailyTaskEvent | null> {
  const calendar = google.calendar({ version: 'v3', auth });

  const cachedId = getCachedEventId(userId, date);
  const { event } = await findExistingEvent(calendar, date, cachedId ?? undefined, userId);

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
  month: number,
  userId: string
) {
  const calendar = google.calendar({ version: 'v3', auth });

  // First, try to get events from cache using strongly consistent events.get()
  // This ensures recently created/updated events are immediately visible
  const cachedEvents: Map<string, any> = new Map();
  const allCachedDates = getAllCachedDatesForMonth(userId, year, month);

  // Fetch cached events in parallel using strongly consistent API
  const cachedPromises = allCachedDates.map(async ({ date, eventId }) => {
    try {
      const response = await calendar.events.get({
        calendarId: 'primary',
        eventId,
      });
      const event = response.data;
      if (event && event.extendedProperties?.private?.appId === 'dailyTasksTracker') {
        cachedEvents.set(date, event);
      }
    } catch (err: any) {
      // Event was deleted externally, clear from cache
      clearCachedEventId(userId, date);
    }
  });
  await Promise.all(cachedPromises);

  // Also do the list query to catch any events not in our cache
  // Use explicit UTC dates to avoid timezone issues
  const startDateStr = `${year}-${String(month).padStart(2, '0')}-01T00:00:00Z`;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const endDateStr = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}T23:59:59Z`;

  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: startDateStr,
    timeMax: endDateStr,
    privateExtendedProperty: ['appId=dailyTasksTracker'],
    singleEvents: true,
    maxResults: 31,
  });

  // Merge: cached events take priority (they're more up-to-date)
  const eventsByDate = new Map<string, any>();

  // Add list results first
  for (const event of (response.data.items || [])) {
    const date = event.start?.date || '';
    if (date && !cachedEvents.has(date)) {
      eventsByDate.set(date, event);
    }
  }

  // Then overlay cached events (overwrite list results)
  for (const [date, event] of cachedEvents) {
    eventsByDate.set(date, event);
  }

  const dates = Array.from(eventsByDate.values()).map((event: any) => {
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
  const { event } = await findExistingEvent(calendar, date, cachedId ?? undefined, userId);

  if (!event) {
    // Already deleted or doesn't exist
    clearCachedEventId(userId, date);
    return false;
  }

  try {
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: event.id!,
    });
    console.log(`[deleteTaskEvent] Deleted event ${event.id} for date ${date}`);
  } catch (err: any) {
    // If already deleted, that's fine
    if (err.message?.includes('deleted') || err.code === 410) {
      console.log(`[deleteTaskEvent] Event ${event.id} was already deleted`);
    } else {
      throw err;
    }
  }

  clearCachedEventId(userId, date);
  return true;
}
