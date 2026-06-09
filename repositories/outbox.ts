import * as SQLite from 'expo-sqlite';

const RETRY_DELAYS_MS = [1, 2, 5, 15].map((m) => m * 60 * 1000);

export interface OutboxEntry {
  id: string;
  domain: string;
  dataId: string;
  operation: string;
  retryCount: number;
  nextRetryAt: string;
  createdAt: string;
}

export class OutboxRepository {
  constructor(private db: SQLite.SQLiteDatabase) {}

  async getReady(domain: string): Promise<OutboxEntry[]> {
    return this.db.getAllAsync<OutboxEntry>(
      `SELECT * FROM outbox WHERE domain = ? AND nextRetryAt <= datetime('now') ORDER BY createdAt ASC`,
      [domain]
    );
  }

  async remove(domain: string, dataId: string): Promise<void> {
    await this.db.runAsync(`DELETE FROM outbox WHERE domain = ? AND dataId = ?`, [domain, dataId]);
  }

  async incrementRetry(domain: string, dataId: string): Promise<void> {
    const row = await this.db.getFirstAsync<{ retryCount: number }>(
      `SELECT retryCount FROM outbox WHERE domain = ? AND dataId = ?`,
      [domain, dataId]
    );
    if (!row) return;

    const delayMs = RETRY_DELAYS_MS[Math.min(row.retryCount, RETRY_DELAYS_MS.length - 1)];
    const nextRetryAt = new Date(Date.now() + delayMs).toISOString();

    await this.db.runAsync(
      `UPDATE outbox SET retryCount = retryCount + 1, nextRetryAt = ? WHERE domain = ? AND dataId = ?`,
      [nextRetryAt, domain, dataId]
    );
  }
}
