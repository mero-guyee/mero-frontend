import * as SQLite from 'expo-sqlite';
import { Footprint } from '../types';
import { BaseEntity, BaseRepository } from './base';

export interface FootprintRow extends BaseEntity {
  serverId?: string | null;
  tripId: string;
  title: string;
  content: string;
  date: string;
  locations: string;  // JSON string
  photoUrls: string;  // JSON string
  weatherInfo?: string | null;
}

function rowToFootprint(row: FootprintRow): Footprint {
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

export class FootprintRepository extends BaseRepository<FootprintRow> {
  constructor(db: SQLite.SQLiteDatabase) {
    super(db, 'footprints');
  }

  protected fromRow(row: Record<string, any>): FootprintRow {
    return row as FootprintRow;
  }

  async getAllFootprints(): Promise<Footprint[]> {
    const rows = await this.findAll();
    return rows.map(rowToFootprint);
  }

  async getFootprintById(id: string): Promise<Footprint | null> {
    const row = await this.findById(id);
    return row ? rowToFootprint(row) : null;
  }

  async getFootprintsByTripId(tripId: string): Promise<Footprint[]> {
    const rows = await this.db.getAllAsync<FootprintRow>(
      `SELECT * FROM footprints WHERE tripId = ? AND deletedAt IS NULL ORDER BY date DESC`,
      [tripId]
    );
    return rows.map(rowToFootprint);
  }

  async createFootprint(data: Omit<Footprint, 'id' | 'serverId'>): Promise<Footprint> {
    const row = await this.create({
      ...data,
      serverId: null,
      locations: JSON.stringify(data.locations ?? []),
      photoUrls: JSON.stringify(data.photoUrls ?? []),
      weatherInfo: data.weatherInfo ?? null,
    } as Omit<FootprintRow, keyof BaseEntity>);
    return rowToFootprint(row);
  }

  async updateFootprint(footprint: Footprint): Promise<Footprint | null> {
    const row = await this.update(footprint.id, {
      title: footprint.title,
      content: footprint.content,
      date: footprint.date,
      locations: JSON.stringify(footprint.locations),
      photoUrls: JSON.stringify(footprint.photoUrls),
      weatherInfo: footprint.weatherInfo ?? null,
    });
    return row ? rowToFootprint(row) : null;
  }

  async deleteFootprint(id: string): Promise<void> {
    await this.delete(id);
  }

  async deleteByTripId(tripId: string): Promise<void> {
    await this.db.runAsync(
      `UPDATE footprints SET deletedAt = datetime('now'), updatedAt = datetime('now'), syncStatus = 'pending' WHERE tripId = ?`,
      [tripId]
    );
  }
}
