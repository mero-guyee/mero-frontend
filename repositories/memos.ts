import * as SQLite from 'expo-sqlite';
import { Memo } from '../types';
import { BaseEntity, BaseRepository } from './base';

export interface MemoRow extends BaseEntity {
  id: string;
  serverId?: string | null;
  tripId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

function rowToMemo(row: MemoRow): Memo {
  return {
    id: row.id,
    serverId: row.serverId ?? undefined,
    tripId: row.tripId,
    title: row.title,
    content: row.content,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class MemoRepository extends BaseRepository<MemoRow> {
  constructor(db: SQLite.SQLiteDatabase) {
    super(db, 'memos');
  }

  protected fromRow(row: Record<string, any>): MemoRow {
    return row as MemoRow;
  }

  async getAllMemos(): Promise<Memo[]> {
    const rows = await this.findAll();
    return rows.map(rowToMemo);
  }

  async getMemoById(id: string): Promise<Memo | null> {
    const row = await this.findById(id);
    return row ? rowToMemo(row) : null;
  }

  async getMemosByTripId(tripId: string): Promise<Memo[]> {
    const rows = await this.db.getAllAsync<MemoRow>(
      `SELECT * FROM memos WHERE tripId = ? AND deletedAt IS NULL ORDER BY date DESC`,
      [tripId]
    );
    return rows.map(rowToMemo);
  }

  async createMemo(data: Omit<Memo, 'id' | 'serverId'>): Promise<Memo> {
    const row = await this.create({
      ...data,
      serverId: null,
    } as Omit<MemoRow, keyof BaseEntity>);
    return rowToMemo(row);
  }

  async updateMemo(memo: Memo): Promise<Memo | null> {
    const row = await this.update(memo.id, {
      title: memo.title,
      content: memo.content,
    });
    return row ? rowToMemo(row) : null;
  }

  async deleteMemo(id: string): Promise<void> {
    await this.delete(id);
  }

  async deleteByTripId(tripId: string): Promise<void> {
    await this.db.runAsync(
      `UPDATE memos SET deletedAt = datetime('now'), updatedAt = datetime('now'), syncStatus = 'pending' WHERE tripId = ?`,
      [tripId]
    );
  }
}
