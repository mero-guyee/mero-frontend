import * as SQLite from 'expo-sqlite';

export const outboxKey = ['outbox'] as const;

const BASE_BACKOFF_SECONDS = 10;
const MAX_BACKOFF_SECONDS = 30 * 60;

export interface OutboxEntry {
  id: string;
  domain: string;
  dataId: string;
  dataName: string;
  operation: string;
  status: 'pending' | 'failed';
  createdAt: string;
  failCount: number;
  nextRetryAt: string;
}

export class OutboxRepository {
  constructor(private db: SQLite.SQLiteDatabase) {}

  async getReady(domain: string, maxAgeMinutes?: number): Promise<OutboxEntry[]> {
    const ageClause =
      maxAgeMinutes != null ? `AND createdAt >= datetime('now', '-${maxAgeMinutes} minutes')` : '';
    return this.db.getAllAsync<OutboxEntry>(
      `SELECT * FROM outbox WHERE domain = ? AND (
         (status = 'failed' AND nextRetryAt <= datetime('now'))
         OR (status = 'pending' ${ageClause})
       ) ORDER BY createdAt ASC`,
      [domain]
    );
  }

  async getAll(): Promise<OutboxEntry[]> {
    return this.db.getAllAsync<OutboxEntry>(`SELECT * FROM outbox ORDER BY domain, createdAt ASC`);
  }

  async count(): Promise<number> {
    const row = await this.db.getFirstAsync<{ cnt: number }>(`SELECT COUNT(*) as cnt FROM outbox`);
    return row?.cnt ?? 0;
  }

  async markFailed(domain: string, dataId: string): Promise<void> {
    const row = await this.db.getFirstAsync<{ failCount: number }>(
      `SELECT failCount FROM outbox WHERE domain = ? AND dataId = ?`,
      [domain, dataId]
    );
    const failCount = (row?.failCount ?? 0) + 1;
    const delaySeconds = Math.min(BASE_BACKOFF_SECONDS * 2 ** (failCount - 1), MAX_BACKOFF_SECONDS);
    await this.db.runAsync(
      `UPDATE outbox
       SET status = 'failed', failCount = ?, nextRetryAt = datetime('now', '+' || ? || ' seconds')
       WHERE domain = ? AND dataId = ?`,
      [failCount, delaySeconds, domain, dataId]
    );
  }

  async resetBackoff(domain: string, dataId: string): Promise<void> {
    await this.db.runAsync(
      `UPDATE outbox SET failCount = 0, nextRetryAt = datetime('now') WHERE domain = ? AND dataId = ?`,
      [domain, dataId]
    );
  }

  async remove(domain: string, dataId: string): Promise<void> {
    await this.db.runAsync(`DELETE FROM outbox WHERE domain = ? AND dataId = ?`, [domain, dataId]);
  }

  // for test. do not use in production.

  async clearAll(): Promise<void> {
    await this.db.runAsync(`DELETE FROM outbox`);
  }
}
