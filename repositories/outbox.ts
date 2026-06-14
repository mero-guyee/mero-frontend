import * as SQLite from 'expo-sqlite';

export interface OutboxEntry {
  id: string;
  domain: string;
  dataId: string;
  dataName: string;
  operation: string;
  status: 'pending' | 'failed';
  createdAt: string;
}

export class OutboxRepository {
  constructor(private db: SQLite.SQLiteDatabase) {}

  async getReady(domain: string): Promise<OutboxEntry[]> {
    return this.db.getAllAsync<OutboxEntry>(
      `SELECT * FROM outbox WHERE domain = ? AND status = 'pending' ORDER BY createdAt ASC`,
      [domain]
    );
  }

  async getAll(): Promise<OutboxEntry[]> {
    return this.db.getAllAsync<OutboxEntry>(
      `SELECT * FROM outbox ORDER BY domain, createdAt ASC`
    );
  }

  async markFailed(domain: string, dataId: string): Promise<void> {
    await this.db.runAsync(
      `UPDATE outbox SET status = 'failed' WHERE domain = ? AND dataId = ?`,
      [domain, dataId]
    );
  }

  async resetToReady(domain: string, dataId: string): Promise<void> {
    await this.db.runAsync(
      `UPDATE outbox SET status = 'pending' WHERE domain = ? AND dataId = ?`,
      [domain, dataId]
    );
  }

  async remove(domain: string, dataId: string): Promise<void> {
    await this.db.runAsync(`DELETE FROM outbox WHERE domain = ? AND dataId = ?`, [domain, dataId]);
  }
}
