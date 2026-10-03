import { defineStore } from 'pinia';
import {
  WatchlistRepository,
  type IWatchlistRepository,
} from '../repositories/watchlist-repository';

let watchlistRepository: IWatchlistRepository = new WatchlistRepository();

export const setWatchlistRepository = (repository: IWatchlistRepository) => {
  watchlistRepository = repository;
};

interface WatchlistState {
  showIds: number[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  fetchToken: number;
}

export const useWatchlistStore = defineStore('watchlist', {
  state: (): WatchlistState => ({
    showIds: [],
    loading: false,
    error: null,
    initialized: false,
    fetchToken: 0,
  }),

  getters: {
    isInWatchlist: (state) => {
      return (showId: number): boolean => state.showIds.includes(showId);
    },
  },

  actions: {
    async fetchWatchlist() {
      // Guards against a stale response landing after `clear()` (e.g. sign-out) ran while this
      // request was in flight, which would otherwise resurrect the previous user's watchlist.
      const token = ++this.fetchToken;

      try {
        this.loading = true;
        this.error = null;
        const showIds = await watchlistRepository.getWatchlist();
        if (token !== this.fetchToken) return;
        this.showIds = showIds;
        this.initialized = true;
      } catch (err) {
        if (token !== this.fetchToken) return;
        this.error = err instanceof Error ? err.message : 'Failed to load watchlist';
      } finally {
        if (token === this.fetchToken) {
          this.loading = false;
        }
      }
    },

    async toggle(showId: number) {
      const wasInWatchlist = this.isInWatchlist(showId);

      try {
        this.error = null;
        if (wasInWatchlist) {
          this.showIds = this.showIds.filter((id) => id !== showId);
          await watchlistRepository.removeFromWatchlist(showId);
        } else {
          this.showIds = [...this.showIds, showId];
          await watchlistRepository.addToWatchlist(showId);
        }
      } catch (err) {
        this.showIds = wasInWatchlist
          ? [...this.showIds, showId]
          : this.showIds.filter((id) => id !== showId);
        this.error = err instanceof Error ? err.message : 'Failed to update watchlist';
        throw err;
      }
    },

    clear() {
      this.fetchToken++;
      this.showIds = [];
      this.loading = false;
      this.error = null;
      this.initialized = false;
    },
  },
});
