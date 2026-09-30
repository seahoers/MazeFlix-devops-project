import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore, setAuthRepository } from '../../stores/auth';
import type { IAuthRepository } from '../../repositories/auth-repository';

const mockAuthRepository: IAuthRepository = {
  signUp: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  getCurrentUser: vi.fn(),
};

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    setAuthRepository(mockAuthRepository);
  });

  it('initializes with default state', () => {
    const store = useAuthStore();

    expect(store.user).toBeNull();
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
    expect(store.initialized).toBe(false);
    expect(store.isAuthenticated).toBe(false);
  });

  describe('signUp', () => {
    it('sets the user on success', async () => {
      const user = { id: '1', email: 'a@b.com' };
      (mockAuthRepository.signUp as ReturnType<typeof vi.fn>).mockResolvedValueOnce(user);

      const store = useAuthStore();
      await store.signUp({ email: 'a@b.com', password: 'password123' });

      expect(store.user).toEqual(user);
      expect(store.isAuthenticated).toBe(true);
      expect(store.error).toBeNull();
    });

    it('sets the error and rethrows on failure', async () => {
      (mockAuthRepository.signUp as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Email already in use'),
      );

      const store = useAuthStore();
      await expect(store.signUp({ email: 'a@b.com', password: 'password123' })).rejects.toThrow(
        'Email already in use',
      );

      expect(store.error).toBe('Email already in use');
      expect(store.user).toBeNull();
    });
  });

  describe('signIn', () => {
    it('sets the user on success', async () => {
      const user = { id: '1', email: 'a@b.com' };
      (mockAuthRepository.signIn as ReturnType<typeof vi.fn>).mockResolvedValueOnce(user);

      const store = useAuthStore();
      await store.signIn({ email: 'a@b.com', password: 'password123' });

      expect(store.user).toEqual(user);
    });

    it('sets the error and rethrows on failure', async () => {
      (mockAuthRepository.signIn as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Invalid email or password'),
      );

      const store = useAuthStore();
      await expect(store.signIn({ email: 'a@b.com', password: 'wrong' })).rejects.toThrow(
        'Invalid email or password',
      );

      expect(store.error).toBe('Invalid email or password');
    });
  });

  describe('signOut', () => {
    it('clears the user on success', async () => {
      const store = useAuthStore();
      store.user = { id: '1', email: 'a@b.com' };
      (mockAuthRepository.signOut as ReturnType<typeof vi.fn>).mockResolvedValueOnce(undefined);

      await store.signOut();

      expect(store.user).toBeNull();
    });

    it('sets the error and rethrows on failure', async () => {
      const store = useAuthStore();
      (mockAuthRepository.signOut as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Failed to sign out'),
      );

      await expect(store.signOut()).rejects.toThrow('Failed to sign out');
      expect(store.error).toBe('Failed to sign out');
    });
  });

  describe('fetchCurrentUser', () => {
    it('sets the user and marks initialized', async () => {
      const user = { id: '1', email: 'a@b.com' };
      (mockAuthRepository.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValueOnce(user);

      const store = useAuthStore();
      await store.fetchCurrentUser();

      expect(store.user).toEqual(user);
      expect(store.initialized).toBe(true);
    });

    it('clears the user and marks initialized on failure', async () => {
      (mockAuthRepository.getCurrentUser as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('network down'),
      );

      const store = useAuthStore();
      await store.fetchCurrentUser();

      expect(store.user).toBeNull();
      expect(store.initialized).toBe(true);
    });
  });
});
