import { describe, it, expect, vi, beforeEach, type Mocked } from 'vitest';
import { WatchlistRepository } from '../../repositories/watchlist-repository';
import { HttpClient } from '../../services/http-client';

vi.mock('../../services/http-client');

describe('WatchlistRepository', () => {
  let repo: WatchlistRepository;
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
    repo = new WatchlistRepository();
  });

  it('returns the watchlist show ids', async () => {
    httpClientMock.get.mockResolvedValueOnce([1, 2, 3]);

    const result = await repo.getWatchlist();

    expect(httpClientMock.get).toHaveBeenCalledWith('/watchlist');
    expect(result).toEqual([1, 2, 3]);
  });

  it('throws a generic message when loading the watchlist fails', async () => {
    httpClientMock.get.mockRejectedValueOnce(new Error('network down'));

    await expect(repo.getWatchlist()).rejects.toThrow('Failed to load watchlist');
  });

  it('adds a show to the watchlist', async () => {
    httpClientMock.post.mockResolvedValueOnce(undefined);

    await repo.addToWatchlist(42);

    expect(httpClientMock.post).toHaveBeenCalledWith('/watchlist', { showId: 42 });
  });

  it('throws a generic message when adding to the watchlist fails', async () => {
    httpClientMock.post.mockRejectedValueOnce(new Error('network down'));

    await expect(repo.addToWatchlist(42)).rejects.toThrow('Failed to add to watchlist');
  });

  it('removes a show from the watchlist', async () => {
    httpClientMock.delete.mockResolvedValueOnce(undefined);

    await repo.removeFromWatchlist(42);

    expect(httpClientMock.delete).toHaveBeenCalledWith('/watchlist/42');
  });

  it('throws a generic message when removing from the watchlist fails', async () => {
    httpClientMock.delete.mockRejectedValueOnce(new Error('network down'));

    await expect(repo.removeFromWatchlist(42)).rejects.toThrow('Failed to remove from watchlist');
  });

  it('surfaces the backend message on failure', async () => {
    httpClientMock.post.mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 400, data: { message: 'Invalid show id' } },
    });

    await expect(repo.addToWatchlist(-1)).rejects.toThrow('Invalid show id');
  });
});
