import * as SQLite from 'expo-sqlite';
import { Memo, Trip } from '../types';
import { BaseEntity, BaseRepository } from './base';

export interface TripRow extends BaseEntity {
  serverId?: string | null;
  title: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  countries: string; // JSON string in DB
}

export interface MemoRow extends BaseEntity {
  serverId?: string | null;
  tripId: string;
  title: string;
  content: string;
}

function rowToTrip(row: TripRow): Trip {
  return {
    id: row.id,
    serverId: row.serverId ?? undefined,
    title: row.title,
    imageUrl: row.imageUrl,
    startDate: row.startDate,
    endDate: row.endDate,
    countries: typeof row.countries === 'string' ? JSON.parse(row.countries) : row.countries,
  };
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

export class TripRepository extends BaseRepository<TripRow> {
  constructor(db: SQLite.SQLiteDatabase) {
    super(db, 'trips');
  }

  protected fromRow(row: Record<string, any>): TripRow {
    return row as TripRow;
  }

  async getAllTrips(): Promise<Trip[]> {
    const rows = await this.findAll();
    return rows.map(rowToTrip);
  }

  async getTripById(id: string): Promise<Trip | null> {
    const row = await this.findById(id);
    return row ? rowToTrip(row) : null;
  }

  async createTrip(data: Omit<Trip, 'id' | 'serverId'>): Promise<Trip> {
    const row = await this.create({
      ...data,
      serverId: null,
      countries: JSON.stringify(data.countries),
    } as Omit<TripRow, keyof BaseEntity>);
    return rowToTrip(row);
  }

  async updateTrip(trip: Trip): Promise<Trip | null> {
    const row = await this.update(trip.id, {
      title: trip.title,
      imageUrl: trip.imageUrl,
      startDate: trip.startDate,
      endDate: trip.endDate,
      countries: JSON.stringify(trip.countries),
    });
    return row ? rowToTrip(row) : null;
  }

  async deleteTrip(id: string): Promise<void> {
    await this.delete(id);
  }
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

  async getMemosByTripId(tripId: string): Promise<Memo[]> {
    const rows = await this.db.getAllAsync<MemoRow>(
      `SELECT * FROM memos WHERE tripId = ? AND deletedAt IS NULL ORDER BY createdAt DESC`,
      [tripId]
    );
    return rows.map(rowToMemo);
  }

  async createMemo(data: Omit<Memo, 'id' | 'serverId' | 'createdAt' | 'updatedAt'>): Promise<Memo> {
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
