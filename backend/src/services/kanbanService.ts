import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { KanbanCard, KanbanData } from '../types/kanban.types.js';
import { getCachedEventId, setCachedEventId, clearCachedEventId } from './eventCache.js';

const KANBAN_APP_ID = 'kanbanBoard';
const KANBAN_CACHE_KEY = '__kanban__';
const CHUNK_SIZE = 900; // bytes per extended property value (max 1024)

function chunkString(str: string): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < str.length; i += CHUNK_SIZE) {
    chunks.push(str.slice(i, i + CHUNK_SIZE));
  }
  return chunks;
}

function buildExtendedProps(data: KanbanData): Record<string, string> {
  const json = JSON.stringify(data);
  const chunks = chunkString(json);
  const props: Record<string, string> = {
    appId: KANBAN_APP_ID,
    version: '1',
    chunkCount: String(chunks.length),
  };
  chunks.forEach((chunk, i) => {
    props[`chunk${i}`] = chunk;
  });
  return props;
}

function parseExtendedProps(props: Record<string, string>): KanbanData | null {
  try {
    const count = parseInt(props.chunkCount || '0', 10);
    if (count === 0) return { cards: [], lastUpdated: new Date().toISOString() };
    const chunks: string[] = [];
    for (let i = 0; i < count; i++) {
      const chunk = props[`chunk${i}`];
      if (chunk === undefined) return null;
      chunks.push(chunk);
    }
    return JSON.parse(chunks.join(''));
  } catch {
    return null;
  }
}

async function findKanbanEvent(calendar: any, userId: string): Promise<{ event: any | null }> {
  const cachedId = getCachedEventId(userId, KANBAN_CACHE_KEY);

  if (cachedId) {
    try {
      const response = await calendar.events.get({ calendarId: 'primary', eventId: cachedId });
      const event = response.data;
      if (event?.extendedProperties?.private?.appId === KANBAN_APP_ID) {
        console.log(`[kanban] cache hit: event ${cachedId}`);
        return { event };
      }
    } catch (err: any) {
      console.log(`[kanban] cached event ${cachedId} gone, searching... (${err.message})`);
      clearCachedEventId(userId, KANBAN_CACHE_KEY);
    }
  }

  const response = await calendar.events.list({
    calendarId: 'primary',
    privateExtendedProperty: [`appId=${KANBAN_APP_ID}`],
    maxResults: 1,
  });

  const event = response.data.items?.[0] ?? null;
  if (event) {
    setCachedEventId(userId, KANBAN_CACHE_KEY, event.id!);
    console.log(`[kanban] found event via list: ${event.id}`);
  }
  return { event };
}

export async function getKanbanCards(auth: OAuth2Client, userId: string): Promise<KanbanCard[]> {
  const calendar = google.calendar({ version: 'v3', auth });
  const { event } = await findKanbanEvent(calendar, userId);
  if (!event) return [];

  const props: Record<string, string> = event.extendedProperties?.private ?? {};
  const data = parseExtendedProps(props);
  return data?.cards ?? [];
}

export async function saveKanbanCards(
  auth: OAuth2Client,
  userId: string,
  cards: KanbanCard[]
): Promise<void> {
  const calendar = google.calendar({ version: 'v3', auth });
  const data: KanbanData = { cards, lastUpdated: new Date().toISOString() };
  const extendedProperties = { private: buildExtendedProps(data) };

  const { event } = await findKanbanEvent(calendar, userId);

  if (event) {
    await calendar.events.patch({
      calendarId: 'primary',
      eventId: event.id!,
      requestBody: { extendedProperties },
    });
    console.log(`[kanban] patched event ${event.id}`);
  } else {
    const today = new Date().toISOString().split('T')[0];
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: 'Kanban Board Data',
        description: 'System event — stores project board data. Do not delete.',
        start: { date: today },
        end: { date: today },
        visibility: 'private',
        extendedProperties,
      },
    });
    setCachedEventId(userId, KANBAN_CACHE_KEY, response.data.id!);
    console.log(`[kanban] inserted new event ${response.data.id}`);
  }
}

export function validateCard(card: Partial<KanbanCard>): string | null {
  if (!card.title || typeof card.title !== 'string') return 'Title is required';
  if (card.title.length > 200) return 'Title must be 200 characters or less';
  if (card.description && card.description.length > 1000) return 'Description must be 1000 characters or less';
  if (card.priority && !['low', 'medium', 'high'].includes(card.priority)) return 'Invalid priority';
  if (card.status && !['todo', 'inprogress', 'done'].includes(card.status)) return 'Invalid status';
  if (card.tag && card.tag.length > 50) return 'Tag must be 50 characters or less';
  return null;
}
