import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useWatchlistStore, setWatchlistRepository } from '../../stores/watchlist';
import type { IWatchlistRepository } from '../../repositories/watchlist-repository';

const mockWatchlistRepository: IWatchlistRepository = {
  getWatchlist: vi.fn(),
  addToWatchlist: vi.fn(),
  removeFromWatchlist: vi.fn(),
};

describe('useWatchlistStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    setWatchlistRepository(mockWatchlistRepository);
  });

  it('initializes with default state', () => {
    const store = useWatchlistStore();

    expect(store.showIds).toEqual([]);
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
    expect(store.initialized).toBe(false);
  });

  describe('fetchWatchlist', () => {
    it('sets the show ids and marks initialized', async () => {
      (mockWatchlistRepository.getWatchlist as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
        1, 2,
      ]);

      const store = useWatchlistStore();
      await store.fetchWatchlist();

      expect(store.showIds).toEqual([1, 2]);
      expect(store.initialized).toBe(true);
      expect(store.loading).toBe(false);
    });

    it('sets the error without marking initialized, so a later mount can retry', async () => {
      (mockWatchlistRepository.getWatchlist as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Failed to load watchlist'),
      );

      const store = useWatchlistStore();
      await store.fetchWatchlist();

      expect(store.error).toBe('Failed to load watchlist');
      expect(store.initialized).toBe(false);
      expect(store.loading).toBe(false);
    });

    it('discards a stale response that resolves after clear() ran', async () => {
      let resolveFirstFetch!: (showIds: number[]) => void;
      (mockWatchlistRepository.getWatchlist as ReturnType<typeof vi.fn>).mockImplementationOnce(
        () => new Promise((resolve) => (resolveFirstFetch = resolve)),
      );

      const store = useWatchlistStore();
      const firstFetch = store.fetchWatchlist();
      store.clear();
      resolveFirstFetch([1, 2]);
      await firstFetch;

      expect(store.showIds).toEqual([]);
      expect(store.initialized).toBe(false);
    });
  });

  describe('isInWatchlist', () => {
    it('reflects whether a show id is present', async () => {
      (mockWatchlistRepository.getWatchlist as ReturnType<typeof vi.fn>).mockResolvedValueOnce([1]);

      const store = useWatchlistStore();
      await store.fetchWatchlist();

      expect(store.isInWatchlist(1)).toBe(true);
      expect(store.isInWatchlist(2)).toBe(false);
    });
  });

  describe('toggle', () => {
    it('adds a show id that is not yet in the watchlist', async () => {
      (mockWatchlistRepository.addToWatchlist as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        undefined,
      );

      const store = useWatchlistStore();
      await store.toggle(42);

      expect(store.showIds).toEqual([42]);
      expect(mockWatchlistRepository.addToWatchlist).toHaveBeenCalledWith(42);
    });

    it('removes a show id that is already in the watchlist', async () => {
      (mockWatchlistRepository.getWatchlist as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
        42,
      ]);
      (
        mockWatchlistRepository.removeFromWatchlist as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce(undefined);

      const store = useWatchlistStore();
      await store.fetchWatchlist();
      await store.toggle(42);

      expect(store.showIds).toEqual([]);
      expect(mockWatchlistRepository.removeFromWatchlist).toHaveBeenCalledWith(42);
    });

    it('reverts the optimistic update and sets the error on failure', async () => {
      (mockWatchlistRepository.addToWatchlist as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Failed to add to watchlist'),
      );

      const store = useWatchlistStore();
      await expect(store.toggle(42)).rejects.toThrow('Failed to add to watchlist');

      expect(store.showIds).toEqual([]);
      expect(store.error).toBe('Failed to add to watchlist');
    });
  });

  describe('clear', () => {
    it('resets the store to its initial state', async () => {
      (mockWatchlistRepository.getWatchlist as ReturnType<typeof vi.fn>).mockResolvedValueOnce([1]);

      const store = useWatchlistStore();
      await store.fetchWatchlist();
      store.clear();

      expect(store.showIds).toEqual([]);
      expect(store.error).toBeNull();
      expect(store.initialized).toBe(false);
    });
  });
});
