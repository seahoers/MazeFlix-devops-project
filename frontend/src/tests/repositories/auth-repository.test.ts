import { describe, it, expect, vi, beforeEach, type Mocked } from 'vitest';
import { AuthRepository } from '../../repositories/auth-repository';
import { HttpClient } from '../../services/http-client';

vi.mock('../../services/http-client');

describe('AuthRepository', () => {
  let repo: AuthRepository;
  let httpClientMock: Mocked<HttpClient>;

  beforeEach(() => {
    (HttpClient as unknown as { mockClear: () => void }).mockClear();
    httpClientMock = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as Mocked<HttpClient>;
    (
      HttpClient as unknown as { mockImplementation: (fn: () => HttpClient) => void }
    ).mockImplementation(() => httpClientMock);
    repo = new AuthRepository();
  });

  it('signs up with the given credentials', async () => {
    const user = { id: '1', email: 'a@b.com' };
    httpClientMock.post.mockResolvedValueOnce(user);

    const result = await repo.signUp({ email: 'a@b.com', password: 'password123' });

    expect(httpClientMock.post).toHaveBeenCalledWith('/auth/signup', {
      email: 'a@b.com',
      password: 'password123',
    });
    expect(result).toEqual(user);
  });

  it('surfaces the backend message on signup failure', async () => {
    httpClientMock.post.mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 409, data: { message: 'Email already in use' } },
    });

    await expect(repo.signUp({ email: 'a@b.com', password: 'password123' })).rejects.toThrow(
      'Email already in use',
    );
  });

  it('falls back to a generic message when signup fails without a backend message', async () => {
    httpClientMock.post.mockRejectedValueOnce(new Error('network down'));

    await expect(repo.signUp({ email: 'a@b.com', password: 'password123' })).rejects.toThrow(
      'Failed to sign up',
    );
  });

  it('signs in with the given credentials', async () => {
    const user = { id: '1', email: 'a@b.com' };
    httpClientMock.post.mockResolvedValueOnce(user);

    const result = await repo.signIn({ email: 'a@b.com', password: 'password123' });

    expect(httpClientMock.post).toHaveBeenCalledWith('/auth/signin', {
      email: 'a@b.com',
      password: 'password123',
    });
    expect(result).toEqual(user);
  });

  it('surfaces the backend message on signin failure', async () => {
    httpClientMock.post.mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 401, data: { message: 'Invalid email or password' } },
    });

    await expect(repo.signIn({ email: 'a@b.com', password: 'wrong' })).rejects.toThrow(
      'Invalid email or password',
    );
  });

  it('signs out', async () => {
    httpClientMock.post.mockResolvedValueOnce(undefined);

    await repo.signOut();

    expect(httpClientMock.post).toHaveBeenCalledWith('/auth/signout');
  });

  it('throws a generic message when sign out fails', async () => {
    httpClientMock.post.mockRejectedValueOnce(new Error('network down'));

    await expect(repo.signOut()).rejects.toThrow('Failed to sign out');
  });

  it('returns the current user when signed in', async () => {
    const user = { id: '1', email: 'a@b.com' };
    httpClientMock.get.mockResolvedValueOnce(user);

    const result = await repo.getCurrentUser();

    expect(httpClientMock.get).toHaveBeenCalledWith('/auth/me');
    expect(result).toEqual(user);
  });

  it('returns null when not signed in (401)', async () => {
    httpClientMock.get.mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 401 },
    });

    const result = await repo.getCurrentUser();

    expect(result).toBeNull();
  });

  it('throws on unexpected errors while loading the current user', async () => {
    httpClientMock.get.mockRejectedValueOnce(new Error('network down'));

    await expect(repo.getCurrentUser()).rejects.toThrow('Failed to load current user');
  });
});
