import { env } from "cloudflare:workers";

let schemaPromise: Promise<void> | null = null;

async function initializeDatabase(database: D1Database) {
  await database.batch([
    database.prepare(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        username TEXT NOT NULL,
        email TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        avatar_url TEXT,
        created_at TEXT NOT NULL
      )
    `),
    database.prepare(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY NOT NULL,
        account_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
      )
    `),
    database.prepare(`
      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY NOT NULL,
        status TEXT NOT NULL DEFAULT 'under_review',
        user_id TEXT NOT NULL,
        product_slug TEXT NOT NULL,
        product_name TEXT NOT NULL,
        username TEXT NOT NULL,
        rating REAL NOT NULL,
        category_ratings TEXT NOT NULL,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        pros TEXT NOT NULL,
        cons TEXT NOT NULL,
        date TEXT NOT NULL,
        ownership TEXT NOT NULL,
        category TEXT NOT NULL,
        photo_key TEXT,
        photo_name TEXT,
        photo_type TEXT,
        photo_size REAL
      )
    `)
  ]);

  const reviewColumns = await database.prepare("PRAGMA table_info(reviews)").all<{ name: string }>();
  const existingReviewColumns = new Set(reviewColumns.results.map((column) => column.name));
  const missingColumns = [
    ["status", "ALTER TABLE reviews ADD COLUMN status TEXT NOT NULL DEFAULT 'published'"],
    ["photo_key", "ALTER TABLE reviews ADD COLUMN photo_key TEXT"],
    ["photo_name", "ALTER TABLE reviews ADD COLUMN photo_name TEXT"],
    ["photo_type", "ALTER TABLE reviews ADD COLUMN photo_type TEXT"],
    ["photo_size", "ALTER TABLE reviews ADD COLUMN photo_size REAL"]
  ] as const;

  for (const [column, statement] of missingColumns) {
    if (!existingReviewColumns.has(column)) {
      await database.prepare(statement).run();
    }
  }

  await database.batch([
    database.prepare("CREATE UNIQUE INDEX IF NOT EXISTS accounts_username_unique ON accounts (username)"),
    database.prepare("DROP INDEX IF EXISTS accounts_email_unique"),
    database.prepare("CREATE UNIQUE INDEX IF NOT EXISTS accounts_email_role_unique ON accounts (email, role)"),
    database.prepare("CREATE INDEX IF NOT EXISTS accounts_role_idx ON accounts (role)"),
    database.prepare("CREATE INDEX IF NOT EXISTS accounts_created_at_idx ON accounts (created_at)"),
    database.prepare("CREATE INDEX IF NOT EXISTS sessions_account_id_idx ON sessions (account_id)"),
    database.prepare("CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions (expires_at)"),
    database.prepare("CREATE INDEX IF NOT EXISTS reviews_status_idx ON reviews (status)"),
    database.prepare("CREATE INDEX IF NOT EXISTS reviews_user_id_idx ON reviews (user_id)"),
    database.prepare("CREATE INDEX IF NOT EXISTS reviews_product_slug_idx ON reviews (product_slug)"),
    database.prepare("CREATE INDEX IF NOT EXISTS reviews_username_idx ON reviews (username)"),
    database.prepare("CREATE INDEX IF NOT EXISTS reviews_category_idx ON reviews (category)"),
    database.prepare("CREATE INDEX IF NOT EXISTS reviews_date_idx ON reviews (date)")
  ]);
}

export async function getDatabase() {
  const database = env.DB;
  if (!database) throw new Error("The application database is unavailable.");

  if (!schemaPromise) {
    schemaPromise = initializeDatabase(database).catch((error) => {
      schemaPromise = null;
      throw error;
    });
  }
  await schemaPromise;
  return database;
}

export function getUploadsBucket() {
  const uploads = (env as unknown as { UPLOADS?: R2Bucket }).UPLOADS;
  if (!uploads) throw new Error("Photo storage is unavailable.");
  return uploads;
}
