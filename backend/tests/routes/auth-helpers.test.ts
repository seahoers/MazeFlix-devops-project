import { describe, expect, it } from 'bun:test';
import { isUniqueViolation } from '../../src/routes/auth';

describe('isUniqueViolation', () => {
  it('recognizes a Postgres unique-violation error', () => {
    expect(isUniqueViolation({ code: '23505' })).toBe(true);
  });

  it('rejects other errors', () => {
    expect(isUniqueViolation({ code: '23502' })).toBe(false);
    expect(isUniqueViolation(new Error('boom'))).toBe(false);
    expect(isUniqueViolation(null)).toBe(false);
  });
});
