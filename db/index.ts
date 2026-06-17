import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from './schema';

/**
 * A single pooled connection, cached on `globalThis` so Next.js HMR in
 * development doesn't open a new pool on every reload. Works against any
 * PostgreSQL connection string, including Neon's pooled endpoint.
 */
const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
};

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not set. Copy .env.example to .env and point it at a PostgreSQL database (Neon or local).',
  );
}

const pool =
  globalForDb.pool ?? new Pool({ connectionString: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema });
export { schema };
