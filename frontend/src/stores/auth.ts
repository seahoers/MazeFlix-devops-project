import { defineStore } from 'pinia';
import { AuthRepository, type IAuthRepository } from '../repositories/auth-repository';
import type { Credentials, User } from '../types/auth';

let authRepository: IAuthRepository = new AuthRepository();

export const setAuthRepository = (repository: IAuthRepository) => {
  authRepository = repository;
};

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    loading: false,
    error: null,
    initialized: false,
  }),

  getters: {
    isAuthenticated: (state): boolean => state.user !== null,
  },

  actions: {
    async signUp(credentials: Credentials) {
      try {
        this.loading = true;
        this.error = null;
        this.user = await authRepository.signUp(credentials);
        return this.user;
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to sign up';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async signIn(credentials: Credentials) {
      try {
        this.loading = true;
        this.error = null;
        this.user = await authRepository.signIn(credentials);
        return this.user;
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to sign in';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async signOut() {
      try {
        this.loading = true;
        this.error = null;
        await authRepository.signOut();
        this.user = null;
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to sign out';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchCurrentUser() {
      // authRepository.getCurrentUser() only resolves to null for a confirmed 401 (no session);
      // it throws for anything else (timeout, 500, …). Only the confirmed case should clear an
      // existing `user`, otherwise a transient failure would wrongly sign out an active session.
      try {
        this.user = await authRepository.getCurrentUser();
        this.error = null;
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to load current user';
      } finally {
        this.initialized = true;
      }
    },
  },
});
