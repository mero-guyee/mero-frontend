import * as Crypto from 'expo-crypto';
import { Directory, File, Paths } from 'expo-file-system';
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

export function resolveAbsoluteFileUri(storedUri: string): string {
  if (/^https?:\/\//.test(storedUri)) return storedUri;
  return new File(new Directory(Paths.document, 'documents'), storedUri).uri;
}

function rowToDocument(row: DocumentRow): TripDocument {
  return {
    id: row.id,
    serverId: row.serverId ?? undefined,
    tripId: row.tripId,
    fileName: row.fileName,
    fileUri: resolveAbsoluteFileUri(row.fileUri),
    fileSize: row.fileSize ?? undefined,
    syncStatus: row.syncStatus,
  };
}

export class DocumentRepository extends BaseRepository<DocumentRow> {
  constructor(db: SQLite.SQLiteDatabase) {
    super(db, 'documents');
  }

  protected fromRow(row: Record<string, any>): DocumentRow {
    return row as DocumentRow;
  }

  protected getDataName(entity: DocumentRow): string {
    return entity.fileName;
  }

  async findByTripId(tripId: string): Promise<TripDocument[]> {
    const rows = await this.db.getAllAsync<DocumentRow>(
      `SELECT * FROM documents WHERE tripId = ? AND deletedAt IS NULL ORDER BY createdAt DESC`,
      [tripId]
    );
    return rows.map(rowToDocument);
  }

  async getTripIdsWithDocuments(): Promise<Set<string>> {
    const rows = await this.db.getAllAsync<{ tripId: string }>(
      `SELECT DISTINCT tripId FROM documents WHERE deletedAt IS NULL`
    );
    return new Set(rows.map((r) => r.tripId));
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

  async deleteByTripId(tripId: string): Promise<void> {
    const rows = await this.db.getAllAsync<DocumentRow>(
      `SELECT * FROM documents WHERE tripId = ? AND deletedAt IS NULL`,
      [tripId]
    );
    for (const row of rows) {
      if (row.fileUri && !/^https?:\/\//.test(row.fileUri)) {
        const file = new File(new Directory(Paths.document, 'documents'), row.fileUri);
        if (file.exists) file.delete();
      }
    }
    await this.db.runAsync(
      `UPDATE documents SET deletedAt = datetime('now'), updatedAt = datetime('now'), syncStatus = 'pending' WHERE tripId = ?`,
      [tripId]
    );
  }

  async upsertFromServer(tripId: string, serverDoc: ServerTripDocument): Promise<void> {
    const serverIdStr = String(serverDoc.id);
    const existing = await this.db.getFirstAsync<DocumentRow>(
      `SELECT * FROM documents WHERE serverId = ? AND tripId = ? AND deletedAt IS NULL`,
      [serverIdStr, tripId]
    );
    if (existing) {
      await this.db.runAsync(
        `UPDATE documents SET fileName=?, fileSize=?, updatedAt=datetime('now'), syncStatus='synced' WHERE id=?`,
        [serverDoc.fileName, serverDoc.fileSize ?? null, existing.id]
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
