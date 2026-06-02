import * as SQLite from 'expo-sqlite';
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

  async createPhoto(footprintId: string, localUri: string, orderIndex?: number): Promise<FootprintPhoto> {
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

  async markUploaded(id: string, serverData: {
    serverId: string;
    s3Url: string;
    originalFilename?: string;
    fileSize?: number;
    mimeType?: string;
    width?: number;
    height?: number;
    orderIndex?: number;
  }): Promise<void> {
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
  }

  async deleteByFootprintId(footprintId: string): Promise<void> {
    await this.db.runAsync(
      `UPDATE photos SET deletedAt = datetime('now'), updatedAt = datetime('now') WHERE footprintId = ?`,
      [footprintId]
    );
  }
}
