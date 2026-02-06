// File-based cache: userId -> (date -> eventId)
// Prevents duplicate event creation caused by Google Calendar's
// eventually-consistent events.list() API.
// Persists across server restarts to avoid losing cache on dev restarts.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_FILE = path.resolve(__dirname, '..', '..', '.event-cache.json');

// Cache structure: { [userId]: { [date]: eventId } }
type CacheData = Record<string, Record<string, string>>;

let cache: CacheData = {};

// Load cache from file on startup
function loadCache(): void {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, 'utf-8');
      cache = JSON.parse(data);
      console.log(`[eventCache] Loaded ${Object.keys(cache).length} users from cache file`);
    }
  } catch (err) {
    console.log('[eventCache] Could not load cache file, starting fresh');
    cache = {};
  }
}

// Save cache to file
function saveCache(): void {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
  } catch (err) {
    console.error('[eventCache] Failed to save cache file:', err);
  }
}

// Initialize cache on module load
loadCache();

export function getCachedEventId(userId: string, date: string): string | null {
  return cache[userId]?.[date] ?? null;
}

export function setCachedEventId(userId: string, date: string, eventId: string): void {
  if (!cache[userId]) {
    cache[userId] = {};
  }
  cache[userId][date] = eventId;
  saveCache();
}

export function clearCachedEventId(userId: string, date: string): void {
  if (cache[userId]) {
    delete cache[userId][date];
    saveCache();
  }
}

export function getAllCachedDatesForMonth(
  userId: string,
  year: number,
  month: number
): { date: string; eventId: string }[] {
  const userCache = cache[userId];
  if (!userCache) return [];

  const prefix = `${year}-${String(month).padStart(2, '0')}-`;
  const results: { date: string; eventId: string }[] = [];

  for (const [date, eventId] of Object.entries(userCache)) {
    if (date.startsWith(prefix)) {
      results.push({ date, eventId });
    }
  }

  return results;
}
