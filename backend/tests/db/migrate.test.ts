import { describe, expect, it } from 'bun:test';
import type { Pool } from 'pg';
import { waitForDatabase } from '../../src/db/migrate';

function poolThatFails(times: number): Pool {
  let calls = 0;
  return {
    query: async () => {
      calls++;
      if (calls <= times) throw new Error('connection refused');
      return {} as never;
    },
  } as unknown as Pool;
}

describe('waitForDatabase', () => {
  it('retries until the database accepts connections', async () => {
    await expect(waitForDatabase(poolThatFails(2), 5, 0)).resolves.toBeUndefined();
  });

  it('throws once the retry budget is exhausted', async () => {
    await expect(waitForDatabase(poolThatFails(5), 2, 0)).rejects.toThrow('connection refused');
  });
});
