import * as Crypto from 'expo-crypto';
import * as SQLite from 'expo-sqlite';
import { PhotoDetailItem } from '../api/photos';
import { FootprintPhoto } from '../types';
import { BaseEntity, BaseRepository } from './base';

export interface PhotoRow extends BaseEntity {
  footprintId: string;
  localUri: string;
  serverId: string | null;
  s3Url: string | null;
  originalFilename: string | null;
  fileSize: number | null;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  orderIndex: number | null;
}

function rowToPhoto(row: PhotoRow): FootprintPhoto {
  return {
    id: row.id,
    footprintId: row.footprintId,
    localUri: row.localUri,
    serverId: row.serverId ?? undefined,
    s3Url: row.s3Url ?? undefined,
    originalFilename: row.originalFilename ?? undefined,
    fileSize: row.fileSize ?? undefined,
    mimeType: row.mimeType ?? undefined,
    width: row.width ?? undefined,
    height: row.height ?? undefined,
    orderIndex: row.orderIndex ?? undefined,
    syncStatus: row.syncStatus as 'pending' | 'synced',
  };
}

export class PhotoRepository extends BaseRepository<PhotoRow> {
  constructor(db: SQLite.SQLiteDatabase) {
    super(db, 'photos');
  }

  protected fromRow(row: Record<string, any>): PhotoRow {
    return row as PhotoRow;
  }

  async getByFootprintId(footprintId: string): Promise<FootprintPhoto[]> {
    const rows = await this.db.getAllAsync<PhotoRow>(
      `SELECT * FROM photos WHERE footprintId = ? AND deletedAt IS NULL ORDER BY orderIndex ASC, createdAt ASC`,
      [footprintId]
    );
    return rows.map(rowToPhoto);
  }

  async getPendingByFootprintId(footprintId: string): Promise<FootprintPhoto[]> {
    const rows = await this.db.getAllAsync<PhotoRow>(
      `SELECT * FROM photos WHERE footprintId = ? AND syncStatus = 'pending' AND deletedAt IS NULL`,
      [footprintId]
    );
    return rows.map(rowToPhoto);
  }

  async getAllPendingUploads(): Promise<FootprintPhoto[]> {
    const rows = await this.db.getAllAsync<PhotoRow>(
      `SELECT * FROM photos WHERE syncStatus = 'pending' AND serverId IS NULL AND deletedAt IS NULL ORDER BY footprintId, orderIndex ASC, createdAt ASC`
    );
    return rows.map(rowToPhoto);
  }

  async createPhoto(
    footprintId: string,
    localUri: string,
    orderIndex?: number
  ): Promise<FootprintPhoto> {
    const row = await this.create({
      footprintId,
      localUri,
      serverId: null,
      s3Url: null,
      originalFilename: null,
      fileSize: null,
      mimeType: null,
      width: null,
      height: null,
      orderIndex: orderIndex ?? null,
    } as Omit<PhotoRow, keyof BaseEntity>);
    return rowToPhoto(row);
  }

  async syncUploaded(
    id: string,
    serverData: {
      serverId: string;
      s3Url: string;
      originalFilename?: string;
      fileSize?: number;
      mimeType?: string;
      width?: number;
      height?: number;
      orderIndex?: number;
    }
  ): Promise<void> {
    await this.db.withTransactionAsync(async () => {
      await this.db.runAsync(
        `UPDATE photos SET
          serverId = ?, s3Url = ?, originalFilename = ?, fileSize = ?,
          mimeType = ?, width = ?, height = ?, orderIndex = ?,
          syncStatus = 'synced', updatedAt = datetime('now')
         WHERE id = ?`,
        [
          serverData.serverId,
          serverData.s3Url,
          serverData.originalFilename ?? null,
          serverData.fileSize ?? null,
          serverData.mimeType ?? null,
          serverData.width ?? null,
          serverData.height ?? null,
          serverData.orderIndex ?? null,
          id,
        ]
      );
      await this.db.runAsync(
        `DELETE FROM outbox WHERE domain = 'photos' AND dataId = ?`,
        [id]
      );
    });
  }

  async upsertFromServer(footprintId: string, photos: PhotoDetailItem[]): Promise<void> {
    for (const photo of photos) {
      if (!photo.clientId) continue;
      const serverId = String(photo.id);
      const existing = await this.db.getFirstAsync<PhotoRow>(
        `SELECT * FROM photos WHERE id = ? AND deletedAt IS NULL`,
        [photo.clientId]
      );
      if (existing) {
        if (existing.syncStatus === 'pending') continue;
        await this.db.runAsync(
          `UPDATE photos SET serverId=?, s3Url=?, originalFilename=?, fileSize=?, mimeType=?, width=?, height=?, orderIndex=?, syncStatus='synced', updatedAt=datetime('now') WHERE id=?`,
          [
            serverId,
            photo.s3Url,
            photo.originalFilename ?? null,
            photo.fileSize ?? null,
            photo.mimeType ?? null,
            photo.width ?? null,
            photo.height ?? null,
            photo.orderIndex ?? null,
            photo.clientId,
          ]
        );
      } else {
        await this.db.runAsync(
          `INSERT OR IGNORE INTO photos (id, footprintId, localUri, serverId, s3Url, originalFilename, fileSize, mimeType, width, height, orderIndex, createdAt, updatedAt, syncStatus, deletedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,datetime('now'),datetime('now'),'synced',NULL)`,
          [
            photo.clientId,
            footprintId,
            photo.s3Url,
            serverId,
            photo.s3Url,
            photo.originalFilename ?? null,
            photo.fileSize ?? null,
            photo.mimeType ?? null,
            photo.width ?? null,
            photo.height ?? null,
            photo.orderIndex ?? null,
          ]
        );
      }
    }
  }

  async deleteByFootprintId(footprintId: string): Promise<void> {
    const photos = await this.getByFootprintId(footprintId);
    await this.db.withTransactionAsync(async () => {
      await this.db.runAsync(
        `UPDATE photos SET deletedAt = datetime('now'), updatedAt = datetime('now') WHERE footprintId = ?`,
        [footprintId]
      );
      for (const photo of photos) {
        if (photo.serverId) {
          await this.db.runAsync(
            `INSERT OR REPLACE INTO outbox (id, domain, dataId, dataName, operation) VALUES (?, 'photos', ?, '', 'delete')`,
            [Crypto.randomUUID(), photo.id]
          );
        }
      }
    });
  }
}
