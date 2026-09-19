
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { LoginPayload, SignupPayload, User } from '../types/auth';
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


function switchDataToUser(userId: string | null): void {
  useJobsStore.getState().loadForUser(userId);
  useCardsStore.getState().loadForUser(userId);
}

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
          const userId = idFromEmail(email);
          set({
            user: { id: userId, name: email.split('@')[0] || 'You', email, isGuest: false },
            isAuthenticated: true,
            isLoading: false,
          });
          switchDataToUser(userId);
        } catch {
          set({ isLoading: false, error: 'Something went wrong. Please try again.' });
        }
      },

      signup: async ({ name, email }) => {
        set({ isLoading: true, error: null });
        try {
          await fakeNetworkDelay();
          const userId = idFromEmail(email);
          set({
            user: { id: userId, name, email, isGuest: false },
            isAuthenticated: true,
            isLoading: false,
          });
          switchDataToUser(userId);
        } catch {
          set({ isLoading: false, error: 'Could not create your account. Please try again.' });
        }
      },

      continueAsGuest: () => {
        const userId = createId();
        set({
          user: { id: userId, name: 'Guest', email: '', isGuest: true },
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        switchDataToUser(userId);
      },

      logout: () => {
        set({ ...INITIAL_STATE });
        switchDataToUser(null);
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'jhc-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),

      onRehydrateStorage: () => (state) => {
        switchDataToUser(state?.user?.id ?? null);
      },
    },
  ),
);

/*  optional convenience  */

export const selectUser = (s: AuthStore) => s.user;
export const selectIsAuthenticated = (s: AuthStore) => s.isAuthenticated;
export const selectAuthError = (s: AuthStore) => s.error;

export default useAuthStore;