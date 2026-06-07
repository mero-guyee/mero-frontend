import { memosApi } from '@/api/memos';
import { MemoRepository, TripRepository } from '@/repositories';
import * as SQLite from 'expo-sqlite';

export async function syncMemos(db: SQLite.SQLiteDatabase): Promise<void> {
  const repo = new MemoRepository(db);
  const tripRepo = new TripRepository(db);
  const pending = await repo.getPending();
  const unsynced = pending.filter((m) => !m.serverId && !m.deletedAt);

  await Promise.all(
    unsynced.map(async ({ id, tripId, title, content }) => {
      try {
        const trip = await tripRepo.findById(tripId);
        if (!trip?.serverId) return;

        const serverMemo = await memosApi.create(parseInt(trip.serverId), {
          clientId: id,
          title,
          content,
        });
        await repo.setServerId(id, String(serverMemo.id));
      } catch {}
    })
  );
}
