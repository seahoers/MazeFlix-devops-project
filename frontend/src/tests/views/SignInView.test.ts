import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { router } from '../setup';
import SignInView from '../../views/SignInView.vue';
import { useAuthStore, setAuthRepository } from '../../stores/auth';
import { useWatchlistStore } from '../../stores/watchlist';
import type { IAuthRepository } from '../../repositories/auth-repository';

const mockAuthRepository: IAuthRepository = {
  signUp: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  getCurrentUser: vi.fn(),
};

describe('SignInView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setAuthRepository(mockAuthRepository);
    useAuthStore().$reset();
    useWatchlistStore().$reset();
    vi.spyOn(router, 'push').mockImplementation(() => Promise.resolve());
  });

  it('signs in with the entered credentials and redirects to the catalog', async () => {
    const user = { id: '1', email: 'a@b.com' };
    (mockAuthRepository.signIn as ReturnType<typeof vi.fn>).mockResolvedValueOnce(user);

    const wrapper = mount(SignInView);
    await wrapper.find('#email').setValue('a@b.com');
    await wrapper.find('#password').setValue('password123');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(mockAuthRepository.signIn).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'password123',
    });
    expect(router.push).toHaveBeenCalledWith('/');
  });

  it('clears a previously cached watchlist so a new user does not see it', async () => {
    const user = { id: '1', email: 'a@b.com' };
    (mockAuthRepository.signIn as ReturnType<typeof vi.fn>).mockResolvedValueOnce(user);
    const watchlistStore = useWatchlistStore();
    watchlistStore.showIds = [1, 2];
    watchlistStore.initialized = true;

    const wrapper = mount(SignInView);
    await wrapper.find('#email').setValue('a@b.com');
    await wrapper.find('#password').setValue('password123');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(watchlistStore.showIds).toEqual([]);
    expect(watchlistStore.initialized).toBe(false);
  });

  it('shows the error message on failure and does not redirect', async () => {
    (mockAuthRepository.signIn as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Invalid email or password'),
    );

    const wrapper = mount(SignInView);
    await wrapper.find('#email').setValue('a@b.com');
    await wrapper.find('#password').setValue('wrong');
    await wrapper.find('form').trigger('submit');
    await flushPromises();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Invalid email or password');
    expect(router.push).not.toHaveBeenCalled();
  });
});

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve));
}
