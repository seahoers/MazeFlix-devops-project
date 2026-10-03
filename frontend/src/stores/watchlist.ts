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
}

export const useWatchlistStore = defineStore('watchlist', {
  state: (): WatchlistState => ({
    showIds: [],
    loading: false,
    error: null,
    initialized: false,
  }),

  getters: {
    isInWatchlist: (state) => {
      return (showId: number): boolean => state.showIds.includes(showId);
    },
  },

  actions: {
    async fetchWatchlist() {
      try {
        this.loading = true;
        this.error = null;
        this.showIds = await watchlistRepository.getWatchlist();
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to load watchlist';
      } finally {
        this.loading = false;
        this.initialized = true;
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
      this.showIds = [];
      this.error = null;
      this.initialized = false;
    },
  },
});
