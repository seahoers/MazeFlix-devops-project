import { HttpClient } from '../services/http-client';
import { extractErrorMessage } from '../services/http-errors';

export interface IWatchlistRepository {
  getWatchlist(): Promise<number[]>;
  addToWatchlist(showId: number): Promise<void>;
  removeFromWatchlist(showId: number): Promise<void>;
}

export class WatchlistRepository implements IWatchlistRepository {
  private httpClient: HttpClient;

  constructor() {
    this.httpClient = new HttpClient({ baseURL: '/api', withCredentials: true });
  }

  async getWatchlist(): Promise<number[]> {
    try {
      return await this.httpClient.get<number[]>('/watchlist');
    } catch (err) {
      throw new Error(extractErrorMessage(err, 'Failed to load watchlist'));
    }
  }

  async addToWatchlist(showId: number): Promise<void> {
    try {
      await this.httpClient.post<void>('/watchlist', { showId });
    } catch (err) {
      throw new Error(extractErrorMessage(err, 'Failed to add to watchlist'));
    }
  }

  async removeFromWatchlist(showId: number): Promise<void> {
    try {
      await this.httpClient.delete<void>(`/watchlist/${showId}`);
    } catch (err) {
      throw new Error(extractErrorMessage(err, 'Failed to remove from watchlist'));
    }
  }
}
