import * as SQLite from 'expo-sqlite';
import { Memo } from '../types';
import { BaseEntity, BaseRepository } from './base';

export interface MemoRow extends BaseEntity {
  serverId?: string | null;
  tripId: string;
  title: string;
  content: string;
  date: string;
  locations: string;  // JSON string
  photoUrls: string;  // JSON string
  weatherInfo?: string | null;
}

function rowToMemo(row: MemoRow): Memo {
  return {
    id: row.id,
    serverId: row.serverId ?? undefined,
    tripId: row.tripId,
    title: row.title,
    content: row.content,
    date: row.date,
    locations: typeof row.locations === 'string' ? JSON.parse(row.locations) : row.locations,
    photoUrls: typeof row.photoUrls === 'string' ? JSON.parse(row.photoUrls) : row.photoUrls,
    weatherInfo: row.weatherInfo ?? undefined,
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
      locations: JSON.stringify(data.locations ?? []),
      photoUrls: JSON.stringify(data.photoUrls ?? []),
      weatherInfo: data.weatherInfo ?? null,
    } as Omit<MemoRow, keyof BaseEntity>);
    return rowToMemo(row);
  }

  async updateMemo(memo: Memo): Promise<Memo | null> {
    const row = await this.update(memo.id, {
      title: memo.title,
      content: memo.content,
      date: memo.date,
      locations: JSON.stringify(memo.locations),
      photoUrls: JSON.stringify(memo.photoUrls),
      weatherInfo: memo.weatherInfo ?? null,
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
