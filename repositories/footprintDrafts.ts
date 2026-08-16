import * as Crypto from 'expo-crypto';
import * as SQLite from 'expo-sqlite';
import { FootprintDraft, FootprintLocation } from '../types';

export interface FootprintDraftPhoto {
  id: string;
  footprintDraftId: string;
  localUri: string;
  thumbhash: string | null;
  orderIndex: number | null;
}

interface FootprintDraftRow {
  id: string;
  tripId: string;
  title: string;
  content: string;
  date: string;
  locations: string;
  weatherInfo: string | null;
  createdAt: string;
  updatedAt: string;
}

function rowToDraft(row: FootprintDraftRow): FootprintDraft {
  return {
    id: row.id,
    tripId: row.tripId,
    title: row.title,
    content: row.content,
    date: row.date,
    locations: JSON.parse(row.locations),
    weatherInfo: row.weatherInfo ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class FootprintDraftRepository {
  constructor(private db: SQLite.SQLiteDatabase) {}

  async getByTripId(tripId: string): Promise<FootprintDraft[]> {
    const rows = await this.db.getAllAsync<FootprintDraftRow>(
      `SELECT * FROM footprint_drafts WHERE tripId = ? ORDER BY updatedAt DESC`,
      [tripId]
    );
    return rows.map(rowToDraft);
  }

  async getById(id: string): Promise<FootprintDraft | null> {
    const row = await this.db.getFirstAsync<FootprintDraftRow>(
      `SELECT * FROM footprint_drafts WHERE id = ?`,
      [id]
    );
    return row ? rowToDraft(row) : null;
  }

  async save(
    id: string,
    tripId: string,
    data: {
      title: string;
      content: string;
      date: string;
      locations: FootprintLocation[];
      weatherInfo?: string;
    }
  ): Promise<void> {
    const now = new Date().toISOString();
    const existing = await this.db.getFirstAsync<{ id: string }>(
      `SELECT id FROM footprint_drafts WHERE id = ?`,
      [id]
    );
    if (existing) {
      await this.db.runAsync(
        `UPDATE footprint_drafts SET title=?, content=?, date=?, locations=?, weatherInfo=?, updatedAt=? WHERE id=?`,
        [
          data.title,
          data.content,
          data.date,
          JSON.stringify(data.locations),
          data.weatherInfo ?? null,
          now,
          id,
        ]
      );
    } else {
      await this.db.runAsync(
        `INSERT INTO footprint_drafts (id, tripId, title, content, date, locations, weatherInfo, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?)`,
        [
          id,
          tripId,
          data.title,
          data.content,
          data.date,
          JSON.stringify(data.locations),
          data.weatherInfo ?? null,
          now,
          now,
        ]
      );
    }
  }

  async delete(id: string): Promise<void> {
    await this.db.withTransactionAsync(async () => {
      await this.db.runAsync(`DELETE FROM footprint_photos_drafts WHERE footprintDraftId = ?`, [
        id,
      ]);
      await this.db.runAsync(`DELETE FROM footprint_drafts WHERE id = ?`, [id]);
    });
  }

  async getPhotos(draftId: string): Promise<FootprintDraftPhoto[]> {
    return this.db.getAllAsync<FootprintDraftPhoto>(
      `SELECT id, footprintDraftId, localUri, thumbhash, orderIndex FROM footprint_photos_drafts WHERE footprintDraftId = ? ORDER BY orderIndex ASC, createdAt ASC`,
      [draftId]
    );
  }

  async addPhoto(
    draftId: string,
    localUri: string,
    orderIndex?: number,
    thumbhash?: string | null
  ): Promise<void> {
    const now = new Date().toISOString();
    await this.db.runAsync(
      `INSERT INTO footprint_photos_drafts (id, footprintDraftId, localUri, thumbhash, originalFilename, fileSize, mimeType, width, height, orderIndex, createdAt, updatedAt) VALUES (?,?,?,?,NULL,NULL,NULL,NULL,NULL,?,?,?)`,
      [Crypto.randomUUID(), draftId, localUri, thumbhash ?? null, orderIndex ?? null, now, now]
    );
  }

  async removePhotoByUri(draftId: string, localUri: string): Promise<void> {
    await this.db.runAsync(
      `DELETE FROM footprint_photos_drafts WHERE footprintDraftId = ? AND localUri = ?`,
      [draftId, localUri]
    );
  }
}
