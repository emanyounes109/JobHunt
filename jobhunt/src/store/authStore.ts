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

function syncPerUserStores(userId: string | null): void {
  if (userId === lastSyncedUserId) return;
  lastSyncedUserId = userId;

  setCurrentUserId(userId);

  useJobsStore.setState({ jobs: [] });
  useCardsStore.setState({ cards: [] });

  void useJobsStore.persist.rehydrate();
  void useCardsStore.persist.rehydrate();
}

syncPerUserStores(useAuthStore.getState().user?.id ?? null);
useAuthStore.subscribe((state) => {
  syncPerUserStores(state.user?.id ?? null);
});

export default useAuthStore;