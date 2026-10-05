import { describe, it, expect, beforeEach, vi } from 'vitest';
import router from '../../router';
import { useAuthStore } from '../../stores/auth';

describe('router auth guard', () => {
  beforeEach(async () => {
    const authStore = useAuthStore();
    authStore.user = null;
    authStore.initialized = false;
    authStore.error = null;
    await router.push('/');
  });

  it('allows navigation to routes that do not require auth', async () => {
    await router.push('/signin');

    expect(router.currentRoute.value.name).toBe('SignIn');
  });

  it('allows navigation to a protected route when already signed in', async () => {
    const authStore = useAuthStore();
    authStore.user = { id: '1', email: 'a@b.com' };
    authStore.initialized = true;

    await router.push('/watchlist');

    expect(router.currentRoute.value.name).toBe('Watchlist');
  });

  it('redirects to sign in when not signed in', async () => {
    const authStore = useAuthStore();
    authStore.initialized = true;

    await router.push('/watchlist');

    expect(router.currentRoute.value.name).toBe('SignIn');
  });

  it('fetches the current user before deciding when not yet initialized', async () => {
    const authStore = useAuthStore();
    const fetchSpy = vi.spyOn(authStore, 'fetchCurrentUser').mockImplementation(async () => {
      authStore.user = { id: '1', email: 'a@b.com' };
      authStore.initialized = true;
    });

    await router.push('/watchlist');

    expect(fetchSpy).toHaveBeenCalled();
    expect(router.currentRoute.value.name).toBe('Watchlist');
  });

  it('lets navigation through when the auth check fails for an unknown reason', async () => {
    const authStore = useAuthStore();
    vi.spyOn(authStore, 'fetchCurrentUser').mockImplementation(async () => {
      authStore.error = 'Failed to load current user';
      authStore.initialized = true;
    });

    await router.push('/watchlist');

    expect(router.currentRoute.value.name).toBe('Watchlist');
  });
});
