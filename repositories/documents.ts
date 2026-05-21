import * as Crypto from 'expo-crypto';
import * as SQLite from 'expo-sqlite';
import type { ServerTripDocument } from '../api/trips';
import { TripDocument, TripDocumentFile } from '../types';
import { BaseEntity, BaseRepository } from './base';

export interface DocumentRow extends BaseEntity {
  serverId?: string | null;
  tripId: string;
  fileName: string;
  fileUri: string;
  fileSize?: number | null;
}

function rowToDocument(row: DocumentRow): TripDocument {
  return {
    id: row.id,
    serverId: row.serverId ?? undefined,
    tripId: row.tripId,
    fileName: row.fileName,
    fileUri: row.fileUri,
    fileSize: row.fileSize ?? undefined,
  };
}

export class DocumentRepository extends BaseRepository<DocumentRow> {
  constructor(db: SQLite.SQLiteDatabase) {
    super(db, 'documents');
  }

  protected fromRow(row: Record<string, any>): DocumentRow {
    return row as DocumentRow;
  }

  async findByTripId(tripId: string): Promise<TripDocument[]> {
    const rows = await this.db.getAllAsync<DocumentRow>(
      `SELECT * FROM documents WHERE tripId = ? AND deletedAt IS NULL ORDER BY createdAt DESC`,
      [tripId]
    );
    return rows.map(rowToDocument);
  }

  async createDocument(tripId: string, data: TripDocumentFile): Promise<TripDocument> {
    const row = await this.create({
      tripId,
      fileName: data.fileName,
      fileUri: data.fileUri,
      fileSize: null,
      serverId: null,
    } as Omit<DocumentRow, keyof BaseEntity>);
    return rowToDocument(row);
  }

  async upsertFromServer(tripId: string, serverDoc: ServerTripDocument): Promise<void> {
    const serverIdStr = String(serverDoc.id);
    const existing = await this.db.getFirstAsync<DocumentRow>(
      `SELECT * FROM documents WHERE serverId = ? AND tripId = ? AND deletedAt IS NULL`,
      [serverIdStr, tripId]
    );
    if (existing) {
      await this.db.runAsync(
        `UPDATE documents SET fileName=?, fileUri=?, fileSize=?, updatedAt=datetime('now'), syncStatus='synced' WHERE id=?`,
        [serverDoc.fileName, serverDoc.fileUri, serverDoc.fileSize ?? null, existing.id]
      );
    } else {
      const id = Crypto.randomUUID();
      await this.db.runAsync(
        `INSERT INTO documents (id, serverId, tripId, fileName, fileUri, fileSize, createdAt, updatedAt, syncStatus, deletedAt) VALUES (?,?,?,?,?,?,datetime('now'),datetime('now'),'synced',NULL)`,
        [id, serverIdStr, tripId, serverDoc.fileName, serverDoc.fileUri, serverDoc.fileSize ?? null]
      );
    }
  }
}
