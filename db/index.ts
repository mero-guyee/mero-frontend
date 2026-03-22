import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES, DROP_TABLES, SCHEMA_VERSION, SEED_CATEGORIES } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  db = await SQLite.openDatabaseAsync('mero.db');

  await db.execAsync('PRAGMA foreign_keys = ON;');
  await db.execAsync('PRAGMA journal_mode = WAL;');

  await runMigrations(db);

  return db;
}

async function runMigrations(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS _meta (
      key   TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);

  const row = await database.getFirstAsync<{ value: string }>(
    `SELECT value FROM _meta WHERE key = 'schema_version'`
  );
  const currentVersion = row ? parseInt(row.value, 10) : 0;

  if (currentVersion < SCHEMA_VERSION) {
    if (currentVersion > 0) {
      await database.execAsync(DROP_TABLES);
    }
    await database.execAsync(CREATE_TABLES);
    await database.execAsync(SEED_CATEGORIES);
    await database.runAsync(
      `INSERT OR REPLACE INTO _meta (key, value) VALUES ('schema_version', ?)`,
      [String(SCHEMA_VERSION)]
    );
  }
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}
