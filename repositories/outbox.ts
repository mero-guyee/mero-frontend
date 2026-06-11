import * as SQLite from 'expo-sqlite';

export interface OutboxEntry {
  id: string;
  domain: string;
  dataId: string;
  operation: string;
  createdAt: string;
}

export class OutboxRepository {
  constructor(private db: SQLite.SQLiteDatabase) {}

  async getReady(domain: string): Promise<OutboxEntry[]> {
    return this.db.getAllAsync<OutboxEntry>(
      `SELECT * FROM outbox WHERE domain = ? ORDER BY createdAt ASC`,
      [domain]
    );
  }

  async remove(domain: string, dataId: string): Promise<void> {
    await this.db.runAsync(`DELETE FROM outbox WHERE domain = ? AND dataId = ?`, [domain, dataId]);
  }
}
