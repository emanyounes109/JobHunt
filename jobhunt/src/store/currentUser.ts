/**
 * Tracks which user's data the per-user storage wrapper (persistPerUser.ts)
 * should read/write. Kept as a plain module variable rather than a Zustand
 * store so reads are perfectly synchronous — no race between "user just
 * logged in" and "jobs/cards store tries to load that user's data".
 */
let currentUserId = 'anonymous';

export function setCurrentUserId(id: string | null): void {
  currentUserId = id ?? 'anonymous';
}

export function getCurrentUserId(): string {
  return currentUserId;
}