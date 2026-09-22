import { ApiError } from '@/api/client';
import { memosApi } from '@/api/memos';
import { SyncingCallbacks } from '@/contexts/SyncingContext';
import { enqueueMutation } from '@/hooks/queries/mutationQueue';
import { MemoRepository, OutboxRepository, TripRepository } from '@/repositories';
import * as SQLite from 'expo-sqlite';

export async function syncMemos(
  db: SQLite.SQLiteDatabase,
  maxAgeMinutes?: number,
  syncing?: SyncingCallbacks
): Promise<boolean> {
  const repo = new MemoRepository(db);
  const tripRepo = new TripRepository(db);
  const outbox = new OutboxRepository(db);
  const ready = await outbox.getReady('memos', maxAgeMinutes);

  for (const { dataId, operation } of ready) {
    await enqueueMutation(dataId, async () => {
      syncing?.markSyncing(dataId);
      try {
        if (operation === 'create') {
          const memo = await repo.findById(dataId);
          if (!memo || memo.serverId || memo.deletedAt) {
            await outbox.remove('memos', dataId);
            return;
          }
          const trip = await tripRepo.findById(memo.tripId);
          if (!trip?.serverId) {
            return;
          }
          const serverMemo = await memosApi.create(parseInt(trip.serverId), {
            clientId: memo.id,
            title: memo.title,
            content: memo.content,
          });
          await repo.setServerId(memo.id, String(serverMemo.id));
          syncing?.markSyncingSucceeded(dataId);
        } else if (operation === 'update') {
          const memo = await repo.findById(dataId);
          if (!memo?.serverId) {
            await outbox.remove('memos', dataId);
            return;
          }
          const trip = await tripRepo.findById(memo.tripId);
          if (!trip?.serverId) {
            return;
          }
          await memosApi.update(parseInt(trip.serverId), parseInt(memo.serverId), {
            title: memo.title,
            content: memo.content,
          });
          await repo.markSynced(dataId);
          syncing?.markSyncingSucceeded(dataId);
        } else if (operation === 'delete') {
          const memo = await repo.findByIdIncludeDeleted(dataId);
          if (!memo?.serverId) {
            await outbox.remove('memos', dataId);
            return;
          }
          const trip = await tripRepo.findById(memo.tripId);
          if (!trip?.serverId) {
            return;
          }
          await memosApi.delete(parseInt(trip.serverId), parseInt(memo.serverId));
          await outbox.remove('memos', dataId);
        }
      } catch (e) {
        if (operation === 'delete' && e instanceof ApiError && e.status === 404) {
          await outbox.remove('memos', dataId);
          syncing?.markSyncingSucceeded(dataId);
        } else {
          await outbox.markFailed('memos', dataId);
          syncing?.markSyncingFailed(dataId);
        }
      } finally {
        syncing?.unmarkSyncing(dataId);
      }
    });
  }

  return ready.length > 0;
}
