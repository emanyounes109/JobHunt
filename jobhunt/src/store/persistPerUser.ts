import type { StateStorage } from 'zustand/middleware';
import { getCurrentUserId } from './currentUser';

/**
 * A Zustand-compatible storage adapter that namespaces every key by the
 * currently signed-in user's id. This is what makes each account's jobs
 * and flashcards fully isolated: a brand-new account has no key yet under
 * its own id, so its store starts completely empty, while an existing
 * account's data is found and restored automatically on login.
 */
export const perUserStorage: StateStorage = {
  getItem: (name) => localStorage.getItem(`${name}:${getCurrentUserId()}`),
  setItem: (name, value) => {
    localStorage.setItem(`${name}:${getCurrentUserId()}`, value);
  },
  removeItem: (name) => {
    localStorage.removeItem(`${name}:${getCurrentUserId()}`);
  },
};