import * as SQLite from 'expo-sqlite';
import type { TripDetailResponse, TripResponse } from '../api/trips';
import { Memo, Trip, TripDocumentFile } from '../types';
import { BaseEntity, BaseRepository } from './base';

export interface TripRow extends BaseEntity {
  serverId?: string | null;
  title: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  countries: string;
  documents?: string;
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
    documents: typeof row.documents === 'string' ? JSON.parse(row.documents) : row.documents,
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

  async createDocument(tripId: string, document: TripDocumentFile): Promise<Trip | null> {
    const row = await this.update(tripId, {
      documents: JSON.stringify(document),
    });

    return row ? rowToTrip(row) : null;
  }

  async upsertFromServer(serverTrip: TripResponse): Promise<void> {
    if (!serverTrip.clientId) return;
    const existing = await this.findById(serverTrip.clientId);
    if (existing) {
      if (existing.syncStatus === 'pending') return;
      await this.db.runAsync(
        `UPDATE trips SET serverId=?, title=?, startDate=?, endDate=?, countries=?, imageUrl=?, syncStatus='synced' WHERE id=?`,
        [
          String(serverTrip.id),
          serverTrip.title,
          serverTrip.startDate,
          serverTrip.endDate,
          JSON.stringify(serverTrip.countries),
          serverTrip.imageUrl ?? '',
          serverTrip.clientId,
        ]
      );
    } else {
      await this.db.runAsync(
        `INSERT OR IGNORE INTO trips (id, serverId, title, imageUrl, startDate, endDate, countries, createdAt, updatedAt, syncStatus, deletedAt) VALUES (?,?,?,?,?,?,?,?,?,'synced',NULL)`,
        [
          serverTrip.clientId,
          String(serverTrip.id),
          serverTrip.title,
          serverTrip.imageUrl ?? '',
          serverTrip.startDate,
          serverTrip.endDate,
          JSON.stringify(serverTrip.countries),
          serverTrip.createdAt,
          serverTrip.createdAt,
        ]
      );
    }
  }

  async upsertDetailFromServer(serverTrip: TripDetailResponse): Promise<void> {
    if (!serverTrip.clientId) return;
    const existing = await this.findById(serverTrip.clientId);
    if (existing) {
      if (existing.syncStatus === 'pending') return;
      await this.db.runAsync(
        `UPDATE trips SET serverId=?, title=?, startDate=?, endDate=?, countries=?, imageUrl=?, syncStatus='synced', documents=? WHERE id=?`,
        [
          String(serverTrip.id),
          serverTrip.title,
          serverTrip.startDate,
          serverTrip.endDate,
          JSON.stringify(serverTrip.countries),
          serverTrip.imageUrl ?? '',
          JSON.stringify(serverTrip.documents),
          serverTrip.clientId,
        ]
      );
    } else {
      await this.db.runAsync(
        `INSERT OR IGNORE INTO trips (id, serverId, title, imageUrl, startDate, endDate, countries, createdAt, updatedAt, syncStatus, deletedAt, documents) VALUES (?,?,?,?,?,?,?,?,?,'synced',NULL,?)`,
        [
          serverTrip.clientId,
          String(serverTrip.id),
          serverTrip.title,
          serverTrip.imageUrl ?? '',
          serverTrip.startDate,
          serverTrip.endDate,
          JSON.stringify(serverTrip.countries),
          serverTrip.createdAt,
          serverTrip.createdAt,
          JSON.stringify(serverTrip.documents),
        ]
      );
    }
  }
}
