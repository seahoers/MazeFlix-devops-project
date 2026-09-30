import { app } from './app';
import { env } from './env';
import { pool } from './db/client';
import { runMigrations, waitForDatabase } from './db/migrate';

async function main(): Promise<void> {
  await waitForDatabase(pool);
  await runMigrations(pool);

  app.listen(env.PORT, () => {
    console.log(`Backend listening on port ${env.PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
