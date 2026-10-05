import { pool } from '../../src/db/client';
import { runMigrations, waitForDatabase } from '../../src/db/migrate';

// Every route test file imports the same `pool` singleton and runs migrations against it. Bun
// runs test files sequentially in one process, so this caches the migration so it only runs once,
// and deliberately never closes the pool — an early `afterAll(() => pool.end())` would close it
// out from under files that haven't run yet; the process exiting tears the connections down.
let migrated: Promise<void> | null = null;

// Rejects (and resets) rather than staying rejected forever, so a transient failure here (e.g. a
// cold CI container still starting Postgres) doesn't permanently fail every later test file in
// this process with the same stale error.
function migrateTestDatabase(): Promise<void> {
  if (!migrated) {
    migrated = (async () => {
      await waitForDatabase(pool);

      const { rows } = await pool.query<{ name: string }>('SELECT current_database() AS name');
      const databaseName = rows[0]?.name ?? '';
      if (!databaseName.endsWith('_test')) {
        throw new Error(
          `Refusing to run: DATABASE_URL points at "${databaseName}", not a disposable test ` +
            'database. This suite truncates tables between tests — point DATABASE_URL at a ' +
            'database whose name ends in "_test" before running it (see backend/.env.example).',
        );
      }

      await runMigrations(pool);
    })().catch((err) => {
      migrated = null;
      throw err;
    });
  }

  return migrated;
}

// The sole entry point for route tests: bundles the "don't run against a real DB" guard with the
// per-test TRUNCATE so a new test file can't copy the destructive half without the safety check.
export async function resetTestDatabase(): Promise<void> {
  await migrateTestDatabase();
  await pool.query('TRUNCATE TABLE watchlist_items, sessions, users RESTART IDENTITY CASCADE');
}
