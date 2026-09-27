"use strict";

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const MIGRATIONS_DIR = path.join(__dirname, "..", "migrations");

let pool = null;

/**
 * Lazily create (and cache) the Postgres pool. Returns null when no database
 * is configured, which callers treat as "durable storage disabled" so local
 * development and the test suite run without a database.
 */
function getPool() {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;

  pool = new Pool({
    connectionString,
    max: Number(process.env.PG_POOL_MAX || 5),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    ssl: /sslmode=(require|verify)/.test(connectionString) || /neon\.tech/.test(connectionString)
      ? { rejectUnauthorized: false }
      : undefined,
  });
  pool.on("error", (err) => {
    console.error("[db] idle client error:", err.message);
  });
  return pool;
}

async function runMigrations(client) {
  const db = client || getPool();
  if (!db) return;
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  await db.query("CREATE SCHEMA IF NOT EXISTS app");
  await db.query(
    `CREATE TABLE IF NOT EXISTS app.schema_migrations (
       name TEXT PRIMARY KEY,
       applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
     )`
  );
  const applied = new Set(
    (await db.query("SELECT name FROM app.schema_migrations")).rows.map((r) => r.name)
  );

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
    const conn = await db.connect();
    try {
      await conn.query("BEGIN");
      await conn.query(sql);
      await conn.query("INSERT INTO app.schema_migrations (name) VALUES ($1)", [file]);
      await conn.query("COMMIT");
      console.log(`[db] applied migration ${file}`);
    } catch (err) {
      await conn.query("ROLLBACK").catch(() => {});
      throw err;
    } finally {
      conn.release();
    }
  }
}

async function closePool() {
  if (pool) {
    await pool.end().catch(() => {});
    pool = null;
  }
}

module.exports = { getPool, runMigrations, closePool };
