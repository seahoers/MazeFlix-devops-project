import { describe, expect, it } from 'bun:test';
import { hashPassword, verifyPassword } from '../../src/lib/password';

describe('password hashing', () => {
  it('hashes a password and verifies the same password against it', async () => {
    const hash = await hashPassword('correct-horse-battery');
    expect(hash).not.toBe('correct-horse-battery');
    expect(await verifyPassword('correct-horse-battery', hash)).toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await hashPassword('correct-horse-battery');
    expect(await verifyPassword('wrong-password', hash)).toBe(false);
  });
});
