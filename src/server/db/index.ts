import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// ─── Singleton DB connection ──────────────────────────────────────────────────
// Uses pgBouncer transaction-mode pooler for runtime queries.
// For migrations, use DIRECT_URL (session-mode).

const connectionString = process.env.DATABASE_URL || "postgres://dummy:dummy@dummy:5432/dummy";

// Prevent multiple connections in development (Next.js hot reload)
const globalForDb = global as unknown as { _db: ReturnType<typeof drizzle> | undefined };

function createDb() {
  const client = postgres(connectionString, {
    // pgBouncer requires prepare: false
    prepare: false,
  });
  return drizzle(client, { schema });
}

export const db = globalForDb._db ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb._db = db;
}
