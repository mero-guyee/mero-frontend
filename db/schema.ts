export const SCHEMA_VERSION = 7;

export const DROP_TABLES = `
  DROP TABLE IF EXISTS memos;
  DROP TABLE IF EXISTS footprints;
  DROP TABLE IF EXISTS expenses;
  DROP TABLE IF EXISTS budgets;
  DROP TABLE IF EXISTS expense_categories;
  DROP TABLE IF EXISTS notes;
  DROP TABLE IF EXISTS diaries;
  DROP TABLE IF EXISTS categories;
  DROP TABLE IF EXISTS locations;
  DROP TABLE IF EXISTS trips;
`;

export const CREATE_TABLES = `
  CREATE TABLE IF NOT EXISTS trips (
    id          TEXT PRIMARY KEY NOT NULL,
    serverId    TEXT,
    title       TEXT NOT NULL,
    imageUrl    TEXT NOT NULL DEFAULT '',
    startDate   TEXT NOT NULL,
    endDate     TEXT NOT NULL,
    countries   TEXT NOT NULL DEFAULT '[]',
    documents   TEXT NOT NULL DEFAULT '[]',
    createdAt   TEXT NOT NULL,
    updatedAt   TEXT NOT NULL,
    syncStatus  TEXT NOT NULL DEFAULT 'pending',
    deletedAt   TEXT
  );

  CREATE TABLE IF NOT EXISTS footprints (
    id          TEXT PRIMARY KEY NOT NULL,
    serverId    TEXT,
    tripId      TEXT NOT NULL,
    title       TEXT NOT NULL DEFAULT '',
    content     TEXT NOT NULL DEFAULT '',
    date        TEXT NOT NULL,
    locations   TEXT NOT NULL DEFAULT '[]',
    photoUrls   TEXT NOT NULL DEFAULT '[]',
    weatherInfo TEXT,
    createdAt   TEXT NOT NULL,
    updatedAt   TEXT NOT NULL,
    syncStatus  TEXT NOT NULL DEFAULT 'pending',
    deletedAt   TEXT,
    FOREIGN KEY (tripId) REFERENCES trips(id)
  );

  CREATE TABLE IF NOT EXISTS memos (
    id          TEXT PRIMARY KEY NOT NULL,
    serverId    TEXT,
    tripId      TEXT NOT NULL,
    title       TEXT NOT NULL,
    content     TEXT NOT NULL DEFAULT '',
    createdAt   TEXT NOT NULL,
    updatedAt   TEXT NOT NULL,
    syncStatus  TEXT NOT NULL DEFAULT 'pending',
    deletedAt   TEXT,
    FOREIGN KEY (tripId) REFERENCES trips(id)
  );

  CREATE TABLE IF NOT EXISTS expense_categories (
    id          TEXT PRIMARY KEY NOT NULL,
    serverId    TEXT,
    name        TEXT NOT NULL,
    icon        TEXT NOT NULL,
    color       TEXT NOT NULL,
    isDefault   INTEGER NOT NULL DEFAULT 0,
    createdAt   TEXT NOT NULL,
    updatedAt   TEXT NOT NULL,
    syncStatus  TEXT NOT NULL DEFAULT 'pending',
    deletedAt   TEXT
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id            TEXT PRIMARY KEY NOT NULL,
    serverId      TEXT,
    tripId        TEXT NOT NULL,
    footprintId   TEXT,
    categoryId    TEXT NOT NULL,
    categoryName  TEXT,
    categoryIcon  TEXT,
    categoryColor TEXT,
    amount        REAL NOT NULL,
    currency      TEXT NOT NULL DEFAULT 'KRW',
    description   TEXT,
    date          TEXT NOT NULL,
    location      TEXT,
    createdAt     TEXT NOT NULL,
    updatedAt     TEXT NOT NULL,
    syncStatus    TEXT NOT NULL DEFAULT 'pending',
    deletedAt     TEXT,
    FOREIGN KEY (tripId) REFERENCES trips(id),
    FOREIGN KEY (footprintId) REFERENCES footprints(id),
    FOREIGN KEY (categoryId) REFERENCES expense_categories(id)
  );

  CREATE TABLE IF NOT EXISTS budgets (
    id           TEXT PRIMARY KEY NOT NULL,
    serverId     TEXT,
    tripId       TEXT NOT NULL,
    currency     TEXT NOT NULL,
    amount       REAL NOT NULL,
    exchangeRate REAL,
    createdAt    TEXT NOT NULL,
    updatedAt    TEXT NOT NULL,
    syncStatus   TEXT NOT NULL DEFAULT 'pending',
    deletedAt    TEXT,
    FOREIGN KEY (tripId) REFERENCES trips(id)
  );

  CREATE INDEX IF NOT EXISTS idx_footprints_tripId    ON footprints(tripId);
  CREATE INDEX IF NOT EXISTS idx_footprints_date      ON footprints(date);
  CREATE INDEX IF NOT EXISTS idx_memos_tripId         ON memos(tripId);
  CREATE INDEX IF NOT EXISTS idx_expenses_tripId      ON expenses(tripId);
  CREATE INDEX IF NOT EXISTS idx_expenses_footprintId ON expenses(footprintId);
  CREATE INDEX IF NOT EXISTS idx_budgets_tripId       ON budgets(tripId);
`;

export const SEED_CATEGORIES = `
  INSERT OR REPLACE INTO expense_categories (id, name, icon, color, isDefault, createdAt, updatedAt, syncStatus)
  VALUES
    ('1', '교통',     '🚕', '#4CAF50', 1, datetime('now'), datetime('now'), 'synced'),
    ('2', '식비',     '🍽️',  '#FF9800', 1, datetime('now'), datetime('now'), 'synced'),
    ('3', '숙박',     '🏨',  '#2196F3', 1, datetime('now'), datetime('now'), 'synced'),
    ('4', '액티비티', '🎭',  '#9C27B0', 1, datetime('now'), datetime('now'), 'synced'),
    ('5', '쇼핑',     '🛍️',  '#E91E63', 1, datetime('now'), datetime('now'), 'synced'),
    ('6', '기타',     '💰',  '#607D8B', 1, datetime('now'), datetime('now'), 'synced');
`;
