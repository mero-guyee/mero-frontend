import * as Crypto from 'expo-crypto';
import * as SQLite from 'expo-sqlite';

export type SyncStatus = 'pending' | 'synced' | 'conflict';

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: SyncStatus;
  deletedAt?: string | null;
}

function now(): string {
  return new Date().toISOString();
}

function uuid(): string {
  return Crypto.randomUUID();
}

export class BaseRepository<T extends BaseEntity> {
  constructor(
    protected db: SQLite.SQLiteDatabase,
    protected table: string
  ) {}

  protected toRow(value: unknown): unknown {
    if (Array.isArray(value)) return JSON.stringify(value);
    if (typeof value === 'boolean') return value ? 1 : 0;
    return value;
  }

  protected fromRow(row: Record<string, any>): T {
    return row as T;
  }

  async findAll(): Promise<T[]> {
    const rows = await this.db.getAllAsync<Record<string, any>>(
      `SELECT * FROM ${this.table} WHERE deletedAt IS NULL ORDER BY createdAt DESC`
    );
    return rows.map((r) => this.fromRow(r));
  }

  async findById(id: string): Promise<T | null> {
    const row = await this.db.getFirstAsync<Record<string, any>>(
      `SELECT * FROM ${this.table} WHERE id = ? AND deletedAt IS NULL`,
      [id]
    );
    return row ? this.fromRow(row) : null;
  }

  async create(data: Omit<T, keyof BaseEntity>): Promise<T> {
    const entity = {
      ...data,
      id: uuid(),
      createdAt: now(),
      updatedAt: now(),
      syncStatus: 'pending' as SyncStatus,
      deletedAt: null,
    } as unknown as T;

    const keys = Object.keys(entity);
    const placeholders = keys.map(() => '?').join(', ');
    const values = keys.map((k) => this.toRow(entity[k as keyof T]));

    await this.db.runAsync(
      `INSERT INTO ${this.table} (${keys.join(', ')}) VALUES (${placeholders})`,
      values as SQLite.SQLiteBindValue[]
    );

    return entity;
  }

  async update(id: string, data: Partial<Omit<T, keyof BaseEntity>>): Promise<T | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updates = { ...data, updatedAt: now(), syncStatus: 'pending' as SyncStatus };
    const keys = Object.keys(updates);
    const setClause = keys.map((k) => `${k} = ?`).join(', ');
    const values = keys.map((k) => this.toRow(updates[k as keyof typeof updates]));

    await this.db.runAsync(`UPDATE ${this.table} SET ${setClause} WHERE id = ?`, [
      ...(values as SQLite.SQLiteBindValue[]),
      id,
    ]);

    return { ...existing, ...updates };
  }

  async delete(id: string): Promise<void> {
    await this.db.runAsync(
      `UPDATE ${this.table} SET deletedAt = ?, updatedAt = ?, syncStatus = 'pending' WHERE id = ?`,
      [now(), now(), id]
    );
  }

  // for test. do not use in production.

  async deleteAll(): Promise<void> {
    await this.db.runAsync(`DELETE FROM ${this.table}`);
  }

  async getPending(): Promise<T[]> {
    const rows = await this.db.getAllAsync<Record<string, any>>(
      `SELECT * FROM ${this.table} WHERE syncStatus = 'pending'`
    );
    return rows.map((r) => this.fromRow(r));
  }

  async markSynced(id: string): Promise<void> {
    await this.db.runAsync(`UPDATE ${this.table} SET syncStatus = 'synced' WHERE id = ?`, [id]);
  }

  async setServerId(id: string, serverId: string): Promise<void> {
    await this.db.runAsync(
      `UPDATE ${this.table} SET serverId = ?, syncStatus = 'synced' WHERE id = ?`,
      [serverId, id]
    );
  }
}
