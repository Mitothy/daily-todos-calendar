// In-memory cache: userId -> (date -> eventId)
// Prevents duplicate event creation caused by Google Calendar's
// eventually-consistent events.list() API.

const cache = new Map<string, Map<string, string>>();

export function getCachedEventId(userId: string, date: string): string | null {
  return cache.get(userId)?.get(date) ?? null;
}

export function setCachedEventId(userId: string, date: string, eventId: string): void {
  if (!cache.has(userId)) {
    cache.set(userId, new Map());
  }
  cache.get(userId)!.set(date, eventId);
}
