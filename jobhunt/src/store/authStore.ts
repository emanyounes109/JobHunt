/**
 * Auth store — Zustand.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { LoginPayload, SignupPayload, User } from '../types/auth';
import { setCurrentUserId } from './currentUser';
import { useJobsStore } from './useJobsStore';
import { useCardsStore } from './useCardsStore';

/*  state shape  */

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  continueAsGuest: () => void;
  logout: () => void;
  clearError: () => void;
}

export type AuthStore = AuthState & AuthActions;

/*  helpers  */

const fakeNetworkDelay = (ms = 650) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const createId = (): string =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

/**
 * A stable id derived from the email itself, rather than a random uuid.
 * This is what makes "log out, then log back in with the same email" show
 * the same jobs/flashcards again instead of a random new empty account —
 * the same email always maps to the same per-user storage namespace.
 */
const idFromEmail = (email: string): string => `user_${email.trim().toLowerCase()}`;

const INITIAL_STATE: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

/*  store  */

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      login: async ({ email }) => {
        set({ isLoading: true, error: null });
        try {
          await fakeNetworkDelay();
          set({
            user: { id: idFromEmail(email), name: email.split('@')[0] || 'You', email, isGuest: false },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          set({ isLoading: false, error: 'Something went wrong. Please try again.' });
        }
      },

      signup: async ({ name, email }) => {
        set({ isLoading: true, error: null });
        try {
          await fakeNetworkDelay();
          set({
            // Signing up also lands the user on their own (currently
            // empty) per-user storage namespace — a brand-new email means
            // a brand-new, completely blank jobs board and flashcard
            // library, ready for them to fill in themselves.
            user: { id: idFromEmail(email), name, email, isGuest: false },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          set({ isLoading: false, error: 'Could not create your account. Please try again.' });
        }
      },

      continueAsGuest: () =>
        set({
          // A fresh random id every time — guest sessions always start
          // completely empty and never persist across separate guest visits.
          user: { id: createId(), name: 'Guest', email: '', isGuest: true },
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }),

      logout: () => set({ ...INITIAL_STATE }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'jhc-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

/*  optional convenience  */

export const selectUser = (s: AuthStore) => s.user;
export const selectIsAuthenticated = (s: AuthStore) => s.isAuthenticated;
export const selectAuthError = (s: AuthStore) => s.error;

/*  keep jobs/cards scoped to the user  */

let lastSyncedUserId: string | null | undefined;

/**
 * Whenever the signed-in user changes (login, signup, guest, logout),
 * repoints the per-user storage namespace (currentUser.ts) at that user
 * and forces the jobs/cards stores to re-read localStorage under the new
 * namespace. This is what makes a brand-new account show a completely
 * empty board/library, and what makes switching accounts never leak one
 * account's data into another's view.
 */
function syncPerUserStores(userId: string | null): void {
  if (userId === lastSyncedUserId) return;
  lastSyncedUserId = userId;

  setCurrentUserId(userId);
  void useJobsStore.persist.rehydrate();
  void useCardsStore.persist.rehydrate();
}

// Pick up any already-persisted session immediately on load...
syncPerUserStores(useAuthStore.getState().user?.id ?? null);
// ...and keep resyncing on every future auth change.
useAuthStore.subscribe((state) => {
  syncPerUserStores(state.user?.id ?? null);
});

export default useAuthStore;