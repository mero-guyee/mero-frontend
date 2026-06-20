import { memosApi } from '@/api/memos';
import { MemoRepository, OutboxRepository, TripRepository } from '@/repositories';
import * as SQLite from 'expo-sqlite';

export async function syncMemos(db: SQLite.SQLiteDatabase): Promise<void> {
  const repo = new MemoRepository(db);
  const tripRepo = new TripRepository(db);
  const outbox = new OutboxRepository(db);
  const ready = await outbox.getReady('memos');

  for (const { dataId, operation } of ready) {
    try {
      if (operation === 'create') {
        const memo = await repo.findById(dataId);
        if (!memo || memo.serverId || memo.deletedAt) {
          await outbox.remove('memos', dataId);
          continue;
        }
        const trip = await tripRepo.findById(memo.tripId);
        if (!trip?.serverId) continue;
        const serverMemo = await memosApi.create(parseInt(trip.serverId), {
          clientId: memo.id,
          title: memo.title,
          content: memo.content,
        });
        await repo.setServerId(memo.id, String(serverMemo.id));
      } else if (operation === 'update') {
        const memo = await repo.findById(dataId);
        if (!memo?.serverId) {
          await outbox.remove('memos', dataId);
          continue;
        }
        const trip = await tripRepo.findById(memo.tripId);
        if (!trip?.serverId) continue;
        await memosApi.update(parseInt(trip.serverId), parseInt(memo.serverId), {
          title: memo.title,
          content: memo.content,
        });
        await repo.markSynced(dataId);
      } else if (operation === 'delete') {
        const memo = await repo.findByIdIncludeDeleted(dataId);
        if (!memo?.serverId) {
          await outbox.remove('memos', dataId);
          continue;
        }
        const trip = await tripRepo.findById(memo.tripId);
        if (!trip?.serverId) continue;
        await memosApi.delete(parseInt(trip.serverId), parseInt(memo.serverId));
        await outbox.remove('memos', dataId);
      }
    } catch {
      await outbox.markFailed('memos', dataId);
    }
  }
}
