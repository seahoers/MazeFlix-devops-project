import { describe, it, expect } from 'vitest';
import { extractErrorMessage } from '../../services/http-errors';

describe('extractErrorMessage', () => {
  it('returns the backend message from an axios error response', () => {
    const err = {
      isAxiosError: true,
      response: { status: 400, data: { message: 'Invalid show id' } },
    };

    expect(extractErrorMessage(err, 'fallback')).toBe('Invalid show id');
  });

  it('returns the fallback when the error is not an axios error', () => {
    expect(extractErrorMessage(new Error('network down'), 'fallback')).toBe('fallback');
  });

  it('returns the fallback when the axios error has no message in its response body', () => {
    const err = { isAxiosError: true, response: { status: 500, data: {} } };

    expect(extractErrorMessage(err, 'fallback')).toBe('fallback');
  });
});
