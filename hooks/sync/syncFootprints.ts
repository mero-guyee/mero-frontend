import { ApiError } from '@/api/client';
import { footprintsApi } from '@/api/footprints';
import { SyncingCallbacks } from '@/contexts/SyncingContext';
import { enqueueMutation } from '@/hooks/queries/mutationQueue';
import { FootprintRepository, OutboxRepository, TripRepository } from '@/repositories';
import * as SQLite from 'expo-sqlite';

export async function syncFootprints(
  db: SQLite.SQLiteDatabase,
  maxAgeMinutes?: number,
  syncing?: SyncingCallbacks
): Promise<boolean> {
  const repo = new FootprintRepository(db);
  const tripRepo = new TripRepository(db);
  const outbox = new OutboxRepository(db);
  const ready = await outbox.getReady('footprints', maxAgeMinutes);

  for (const { dataId, operation } of ready) {
    await enqueueMutation(dataId, async () => {
      syncing?.markSyncing(dataId);
      try {
        if (operation === 'create') {
          const footprint = await repo.findById(dataId);
          if (!footprint || footprint.serverId || footprint.deletedAt) {
            await outbox.remove('footprints', dataId);
            return;
          }
          const trip = await tripRepo.findById(footprint.tripId);
          if (!trip?.serverId) {
            return;
          }
          const serverFootprint = await footprintsApi.create(parseInt(trip.serverId), {
            clientId: footprint.id,
            title: footprint.title,
            content: footprint.content,
            date: footprint.date,
            locations:
              typeof footprint.locations === 'string'
                ? JSON.parse(footprint.locations)
                : footprint.locations,
          });
          await repo.setServerId(footprint.id, String(serverFootprint.id));
          syncing?.markSyncingSucceeded(dataId);
        } else if (operation === 'update') {
          const footprint = await repo.findById(dataId);
          if (!footprint?.serverId) {
            await outbox.remove('footprints', dataId);
            return;
          }
          const trip = await tripRepo.findById(footprint.tripId);
          if (!trip?.serverId) {
            return;
          }
          await footprintsApi.update(parseInt(trip.serverId), parseInt(footprint.serverId), {
            title: footprint.title,
            content: footprint.content,
            date: footprint.date,
            locations:
              typeof footprint.locations === 'string'
                ? JSON.parse(footprint.locations)
                : footprint.locations,
          });
          await repo.markSynced(dataId);
          syncing?.markSyncingSucceeded(dataId);
        } else if (operation === 'delete') {
          const footprint = await repo.findByIdIncludeDeleted(dataId);
          if (!footprint?.serverId) {
            await outbox.remove('footprints', dataId);
            return;
          }
          const trip = await tripRepo.findById(footprint.tripId);
          if (!trip?.serverId) {
            return;
          }
          await footprintsApi.delete(parseInt(trip.serverId), parseInt(footprint.serverId));
          await outbox.remove('footprints', dataId);
        }
      } catch (e) {
        if (operation === 'delete' && e instanceof ApiError && e.status === 404) {
          await outbox.remove('footprints', dataId);
          syncing?.markSyncingSucceeded(dataId);
        } else {
          await outbox.markFailed('footprints', dataId);
          syncing?.markSyncingFailed(dataId);
        }
      } finally {
        syncing?.unmarkSyncing(dataId);
      }
    });
  }

  return ready.length > 0;
}
