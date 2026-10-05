import axios from 'axios';
import { HttpClient } from '../services/http-client';
import { extractErrorMessage } from '../services/http-errors';
import type { Credentials, User } from '../types/auth';

export interface IAuthRepository {
  signUp(credentials: Credentials): Promise<User>;
  signIn(credentials: Credentials): Promise<User>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}

export class AuthRepository implements IAuthRepository {
  private httpClient: HttpClient;

  constructor() {
    this.httpClient = new HttpClient({ baseURL: '/api', withCredentials: true });
  }

  async signUp(credentials: Credentials): Promise<User> {
    try {
      return await this.httpClient.post<User>('/auth/signup', credentials);
    } catch (err) {
      throw new Error(extractErrorMessage(err, 'Failed to sign up'));
    }
  }

  async signIn(credentials: Credentials): Promise<User> {
    try {
      return await this.httpClient.post<User>('/auth/signin', credentials);
    } catch (err) {
      throw new Error(extractErrorMessage(err, 'Failed to sign in'));
    }
  }

  async signOut(): Promise<void> {
    try {
      await this.httpClient.post<void>('/auth/signout');
    } catch (err) {
      throw new Error(extractErrorMessage(err, 'Failed to sign out'));
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      return await this.httpClient.get<User>('/auth/me');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        return null;
      }
      throw new Error(extractErrorMessage(err, 'Failed to load current user'));
    }
  }
}
