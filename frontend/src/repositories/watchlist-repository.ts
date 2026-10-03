import axios from 'axios';
import { HttpClient } from '../services/http-client';

export interface IWatchlistRepository {
  getWatchlist(): Promise<number[]>;
  addToWatchlist(showId: number): Promise<void>;
  removeFromWatchlist(showId: number): Promise<void>;
}

function extractMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const message = (err.response?.data as { message?: string } | undefined)?.message;
    if (message) return message;
  }
  return fallback;
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
      throw new Error(extractMessage(err, 'Failed to load watchlist'));
    }
  }

  async addToWatchlist(showId: number): Promise<void> {
    try {
      await this.httpClient.post<void>('/watchlist', { showId });
    } catch (err) {
      throw new Error(extractMessage(err, 'Failed to add to watchlist'));
    }
  }

  async removeFromWatchlist(showId: number): Promise<void> {
    try {
      await this.httpClient.delete<void>(`/watchlist/${showId}`);
    } catch (err) {
      throw new Error(extractMessage(err, 'Failed to remove from watchlist'));
    }
  }
}
