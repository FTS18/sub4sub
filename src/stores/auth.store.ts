import { create } from 'zustand';
import { AppUser } from '../types';

interface AuthState {
  user: AppUser | null;
  isLoading: boolean;
  setUser: (user: AppUser | null) => void;
  setLoading: (loading: boolean) => void;
  clearUser: () => void;
}

/**
 * Auth store — Single source of truth for authentication state.
 * Open/Closed: extend by adding new selectors, don't modify setUser logic.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  clearUser: () => set({ user: null, isLoading: false }),
}));

// Selectors — avoids inline re-computations in components
export const selectUser = (s: AuthState) => s.user;
export const selectIsAuthenticated = (s: AuthState) => s.user !== null;
export const selectIsLoading = (s: AuthState) => s.isLoading;
