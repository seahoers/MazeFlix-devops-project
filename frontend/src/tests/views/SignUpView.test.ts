import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { router } from '../setup';
import SignUpView from '../../views/SignUpView.vue';
import { useAuthStore, setAuthRepository } from '../../stores/auth';
import type { IAuthRepository } from '../../repositories/auth-repository';

const mockAuthRepository: IAuthRepository = {
  signUp: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  getCurrentUser: vi.fn(),
};

describe('SignUpView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setAuthRepository(mockAuthRepository);
    useAuthStore().$reset();
    vi.spyOn(router, 'push').mockImplementation(() => Promise.resolve());
  });

  it('signs up with the entered credentials and redirects to the catalog', async () => {
    const user = { id: '1', email: 'a@b.com' };
    (mockAuthRepository.signUp as ReturnType<typeof vi.fn>).mockResolvedValueOnce(user);

    const wrapper = mount(SignUpView);
    await wrapper.find('#email').setValue('a@b.com');
    await wrapper.find('#password').setValue('password123');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(mockAuthRepository.signUp).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'password123',
    });
    expect(router.push).toHaveBeenCalledWith('/');
  });

  it('shows the error message on failure and does not redirect', async () => {
    (mockAuthRepository.signUp as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Email already in use'),
    );

    const wrapper = mount(SignUpView);
    await wrapper.find('#email').setValue('a@b.com');
    await wrapper.find('#password').setValue('password123');
    await wrapper.find('form').trigger('submit');
    await flushPromises();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Email already in use');
    expect(router.push).not.toHaveBeenCalled();
  });
});

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve));
}
