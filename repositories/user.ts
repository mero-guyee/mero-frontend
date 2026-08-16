import * as SQLite from 'expo-sqlite';
import type { UserResponse } from '../api/auth';

const LOCAL_ID = 'me';

export interface UserRow {
  id: string;
  serverId: string;
  email: string;
  nickname: string;
  profileImage: string | null;
  thumbhash: string | null;
  createdAt: string;
  updatedAt: string;
}

export class UserRepository {
  constructor(private db: SQLite.SQLiteDatabase) {}

  async getUser(): Promise<UserRow | null> {
    return this.db.getFirstAsync<UserRow>(`SELECT * FROM users WHERE id = ?`, [LOCAL_ID]);
  }

  async upsertFromServer(user: UserResponse, thumbhash?: string | null): Promise<void> {
    const existing = await this.getUser();
    const resolvedThumbhash = thumbhash !== undefined ? thumbhash : (existing?.thumbhash ?? null);
    await this.db.runAsync(
      `INSERT OR REPLACE INTO users (id, serverId, email, nickname, profileImage, thumbhash, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        LOCAL_ID,
        String(user.id),
        user.email,
        user.nickname,
        user.profileImage ?? null,
        resolvedThumbhash,
        user.createdAt,
        new Date().toISOString(),
      ]
    );
  }

  async clear(): Promise<void> {
    await this.db.runAsync(`DELETE FROM users WHERE id = ?`, [LOCAL_ID]);
  }

  async updateNickname(nickname: string): Promise<void> {
    await this.db.runAsync(`UPDATE users SET nickname = ?, updatedAt = ? WHERE id = ?`, [
      nickname,
      new Date().toISOString(),
      LOCAL_ID,
    ]);
  }
}
