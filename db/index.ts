import * as SQLite from 'expo-sqlite';
import { MIGRATIONS } from './migrations';
import { CREATE_TABLES, DROP_TABLES, SCHEMA_VERSION } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  const database = await SQLite.openDatabaseAsync('mero.db');

  try {
    await database.execAsync('PRAGMA foreign_keys = ON;');
    await database.execAsync('PRAGMA journal_mode = WAL;');

    await runMigrations(database);
  } catch (error) {
    await database.closeAsync();
    throw error;
  }

  db = database;
  return db;
}

const DESTRUCTIVE_SQL_PATTERN = /drop\s+table/i;

function assertSafeMigrationStep(sql: string, version: number): void {
  if (DESTRUCTIVE_SQL_PATTERN.test(sql)) {
    throw new Error(
      `Migration step for schema version ${version} contains DROP TABLE, which can destroy user data. ` +
        'Use ALTER TABLE (ADD COLUMN / DROP COLUMN / RENAME COLUMN / RENAME TO) instead.'
    );
  }
}

async function ensureMetaTable(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS _meta (
      key   TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
}

async function getSchemaVersion(database: SQLite.SQLiteDatabase): Promise<number> {
  const row = await database.getFirstAsync<{ value: string }>(
    `SELECT value FROM _meta WHERE key = 'schema_version'`
  );
  return row ? parseInt(row.value, 10) : 0;
}

async function setSchemaVersion(database: SQLite.SQLiteDatabase, version: number): Promise<void> {
  await database.runAsync(
    `INSERT OR REPLACE INTO _meta (key, value) VALUES ('schema_version', ?)`,
    [String(version)]
  );
}

async function applyFreshInstall(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.withTransactionAsync(async () => {
    await database.execAsync(CREATE_TABLES);
    await setSchemaVersion(database, SCHEMA_VERSION);
  });
}

async function applyMigrationStep(database: SQLite.SQLiteDatabase, version: number): Promise<void> {
  const step = MIGRATIONS[version];
  if (!step) {
    throw new Error(`Missing migration for schema version ${version}`);
  }
  assertSafeMigrationStep(step, version);

  await database.withTransactionAsync(async () => {
    await database.execAsync(step);
    await setSchemaVersion(database, version);
  });
}

async function applyIncrementalMigrations(
  database: SQLite.SQLiteDatabase,
  fromVersion: number
): Promise<void> {
  for (let version = fromVersion + 1; version <= SCHEMA_VERSION; version++) {
    await applyMigrationStep(database, version);
  }
}

async function runMigrations(database: SQLite.SQLiteDatabase): Promise<void> {
  await ensureMetaTable(database);

  const currentVersion = await getSchemaVersion(database);
  if (currentVersion === SCHEMA_VERSION) return;

  await database.execAsync('PRAGMA foreign_keys = OFF;');
  try {
    if (currentVersion === 0) {
      await applyFreshInstall(database);
    } else {
      await applyIncrementalMigrations(database, currentVersion);
    }
  } finally {
    await database.execAsync('PRAGMA foreign_keys = ON;');
  }
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}

export async function resetDatabase(): Promise<void> {
  const database = await getDatabase();
  await database.execAsync('PRAGMA foreign_keys = OFF;');
  await database.execAsync(DROP_TABLES);
  await database.execAsync(CREATE_TABLES);
  await database.execAsync('PRAGMA foreign_keys = ON;');
}
