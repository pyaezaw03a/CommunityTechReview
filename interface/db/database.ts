import mysql, { type Pool, type RowDataPacket, type ResultSetHeader } from "mysql2/promise";

type QueryValue = string | number | null;

type PreparedStatement = {
  sql: string;
  values: QueryValue[];
  bind(...values: QueryValue[]): PreparedStatement;
  all<T extends RowDataPacket>(): Promise<{ results: T[] }>;
  first<T extends RowDataPacket>(): Promise<T | null>;
  run(): Promise<{ meta: { changes: number } }>;
};

export type ApplicationDatabase = {
  prepare(sql: string): PreparedStatement;
  batch(statements: PreparedStatement[]): Promise<void>;
};

let poolPromise: Promise<Pool> | null = null;
let schemaPromise: Promise<void> | null = null;

function getMysqlConfig() {
  return {
    host: process.env.MYSQL_HOST ?? "127.0.0.1",
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user: process.env.MYSQL_USER ?? "root",
    password: process.env.MYSQL_PASSWORD ?? "",
    database: process.env.MYSQL_DATABASE ?? "gadgetpulse",
    waitForConnections: true,
    connectionLimit: 10,
    charset: "utf8mb4"
  };
}

function createPreparedStatement(pool: Pool, sql: string, boundValues: QueryValue[] = []): PreparedStatement {
  const statement: PreparedStatement = {
    sql,
    values: boundValues,
    bind(...values: QueryValue[]) {
      return createPreparedStatement(pool, sql, values);
    },
    async all<T extends RowDataPacket>() {
      const [rows] = await pool.query<T[]>(sql, boundValues);
      return { results: rows };
    },
    async first<T extends RowDataPacket>() {
      const [rows] = await pool.query<T[]>(sql, boundValues);
      return rows[0] ?? null;
    },
    async run() {
      const [result] = await pool.query<ResultSetHeader>(sql, boundValues);
      return { meta: { changes: result.affectedRows } };
    }
  };
  return statement;
}

function createDatabaseClient(pool: Pool): ApplicationDatabase {
  return {
    prepare(sql: string) {
      return createPreparedStatement(pool, sql);
    },
    async batch(statements: PreparedStatement[]) {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        for (const statement of statements) {
          await connection.query<ResultSetHeader>(statement.sql, statement.values);
        }
        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    }
  };
}

async function getPool() {
  if (!poolPromise) {
    poolPromise = mysql.createPool(getMysqlConfig());
  }
  return poolPromise;
}

async function initializeDatabase(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS accounts (
      id VARCHAR(128) PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      username VARCHAR(64) NOT NULL,
      email VARCHAR(255) NOT NULL,
      password_hash TEXT NOT NULL,
      role VARCHAR(16) NOT NULL DEFAULT 'user',
      avatar_url TEXT,
      created_at VARCHAR(64) NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id VARCHAR(128) PRIMARY KEY NOT NULL,
      account_id VARCHAR(128) NOT NULL,
      created_at VARCHAR(64) NOT NULL,
      expires_at VARCHAR(64) NOT NULL,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id VARCHAR(128) PRIMARY KEY NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'under_review',
      user_id VARCHAR(128) NOT NULL,
      product_slug VARCHAR(255) NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      username VARCHAR(64) NOT NULL,
      rating DOUBLE NOT NULL,
      category_ratings TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      pros TEXT NOT NULL,
      cons TEXT NOT NULL,
      date VARCHAR(64) NOT NULL,
      ownership VARCHAR(64) NOT NULL,
      category VARCHAR(64) NOT NULL,
      photo_key TEXT,
      photo_name TEXT,
      photo_type TEXT,
      photo_size DOUBLE
    )
  `);

  const indexStatements = [
    "CREATE UNIQUE INDEX accounts_username_unique ON accounts (username)",
    "CREATE UNIQUE INDEX accounts_email_role_unique ON accounts (email, role)",
    "CREATE INDEX accounts_role_idx ON accounts (role)",
    "CREATE INDEX accounts_created_at_idx ON accounts (created_at)",
    "CREATE INDEX sessions_account_id_idx ON sessions (account_id)",
    "CREATE INDEX sessions_expires_at_idx ON sessions (expires_at)",
    "CREATE INDEX reviews_status_idx ON reviews (status)",
    "CREATE INDEX reviews_user_id_idx ON reviews (user_id)",
    "CREATE INDEX reviews_product_slug_idx ON reviews (product_slug)",
    "CREATE INDEX reviews_username_idx ON reviews (username)",
    "CREATE INDEX reviews_category_idx ON reviews (category)",
    "CREATE INDEX reviews_date_idx ON reviews (date)"
  ];

  for (const statement of indexStatements) {
    try {
      await pool.query(statement);
    } catch (error) {
      const message = String(error).toLowerCase();
      if (!message.includes("duplicate") && !message.includes("already exists")) {
        throw error;
      }
    }
  }
}

export async function getDatabase(): Promise<ApplicationDatabase> {
  const pool = await getPool();

  if (!schemaPromise) {
    schemaPromise = initializeDatabase(pool).catch((error) => {
      schemaPromise = null;
      throw error;
    });
  }

  await schemaPromise;
  return createDatabaseClient(pool);
}
